import tensorflow as tf
from model.inference import predict
# import numpy as np
# import pandas as pd
# from sklearn.model_selection import train_test_split
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
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

# Setting the credentials
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = './test_creds.json'

ACCURACY_THRESHOLD = 0.98
EPOCHS = 200

np.set_printoptions(suppress=True)


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


def get_features(image):
    image_google = vision.Image(content=image)
    dimensions = localize_objects(image_google)

    image = Image.open(BytesIO(image))
    cropped_image = crop_image(image, dimensions)
    matte_image = inference.predict(
        cropped_image, "./shadow/", "model/modnet_photographic_portrait_matting.ckpt", None)
    combined = combined_display(cropped_image, matte_image)
    combined_google = treat_image(combined)
    return detect_properties(combined_google)


def get_encoders():
    return pickle.load(open("model/MinMaxScaler.pkl", "rb")), pickle.load(open("model/LabelEncoder.pkl", "rb"))


def treat_prod_data(image, data):
    # retrieving and treating each image
    treatedData = []
    color_features = get_features(image)
    color_features = np.array(color_features).flatten()
    treatedData.append(np.concatenate(
        (color_features, [data['lat'], data['lng']]), axis=0))

    # loading the encoders
    feature_scaler, _ = get_encoders()
    print(feature_scaler)
    print(treatedData)
    # transforming the data as appropriate and returning it
    treatedData = feature_scaler.transform(treatedData)
    return treatedData


def treat_new_data(config_path, data):
    pass


def predict_image(image, data):
    # Recreate the exact same model, including its weights and the optimizer
    new_model = tf.keras.models.load_model('model/trained/current.h5')

    # treat the data and anlayze the image
    treatedData = treat_prod_data(image, data)
    prediction = new_model.predict(treatedData)
    _, label_encoder = get_encoders()

    output = label_encoder.inverse_transform([np.argmax(prediction)])
    return output[0]


with io.open("training/cheeto-1.png", 'rb') as image_file:
    content = image_file.read()
predict_image(content, {"lat": 38.5369722669077,
                        "lng": -121.75092535602036})
