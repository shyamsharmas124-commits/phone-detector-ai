from ultralytics import YOLO
import cv2
import numpy as np

model = YOLO("yolov8n.pt")


def detect_phone(image):
    results = model(image)

    phone_detected = False
    detections = []

    for result in results:
        boxes = result.boxes

        for box in boxes:
            cls = int(box.cls[0])
            label = model.names[cls]
            confidence = float(box.conf[0])

            if label == "cell phone" and confidence > 0.5:
                phone_detected = True

                x1, y1, x2, y2 = map(int, box.xyxy[0])

                detections.append({
                    "label": label,
                    "confidence": confidence,
                    "box": [x1, y1, x2, y2]
                })

    return {
        "phone_detected": phone_detected,
        "detections": detections
    }