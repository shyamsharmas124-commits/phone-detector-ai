# Quick Start Guide ⚡

**Local Real-Time Phone Detector - Ultra Fast Mode**

## ⚡ One-Minute Setup

### Prerequisites Check
- [ ] Python 3.11+ installed (`python --version`)
- [ ] Webcam available
- [ ] 4GB+ RAM available
- [ ] 1GB free storage

### Launch (2 Terminal Windows)

**Terminal 1 - Backend:**
```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1   # Windows
pip install -r requirements.txt
python app.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
python -m http.server 8000
```

### Open Browser
Navigate to:
```
http://localhost:8000
```

---

## 🔍 Expected Behavior

1. Browser will ask for webcam permission → Click **Allow**
2. Live webcam feed appears in browser with HUD overlay
3. When a phone is presented to the camera:
   - Real-time targeting brackets lock onto the phone with confidence percentage
   - Fullscreen alarm alert triggers
   - High-priority alarm audio sounds instantly (0ms latency)
   - Voice warning announces: *"Stop using your phone and focus!"*
   - Alert auto-dismisses and resets after the configurable cooldown

---

## 🎛 On-Screen Controls

All settings can be adjusted in real time from the right-hand dashboard:
- **Start / Pause Detection:** Toggle live camera scanning
- **Test Alarm Sound:** Instantly preview sound and speech volume
- **Detection Sensitivity Slider:** Adjust confidence threshold (20% - 85%)
- **Alert Cooldown Slider:** Adjust pause duration between alerts (0.5s - 5.0s)
- **Audio Alarm & Voice Warning Toggles:** Turn alarm sound or spoken voice alerts on/off

---

## ❌ Troubleshooting

| Issue | Solution |
|-------|----------|
| **Port in use (5000)** | Set `PORT=5001` before running `python app.py`, then update the backend URL in the web UI. |
| **Webcam not found** | Ensure no other app is using the webcam and browser has camera permissions. |
| **Audio not sounding** | Click anywhere on the webpage to activate browser audio permissions, or click "Test Alarm Sound". |
| **Backend Offline badge** | Ensure `python app.py` is running in Terminal 1 without errors. |

---

## ⚡ Performance Architecture

- **PyTorch Multi-Thread CPU Tuning:** Utilizes all CPU cores with `torch.inference_mode()`.
- **Targeted Class Pruning:** YOLOv8 NMS processes ONLY the cell phone class (index 67), skipping 79 non-target COCO classes.
- **Model Warmup:** Tensor buffers pre-warmed on server startup.
- **Direct Binary JPEG Streaming:** Canvas-to-binary JPEG transmission for minimal bandwidth and CPU overhead.
- **0ms Web Audio Engine:** Decoded `AudioBuffer` in browser memory with dual-tone synthesizer siren fallback.

---

## 🚀 Now Running Locally!

This application is fully self-contained and runs entirely on your machine with no cloud dependencies.
