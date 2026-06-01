from flask import Flask, request, jsonify
from flask_cors import CORS
from detector import detect_phone
import cv2
import numpy as np
import base64
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

        data = request.json

        if not data or "image" not in data:
            return jsonify({
                "error": "No image provided"
            }), 400

        image_data = data["image"]

        encoded_data = image_data.split(",")[1]

        nparr = np.frombuffer(
            base64.b64decode(encoded_data),
            np.uint8
        )

        img = cv2.imdecode(
            nparr,
            cv2.IMREAD_COLOR
        )

        result = detect_phone(img)

        return jsonify(result)

    except Exception as e:

        print("ERROR:", str(e))
        traceback.print_exc()

        return jsonify({
            "error": str(e)
        }), 500