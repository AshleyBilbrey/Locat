# import tensorflow as tf
# import numpy as np
# import pandas as pd
# from sklearn.model_selection import train_test_split
# from tensorflow.keras.models import Sequential
# from tensorflow.keras.layers import Dense
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
from PIL import Image
import model.inference as inference

# Setting the credentials
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = './test_creds.json'

# dowload the pre-trained ckpt for image matting
pretrained_ckpt = 'model/modnet_photographic_portrait_matting.ckpt'
if not os.path.exists(pretrained_ckpt):
    raise "error, model not imported"


def detect_properties(image):
    """Detects image properties in the file."""
    client = vision.ImageAnnotatorClient()

    response = client.image_properties(image=image, max_results=25)
    props = response.image_properties_annotation
    props.dominant_colors.colors.sort(
        key=lambda x: x.pixel_fraction, reverse=True)

    if response.error.message:
        raise Exception(
            '{}\nFor more info on error messages, check: '
            'https://cloud.google.com/apis/design/errors'.format(
                response.error.message))
    return [[color.pixel_fraction, color.color.red, color.color.green, color.color.blue] for color in props.dominant_colors.colors[:5]]


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


def get_features(path):
    with io.open(path, 'rb') as image_file:
        content = image_file.read()
    image_google = vision.Image(content=content)
    dimensions = localize_objects(image_google)

    image = Image.open(path)
    cropped_image = crop_image(image, dimensions)
    matte_image = inference.predict(
        cropped_image, "./", "model/modnet_photographic_portrait_matting.ckpt")
    # # image_googlee = vision.Image(content=matte_image.getvalue())
    # # if true:
    # matte_image.show()
    # # colors = detect_properties(image_googlee)
    # # print(colors)


# get_features("data/cheeto/cheeto.jpeg")
get_features("test_data/cheeto/cheeto_1.jpeg")
# get_features("data/cheeto/cheeto_2.jpeg")
# get_features("data/compost/persian.jpeg")
