from ultralytics import YOLO
import cv2
import numpy as np
import os

# Auto-download model if corrupted or missing
MODEL_PATH = "yolov8n.pt"
try:
    model = YOLO(MODEL_PATH)
except Exception as e:
    print(f"Model loading failed: {e}")
    print("Downloading fresh YOLOv8 model...")
    if os.path.exists(MODEL_PATH):
        os.remove(MODEL_PATH)
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
            
            # Print detection
            print(f"Detected: {label} (confidence: {confidence:.2f})")

            if label == "cell phone" and confidence > 0.3:
                phone_detected = True
                print(f"Phone detected: {label} confidence {confidence:.2f}")

                x1, y1, x2, y2 = map(int, box.xyxy[0])

                detections.append({
                    "label": label,
                    "confidence": confidence,
                    "box": [x1, y1, x2, y2]
                })

    result_data = {
        "phone_detected": phone_detected,
        "detections": detections
    }
    
    if phone_detected:
        print(f"Returning: {result_data}")
    
    return result_data