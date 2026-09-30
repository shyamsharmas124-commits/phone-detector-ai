import os
import time
import cv2
import numpy as np
import torch
from ultralytics import YOLO

# Optimize PyTorch CPU threading
if not torch.cuda.is_available():
    num_threads = min(os.cpu_count() or 4, 8)
    torch.set_num_threads(num_threads)
    print(f"PyTorch CPU threads: {num_threads}")

device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using compute device: {device}")

# Model paths
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
SMALL_MODEL_PATH = os.path.join(BACKEND_DIR, "yolov8s.pt")
NANO_MODEL_PATH = os.path.join(BACKEND_DIR, "yolov8n.pt")

models = {}

# Load High-Precision YOLOv8s model as default
try:
    if os.path.exists(SMALL_MODEL_PATH):
        models["small"] = YOLO(SMALL_MODEL_PATH)
        models["small"].to(device)
        print("✓ High Precision model (YOLOv8s) loaded successfully")  
except Exception as e:
    print("Notice: Could not load yolov8s:", e)

# Load Ultra-Fast YOLOv8n model
try:
    if os.path.exists(NANO_MODEL_PATH):
        models["nano"] = YOLO(NANO_MODEL_PATH)
        models["nano"].to(device)
        print("✓ Fast model (YOLOv8n) loaded successfully")
except Exception as e:
    print("Notice: Could not load yolov8n:", e)

# Fallback if neither loaded locally
if not models:
    default_m = YOLO("yolov8s.pt")
    default_m.to(device)
    models["small"] = default_m

# Locate cell phone class ID dynamically
CELL_PHONE_CLASS_ID = 67
sample_model = models.get("small") or models.get("nano")
if sample_model and hasattr(sample_model, "names"):
    for cid, name in sample_model.names.items():
        if name.lower() in ("cell phone", "phone", "mobile phone"):
            CELL_PHONE_CLASS_ID = int(cid)
            break

print(f"Cell phone target class: {CELL_PHONE_CLASS_ID} ('cell phone')")

# Warm up models
for m_key, m_instance in models.items():
    try:
        dummy = np.zeros((384, 384, 3), dtype=np.uint8)
        with torch.inference_mode():
            for _ in range(2):
                _ = m_instance.predict(
                    source=dummy,
                    imgsz=384,
                    conf=0.4,
                    classes=[CELL_PHONE_CLASS_ID],
                    verbose=False,
                    device=device,
                    agnostic_nms=True
                )
        print(f"✓ Model '{m_key}' pre-warmed")
    except Exception as e:
        print(f"Warmup notice for {m_key}:", e)


def detect_phone(image, conf_threshold=0.45, imgsz=384, model_type="small"):
    """
    High-precision cell phone detection preserving native aspect ratio.
    
    Args:
        image (np.ndarray): BGR image frame from client.
        conf_threshold (float): Detection confidence threshold.
        imgsz (int): Inference image dimension (e.g. 384, 416).
        model_type (str): 'small' (higher precision) or 'nano' (fastest).
        
    Returns:
        dict: Detection result with bounding boxes and inference latency.
    """
    start_time = time.perf_counter()
    try:
        if image is None or not isinstance(image, np.ndarray) or image.size == 0:
            return {
                "phone_detected": False,
                "count": 0,
                "detections": [],
                "inference_ms": 0.0,
                "error": "Invalid image frame"
            }

        orig_h, orig_w = image.shape[:2]

        # Select model
        selected_model = models.get(model_type) or models.get("small") or models.get("nano")
        if selected_model is None:
            raise RuntimeError("No YOLO model available")

        # Pass native image directly so YOLO applies aspect-ratio-preserving letterbox
        with torch.inference_mode():
            results = selected_model.predict(
                source=image,
                imgsz=imgsz,
                conf=conf_threshold,
                classes=[CELL_PHONE_CLASS_ID],
                verbose=False,
                device=device,
                half=(device == "cuda"),
                max_det=5,
                agnostic_nms=True,
                iou=0.45
            )

        detections = []
        phone_detected = False

        for result in results:
            if result.boxes is None or len(result.boxes) == 0:
                continue

            for box in result.boxes:
                cls_id = int(box.cls[0].item())
                confidence = float(box.conf[0].item())

                if cls_id == CELL_PHONE_CLASS_ID or selected_model.names.get(cls_id) == "cell phone":
                    phone_detected = True
                    coords = box.xyxy[0].tolist()
                    x1 = max(0, min(orig_w, int(round(coords[0]))))
                    y1 = max(0, min(orig_h, int(round(coords[1]))))
                    x2 = max(0, min(orig_w, int(round(coords[2]))))
                    y2 = max(0, min(orig_h, int(round(coords[3]))))

                    detections.append({
                        "label": "cell phone",
                        "confidence": round(confidence, 3),
                        "box": [x1, y1, x2, y2],
                        "normalized_box": [
                            round(x1 / orig_w, 4),
                            round(y1 / orig_h, 4),
                            round(x2 / orig_w, 4),
                            round(y2 / orig_h, 4)
                        ]
                    })

        inference_ms = round((time.perf_counter() - start_time) * 1000, 2)

        return {
            "phone_detected": phone_detected,
            "count": len(detections),
            "detections": detections,
            "model_used": model_type,
            "inference_ms": inference_ms
        }

    except Exception as e:
        inference_ms = round((time.perf_counter() - start_time) * 1000, 2)
        print(f"Detection error: {e}")
        return {
            "phone_detected": False,
            "count": 0,
            "detections": [],
            "inference_ms": inference_ms,
            "error": str(e)
        }
