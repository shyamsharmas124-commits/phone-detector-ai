# Phone Detector

Real-time mobile phone detection using YOLOv8 and webcam monitoring. Displays alerts and plays audio when phones are detected.

## Features

- Real-time phone detection (front & back)
- Browser webcam integration
- Fullscreen alert with custom audio
- Confidence threshold filtering (0.3+)
- Production-ready deployment
- Custom audio only (no AI voice)

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | Python, Flask, YOLOv8 |
| Frontend | HTML5, CSS3, JavaScript |
| AI Model | YOLOv8 (Nano) |
| Image Processing | OpenCV |
| Deployment | Render (Backend), Vercel (Frontend) |

## Project Structure

```
phonedetector/
├── backend/
│   ├── app.py                 # Flask API server
│   ├── detector.py            # YOLOv8 detection logic
│   ├── requirements.txt       # Python dependencies
│   ├── runtime.txt            # Python version
│   ├── Procfile               # Render deployment config
│   └── yolov8n.pt             # AI model (auto-downloads)
│
├── frontend/
│   ├── index.html             # UI structure
│   ├── script.js              # Detection logic
│   ├── style.css              # Styling
│   └── assets/
│       ├── alert.png          # Alert image
│       └── alarm.mp3          # Alert sound
│
├── .gitignore
├── README.md
└── DEPLOYMENT_STEPS.md
```

## Quick Start (Local Development)

### Prerequisites
- Python 3.11+
- Git

### Backend Setup

```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows
pip install -r requirements.txt
python app.py
```

### Frontend Setup (New Terminal)

```bash
cd frontend
python -m http.server 8000
```

Visit: `http://localhost:8000`

## Production Deployment

See [DEPLOYMENT_STEPS.md](DEPLOYMENT_STEPS.md) for complete deployment instructions.

## Configuration

### Adjust Detection Sensitivity

Edit `backend/detector.py` line 36:
```python
if label == "cell phone" and confidence > 0.3:  # Change 0.3 to adjust
```

- Lower value = More detections
- Higher value = More accurate

### Adjust Alert Timing

Edit `frontend/script.js` line 69-72:
```javascript
setTimeout(() => {
    alertBox.classList.add("hidden");
}, 3000);  // Alert display time

setTimeout(() => {
    cooldown = false;
}, 5000);  // Cooldown before next alert
```

## Performance

- Model Size: YOLOv8 Nano (~6MB)
- Inference Time: ~40-50ms per frame
- Detection Rate: 1 frame every 1.5 seconds

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Camera not working | Grant camera permission. Try Chrome/Edge. |
| Alert not triggering | Hard refresh (Ctrl+Shift+R). Check console (F12). |
| Audio not playing | Check browser volume and audio permissions. |
| Backend error on Render | Check Render logs. Model auto-downloads on first run. |
| Frontend can't reach backend | Verify backend URL in script.js. |

## Dependencies

### Backend
- flask
- flask-cors
- ultralytics (YOLOv8)
- opencv-python-headless
- numpy
- Pillow

### Frontend
- HTML5 MediaDevices API
- Canvas API
- Fetch API
- Web Audio API (fallback)

## License

Open source.
