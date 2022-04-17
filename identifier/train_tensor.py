from distutils.command.config import config
import tensorflow as tf
from identifier.model.inference import predict
# import numpy as np
# import pandas as pd
# from sklearn.model_selection import train_test_split
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
# from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
# from tensorflow import get_logger
# import multiprocessing as mp
# import scipy.io
# import matplotlib.pylab as plt
# import seaborn as sns

# using info from
# https://cloud.google.com/vision/docs/detecting-properties
# https://cloud.google.com/vision/docs/labels

from google.cloud import vision
import io
import os
import math
import pandas as pd
from PIL import Image
from io import BytesIO
import model.inference as inference
from sklearn.preprocessing import MinMaxScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import numpy as np
import pickle
import json

ACCURACY_THRESHOLD = 0.98
EPOCHS = 200

class myCallback(tf.keras.callbacks.Callback):
    def on_epoch_end(self, epoch, logs={}):
        if(logs.get('accuracy') > ACCURACY_THRESHOLD):
            print(f"\nReached {ACCURACY_THRESHOLD} accuracy on epoch number {epoch}, stopping training")
            self.model.stop_training = True

np.set_printoptions(suppress=True)


# Setting the credentials
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = './test_creds.json'
SAVE_MODE = True

# dowload the pre-trained ckpt for image matting
pretrained_ckpt = 'model/modnet_photographic_portrait_matting.ckpt'
if not os.path.exists(pretrained_ckpt):
    raise "error, model not imported"


def detect_properties(image):
    """Detects image properties in the file."""
    client = vision.ImageAnnotatorClient()
    image = vision.Image(content=image)
    response = client.image_properties(image=image, max_results=25)
    props = response.image_properties_annotation
    props.dominant_colors.colors.sort(
        key=lambda x: x.pixel_fraction, reverse=True)

    if response.error.message:
        raise Exception(
            '{}\nFor more info on error messages, check: '
            'https://cloud.google.com/apis/design/errors'.format(
                response.error.message))
    return [[color.pixel_fraction, color.color.red, color.color.green, color.color.blue] for color in props.dominant_colors.colors[:3]]


def localize_objects(image):
    cats = []
    client = vision.ImageAnnotatorClient()
    objects = client.object_localization(
        image=image).localized_object_annotations
    for object_ in objects:
        if object_.name != "Cat":
            continue
        cats.append([[vertex.x, vertex.y]
                    for vertex in object_.bounding_poly.normalized_vertices])
    return cats[0]


def crop_image(image, dimensions):
    x_min, x_max, y_min, y_max = 1, 0, 1, 0
    for dimension in dimensions:
        x_min, x_max, y_min, y_max = min(x_min, dimension[0]), max(
            x_max, dimension[0]), min(y_min, dimension[1]), max(y_max, dimension[1])
    x_pixels, y_pixels = image.size
    crop_dimensions = (math.floor(x_min * x_pixels), math.floor(y_min * y_pixels),
                       math.ceil(x_max * x_pixels), math.ceil(y_max * y_pixels))
    cropped = image.crop(crop_dimensions)
    return cropped


def combined_display(image, matte, comb=False):
    # calculate display resolution
    w, h = image.width, image.height
    rw, rh = 800, int(h * 800 / (3 * w))

    # obtain predicted foreground
    image = np.asarray(image)

    # check for different image formats
    if len(image.shape) == 2:
        image = image[:, :, None]
    if image.shape[2] == 1:
        image = np.repeat(image, 3, axis=2)
    elif image.shape[2] == 4:
        image = image[:, :, 0:3]

    matte = np.repeat(np.asarray(matte)[:, :, None], 3, axis=2) / 255
    foreground = image * matte + np.full(image.shape, 255) * (1 - matte)

    # check if all images are desired for return
    if comb:
        combined = np.concatenate((image, foreground, matte * 255), axis=1)
        combined = Image.fromarray(np.uint8(combined)).resize((rw, rh))
        return combined
    else:
        # combine image, foreground, and alpha into one line
        extracted = Image.fromarray(np.uint8(foreground))
        return extracted


def treat_image(image):
    # Create in-memory jepg of edited image for Google Cloud Vision
    buffer = BytesIO()
    image.save(buffer, format="jpeg")
    return buffer.getvalue()


def get_features(path):
    with io.open(path, 'rb') as image_file:
        content = image_file.read()
    image_google = vision.Image(content=content)
    dimensions = localize_objects(image_google)

    image = Image.open(path)
    cropped_image = crop_image(image, dimensions)
    matte_image = inference.predict(
        cropped_image, "./shadow/", "model/modnet_photographic_portrait_matting.ckpt", path)
    combined = combined_display(cropped_image, matte_image)
    if SAVE_MODE:
        combined.save(os.path.join(
            "./output/", f"{path.split('/')[-1]}_extracted.png"))
    combined_google = treat_image(combined)
    return detect_properties(combined_google)


def save_encoders(feature_encoder, label_encoder):
    for encoder in [feature_encoder, label_encoder]:
        with open(f"model/{encoder.__class__.__name__}.pkl", "wb") as f:
            pickle.dump(encoder, f)


def treat_training_data(config_path):
    # check if data already processed
    if os.path.exists("foo.csv") or os.path.exists("moo.csv"):
        feature_data = pd.read_csv('foo.csv', sep=',',header=None).to_numpy()
        label_data = pd.read_csv('moo.csv', sep=',',header=None).to_numpy()
        return feature_data, label_data.flatten()

    # getting the manifest
    file = open(config_path, 'r')
    data = json.load(file)

    # retrieving and treating each image
    treatedData, labels = [], []
    for cat in data['cats']:
        color_features = get_features(f"training/{cat['filename']}.png")
        color_features = np.array(color_features).flatten()
        treatedData.append(np.concatenate(
            (color_features, [cat['lat'], cat['lng']]), axis=0))
        labels.append(cat['catname'])

    # encode the data
    feature_scaler = MinMaxScaler()
    label_encoder = LabelEncoder()
    treatedData = feature_scaler.fit_transform(treatedData)
    labels = label_encoder.fit_transform(labels)

    # save the encoders and return treated data
    save_encoders(feature_scaler, label_encoder)
    return treatedData, labels

def create_callback(early=False, patience=10, min_delta=0.0001):
    callback = [ModelCheckpoint('model/trained/current.h5', verbose=0,
        save_best_only=False, save_weights_only=False, save_freq='epoch')]
    callback.append(myCallback())
    if early:
        callback.append(EarlyStopping(monitor='loss', min_delta=0.0001, patience=5, verbose=1))
    return callback

def train_model(feature_train, label_train, feature_test, label_test, early_stop=False):
    model = Sequential()
    model.add(Dense(12, activation='relu', input_dim=feature_train.shape[1]))
    model.add(Dense(24, activation='relu'))
    model.add(Dense(24, activation='relu'))
    model.add(Dense(24, activation='relu'))
    model.add(Dense(18, activation='relu'))
    model.add(Dense(3, activation='sigmoid'))
    model.compile(loss='sparse_categorical_crossentropy', optimizer='adam', metrics=['accuracy'])
    # creating callback, which stops if not improved by min_delta in patience epochs
    callback = create_callback()
    # training the recurrent neural network
    model.fit(feature_train, label_train, epochs=50, batch_size=4, verbose=1, callbacks=callback, validation_data=(feature_test, label_test))
    # predicting using trained model
    predictions = model.predict(feature_test)
    predictions = np.array([np.argmax(pred) for pred in predictions])
    predictions = predictions.flatten().tolist()
    # evaluating accuracy of the model
    accuracy = accuracy_score(label_test, predictions)
    print(f"Accuracy: {accuracy}")
    # saving the model
    model.save('model/trained/current.h5')


def driver_function(config_path):
    features, labels = treat_training_data(config_path)
    feature_train, feature_test, label_train, label_test = train_test_split(
        features, labels, test_size=0.2)
    train_model(feature_train, label_train, feature_test, label_test)
    pass

# driver_function("training/manifest.json")
driver_function("training/cat_1.png")