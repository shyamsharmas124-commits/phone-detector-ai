import os
import sys
import base64
import traceback
import cv2
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

# Ensure current directory is in sys.path for local module imports
_backend_dir = os.path.dirname(os.path.abspath(__file__))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

try:
    from detector import detect_phone
except ImportError:
    from backend.detector import detect_phone

app = Flask(__name__)

# Enable CORS for all routes and local / production origins
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "running",
        "service": "Phone Detector AI API",
        "version": "2.0.0",
        "mode": "ultra-fast-local"
    })

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200

@app.route("/detect", methods=["POST"])
def detect():
    try:
        img = None
        conf = 0.45
        imgsz = 384
        model_type = "small"

        # Read optional query parameters
        if "conf" in request.args:
            try:
                conf = float(request.args.get("conf"))
            except (ValueError, TypeError):
                pass

        if "imgsz" in request.args:
            try:
                imgsz = int(request.args.get("imgsz"))
            except (ValueError, TypeError):
                pass

        if "model" in request.args:
            model_type = request.args.get("model", "small").lower()

        # Case 1: Binary Image Payload (e.g., Content-Type: image/jpeg or application/octet-stream)
        content_type = request.content_type or ""
        if "image/" in content_type or "octet-stream" in content_type:
            raw_bytes = request.get_data()
            if raw_bytes:
                nparr = np.frombuffer(raw_bytes, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # Case 2: JSON Payload with Base64 Image
        if img is None and request.is_json:
            data = request.get_json(silent=True) or {}
            if "conf" in data:
                try:
                    conf = float(data["conf"])
                except (ValueError, TypeError):
                    pass
            if "imgsz" in data:
                try:
                    imgsz = int(data["imgsz"])
                except (ValueError, TypeError):
                    pass
            if "model" in data:
                model_type = str(data["model"]).lower()

            image_data = data.get("image", "")
            if image_data:
                if "," in image_data:
                    image_data = image_data.split(",", 1)[1]
                
                decoded = base64.b64decode(image_data)
                nparr = np.frombuffer(decoded, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # Case 3: Form-data / Multipart upload
        if img is None and "file" in request.files:
            file = request.files["file"]
            raw_bytes = file.read()
            if raw_bytes:
                nparr = np.frombuffer(raw_bytes, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return jsonify({
                "error": "No valid image data provided. Send raw JPEG bytes or JSON with base64 image."
            }), 400

        result = detect_phone(img, conf_threshold=conf, imgsz=imgsz, model_type=model_type)
        return jsonify(result)

    except Exception as e:
        print("API Error:", str(e))
        traceback.print_exc()
        return jsonify({
            "phone_detected": False,
            "error": str(e)
        }), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    host = os.environ.get("HOST", "0.0.0.0")

    print("\n" + "=" * 55)
    print(" 🚀 Phone Detector AI - Ultra Fast Inference Server")
    print("=" * 55)
    print(f" Backend URL:  http://127.0.0.1:{port}")
    print(f" Frontend App: http://localhost:8000")
    print("=" * 55 + "\n")

    app.run(host=host, port=port, debug=False, threaded=True)