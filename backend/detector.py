from ultralytics import YOLO
import cv2
import os

MODEL_PATH = "yolov8n.pt"

try:
    model = YOLO(MODEL_PATH)
    model.to("cpu")
    print("YOLO loaded")

except Exception as e:

    print("Model load failed:", e)

    if os.path.exists(MODEL_PATH):
        os.remove(MODEL_PATH)

    model = YOLO("yolov8n.pt")
    model.to("cpu")

    print("Fresh model downloaded")


def detect_phone(image):

    try:

        if image is None:
            return {
                "phone_detected": False,
                "detections": []
            }

        image = cv2.resize(
            image,
            (320, 240)
        )

        results = model(
            image,
            imgsz=320,
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

        return {
            "phone_detected": phone_detected,
            "detections": detections
        }

    except Exception as e:

        print("Detection error:", e)

        return {
            "phone_detected": False,
            "detections": [],
            "error": str(e)
        }