from ultralytics import YOLO
import cv2
import gc

model = YOLO("yolov8n.pt")
model.to("cpu")

def detect_phone(image):

    try:

        if image is None:
            return {
                "phone_detected": False,
                "detections": []
            }

        image = cv2.resize(image, (224, 224))

        results = model.predict(
            source=image,
            imgsz=224,
            conf=0.35,
            verbose=False,
            device="cpu"
        )

        detections = []
        phone_detected = False

        for result in results:

            for box in result.boxes:

                cls = int(box.cls[0])

                label = model.names[cls]

                confidence = float(box.conf[0])

                if label == "cell phone":

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

        del results
        gc.collect()

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