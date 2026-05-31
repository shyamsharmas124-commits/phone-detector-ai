from flask import Flask, request, jsonify
from flask_cors import CORS
from detector import detect_phone
import cv2
import numpy as np
import base64
import os

app = Flask(__name__)
CORS(app)

# Get port from environment variable, default to 5000 for local development
PORT = int(os.environ.get("PORT", 5000))


@app.route("/")
def home():
    return jsonify({"status": "running", "message": "Phone Detector API"})


@app.route("/detect", methods=["POST"])
def detect():
    data = request.json

    image_data = data["image"]

    encoded_data = image_data.split(',')[1]

    nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)

    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    result = detect_phone(img)

    return jsonify(result)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))