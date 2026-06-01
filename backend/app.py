from flask import Flask, request, jsonify
from flask_cors import CORS
from detector import detect_phone
import cv2
import numpy as np
import base64
import os
import traceback

app = Flask(__name__)

CORS(
    app,
    origins=[
        "https://phonedetectorai.vercel.app"
    ]
)

@app.route("/")
def home():
    return jsonify({
        "status": "running",
        "message": "Phone Detector API"
    })


@app.route("/detect", methods=["POST"])
def detect():

    try:

        print("Request received")

        data = request.json

        if not data:
            return jsonify({
                "error": "No JSON data"
            }), 400

        if "image" not in data:
            return jsonify({
                "error": "No image provided"
            }), 400

        image_data = data["image"]

        print("Image received")

        encoded_data = image_data.split(",")[1]

        nparr = np.frombuffer(
            base64.b64decode(encoded_data),
            np.uint8
        )

        img = cv2.imdecode(
            nparr,
            cv2.IMREAD_COLOR
        )

        if img is None:
            return jsonify({
                "error": "Image decode failed"
            }), 400

        print("Running AI detection")

        result = detect_phone(img)

        print("Detection completed")

        return jsonify(result)

    except Exception as e:

        print("========== ERROR ==========")
        print(str(e))
        traceback.print_exc()
        print("===========================")

        return jsonify({
            "error": str(e)
        }), 500


if __name__ == "__main__":

    PORT = int(os.environ.get("PORT", 5000))

    app.run(
        host="0.0.0.0",
        port=PORT
    )