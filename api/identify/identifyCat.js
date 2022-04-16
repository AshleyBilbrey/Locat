// Imports the Google Cloud client library
import { ImageAnnotatorClient } from "@google-cloud/vision";

const identifyCat = async () => {
    // Creates a client
    const client = new ImageAnnotatorClient();

    // Performs label detection on the image file
    const [result] = await client.labelDetection("./api/identify/cat.jpeg");
    const labels = result.labelAnnotations;
    console.log("Labels:");
    labels.forEach((label) => console.log(label.description));
    return labels;
};

export default identifyCat;
