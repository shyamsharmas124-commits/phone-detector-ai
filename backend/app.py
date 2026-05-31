from flask import Flask, request, jsonify
from flask_cors import CORS
from detector import detect_phone
import cv2
import numpy as np
import base64
import os

app = Flask(__name__)

# Allowed frontend origins
ALLOWED_ORIGINS = [
    "https://phone-detector-ai.vercel.app",
]

# Enable CORS properly
CORS(
    app,
    resources={
        r"/*": {
            "origins": ALLOWED_ORIGINS,
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type"]
        }
    }
)

# Handle preflight requests
@app.before_request
def handle_options():
    if request.method == "OPTIONS":
        response = jsonify({"status": "ok"})
        response.headers.add("Access-Control-Allow-Origin", request.headers.get("Origin", "*"))
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        response.headers.add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        return response, 200


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

        # Remove base64 header
        encoded_data = image_data.split(",")[1]

        # Decode image
        nparr = np.frombuffer(
            base64.b64decode(encoded_data),
            np.uint8
        )

        img = cv2.imdecode(
            nparr,
            cv2.IMREAD_COLOR
        )

        # Run AI detection
        result = detect_phone(img)

        response = jsonify(result)

        # Add CORS headers manually
        response.headers.add(
            "Access-Control-Allow-Origin",
            request.headers.get("Origin", "*")
        )

        return response

    except Exception as e:
        print("Detection Error:", str(e))

        return jsonify({
            "error": str(e)
        }), 500


if __name__ == "__main__":

    PORT = int(os.environ.get("PORT", 5000))

    app.run(
        host="0.0.0.0",
        port=PORT
    )