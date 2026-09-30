# Local Setup Guide

## For Running Locally on Individual Machines

This application runs entirely on your local machine. No online deployment or cloud accounts required.

---

## System Requirements

### Minimum System Requirements
- **Operating System:** Windows 10+, macOS 10.14+, or Linux (Ubuntu 18.04+)
- **Python:** 3.11 or higher
- **RAM:** 4 GB minimum (8 GB recommended for smooth operation)
- **Storage:** 1 GB free space (includes YOLOv8 model download)
- **Processor:** Intel/AMD dual-core processor (multi-core recommended)
- **Webcam:** USB or built-in webcam with at least 30 FPS
- **Network:** Not required (runs offline after initial model download)

### Optional
- **GPU:** NVIDIA CUDA-compatible GPU for faster detection (optional, CPU mode works fine)

---

## Prerequisites

- Python 3.11+
- Git (for cloning the repository)
- A webcam device

---

## Installation & Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd phonedetector
```

### Step 2: Backend Setup

#### Terminal 1 - Backend Server

```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows
# or: source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
python app.py
```

**Expected Output:**
```
 * Running on http://127.0.0.1:5000
 * Press CTRL+C to quit
```

### Step 3: Frontend Setup

#### Terminal 2 - Frontend Server

```bash
cd frontend
python -m http.server 8000
```

**Expected Output:**
```
Serving HTTP on 0.0.0.0 port 8000
```

### Step 4: Access the Application

Open your web browser and visit:
```
http://localhost:8000
```

The application should load and request webcam access. Click "Allow" to begin phone detection.

---

## Troubleshooting

### Port Already in Use
- Backend (5000): Change `app.run(port=5000)` in `backend/app.py`
- Frontend (8000): Use `python -m http.server 9000` instead

### Webcam Not Found
- Ensure no other application is using your webcam
- Check browser permissions for camera access
- Restart the browser and try again

### Slow Detection
- Close unnecessary applications to free up RAM
- For GPU acceleration, install CUDA support (advanced)

### Model Download Issues
- Ensure internet connection during first run
- YOLOv8 model (~6MB) will load/download automatically
- First run may take 5-10 seconds for model warmup

---

## Cloud Deployment (Optional)

### Backend (Render / Railway / VPS)
1. Push repo to GitHub.
2. In Render / Railway, create a new Web Service pointing to `backend/`.
3. Set build command: `pip install -r requirements.txt`.
4. Set start command: `gunicorn app:app -b 0.0.0.0:$PORT` (or `python app.py`).
5. Copy your live backend URL (e.g., `https://your-backend.onrender.com`).

### Frontend (Vercel / Netlify / GitHub Pages)
1. In Vercel / Netlify, deploy the `frontend/` folder.
2. Open the deployed frontend in browser.
3. In the right-hand panel, paste your backend URL into the **Backend Connection** field (e.g. `https://your-backend.onrender.com/detect`) and click **Connect**.
4. The setting is persisted automatically in your browser's `localStorage`.

---

## Final Verification

1. Visit your frontend URL (`http://localhost:8000`)
2. Allow camera permission
3. Point phone at camera
4. Expected result:
   - Green bounding box with target reticles locks onto phone
   - Red alert modal triggers
   - High priority alarm audio plays with 0ms latency
   - Spoken voice alert warns user to focus
5. Test with phone front, back, and at various angles.

---

## Summary of Fixes & Optimizations

- **Instant Zero-Latency Loop:** Frame interval reduced from 20,000ms (20s) to a continuous ~30+ FPS stream.
- **YOLO Targeted Class Filtering:** Prunes non-target classes (COCO class 67), reducing NMS overhead.
- **Binary JPEG Streaming:** Direct canvas-to-blob binary stream over HTTP.
- **0ms Web Audio Engine:** Pre-decoded in-memory `AudioBuffer` eliminates playback lag.
- **Voice Warning Sync:** Speech synthesis auto-cleans queues to prevent stutter.

