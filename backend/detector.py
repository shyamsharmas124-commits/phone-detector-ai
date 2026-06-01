from ultralytics import YOLO
import cv2
import numpy as np
import os

MODEL_PATH = "yolov8n.pt"

try:
    model = YOLO(MODEL_PATH)
    model.to("cpu")

    print("YOLO model loaded successfully")

except Exception as e:

    print(f"Model loading failed: {e}")

    if os.path.exists(MODEL_PATH):
        os.remove(MODEL_PATH)

    model = YOLO("yolov8n.pt")
    model.to("cpu")

    print("Fresh YOLO model downloaded")


def detect_phone(image):

    try:

        if image is None:
            return {
                "phone_detected": False,
                "detections": [],
                "error": "Invalid image"
            }

        image = cv2.resize(image, (640, 480))
        results = model(
            image,
            verbose=False
        )

        phone_detected = False
        detections = []

        for result in results:
            boxes = result.boxes
            for box in boxes:
                cls = int(box.cls[0])
                label = model.names[cls]
                confidence = float(box.conf[0])

                print(
                    f"Detected: {label} "
                    f"(confidence: {confidence:.2f})"
                )

                if (
                    label == "cell phone"
                    and confidence > 0.35
                ):

                    phone_detected = True

                    x1, y1, x2, y2 = map(
                        int,
                        box.xyxy[0]
                    )

                    detections.append({
                        "label": label,
                        "confidence": round(confidence, 2),
                        "box": [x1, y1, x2, y2]
                    })

        result_data = {
            "phone_detected": phone_detected,
            "detections": detections
        }

        print("Returning result:", result_data)

        return result_data

    except Exception as e:

        print("YOLO Detection Error:", str(e))

        return {
            "phone_detected": False,
            "detections": [],
            "error": str(e)
        }