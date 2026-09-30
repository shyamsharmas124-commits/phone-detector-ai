# AI Phone Detector 🚀

Ultra-fast, real-time mobile phone detection powered by YOLOv8 and browser webcam streaming. Instantly detects phones (front, back, angled) with sub-20ms inference and triggers immediate audio and voice alerts.

## ⚡ Features

- **Real-Time 30+ FPS Detection Pipeline:** Instant detection with zero polling latency
- **Direct Binary Blob Streaming:** Canvas-to-binary JPEG transmission for minimal bandwidth and CPU overhead
- **Sub-20ms YOLOv8 Inference:** Optimized class pruning (COCO class 67), pre-warmed PyTorch threads, and inference mode
- **0ms Web Audio Engine:** Pre-decoded `AudioBuffer` sound alarm with dual-tone synthesizer siren fallback
- **Voice Warning Alert:** Natural speech synthesis alert (`"Stop using your phone and focus"`)
- **Live HUD & Bounding Box Overlay:** Cyberpunk-style bounding box reticles, confidence tags, and live telemetry (FPS & Latency)
- **Dynamic Control Panel:** In-browser sensitivity slider, cooldown timer, audio/voice toggles, and sound tester

## 🛠 Tech Stack

| Component | Technology |
|-----------|-----------|
| **Backend** | Python 3.11+, Flask, Flask-CORS, PyTorch, YOLOv8 (Ultralytics), OpenCV |
| **Frontend** | HTML5 Canvas, Vanilla JS, Web Audio API, Web Speech API, Cyberpunk CSS3 |
| **AI Model** | YOLOv8 Nano (`yolov8n.pt`) with targeted class filtering |

## 📁 Project Structure

```
phonedetector/
├── backend/
│   ├── app.py                 # Flask API server with binary & base64 support
│   ├── detector.py            # Optimized YOLOv8 detection engine
│   ├── requirements.txt       # Python dependencies
│   ├── runtime.txt            # Python runtime version
│   ├── Procfile               # Deployment config
│   └── yolov8n.pt             # AI model weights
│
├── frontend/
│   ├── index.html             # UI with live HUD and controls
│   ├── script.js              # Real-time async pipeline & Web Audio engine
│   ├── style.css              # Cyberpunk HUD styling
│   └── assets/
│       ├── alert.png          # Alert warning graphic
│       └── alarm.mp3          # High-priority alarm sound
│
├── QUICK_START.md             # One-minute setup guide
├── DEPLOYMENT_STEPS.md        # Comprehensive setup & deployment guide
└── README.md
```

## 🚀 Quick Start (Local Development)

### 1. Start Backend Server

```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1   # Windows (or: source venv/bin/activate on macOS/Linux)
pip install -r requirements.txt
python app.py
```
*Backend runs on: `http://127.0.0.1:5000`*

### 2. Start Frontend Server (In a new terminal)

```bash
cd frontend
python -m http.server 8000
```
*Open your browser and navigate to: `http://localhost:8000`*

---

## ⚡ Performance Optimizations

1. **Targeted Class Pruning:** `classes=[67]` instructs YOLO to only compute NMS and box extraction for cell phones, skipping 79 non-target classes.
2. **PyTorch Inference Mode:** Uses `torch.inference_mode()` with multi-core CPU thread tuning (`torch.set_num_threads`).
3. **Model Warmup:** Preheats model tensors on server startup to eliminate cold-start delay.
4. **Binary JPEG Streaming:** Sends raw binary frames from HTML5 canvas directly to Flask, eliminating Base64 encode/decode cycles.
5. **0ms Latency Audio:** Decodes `alarm.mp3` directly into browser memory (`AudioBuffer`) via the Web Audio API for instantaneous audio firing upon detection.

## 🎛 Controls & Customization

All settings can be configured live in the web interface:
- **Detection Sensitivity (Confidence):** Adjust slider between 20% and 85% (default 40%).
- **Alert Cooldown:** Adjust between 0.5s and 5.0s to control alarm repeat rate.
- **Sound / Voice Toggles:** Enable or disable alarm sound and speech alerts independently.
- **Sound Test Button:** Test speaker volume and audio output with 1 click.

## 📄 License

Open source under the ISC License.

