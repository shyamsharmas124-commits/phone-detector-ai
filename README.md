# AI Phone Detector

An AI-powered web application that detects mobile phone usage through webcam monitoring using YOLOv8.

## Features

- Real-time phone detection
- Browser webcam integration
- Voice alerts
- Fullscreen warnings
- Production-ready deployment

## Tech Stack

- Flask
- YOLOv8
- OpenCV
- JavaScript
- HTML/CSS

## Deployment

Frontend: Vercel
Backend: Render

## Project Structure

\\\
phone-detector-ai/
│
├── backend/
│   ├── app.py
│   ├── detector.py
│   ├── requirements.txt
│   ├── runtime.txt
│   ├── Procfile
│   └── yolov8n.pt
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── assets/
│       ├── alert.png
│       └── alarm.mp3
│
├── .gitignore
├── README.md
└── package.json
\\\

## Getting Started

### Backend Setup

1. Navigate to the backend folder
2. Install dependencies: \pip install -r requirements.txt\
3. Run the Flask app: \python app.py\

### Frontend Setup

1. Navigate to the frontend folder
2. Open \index.html\ in a browser

## Deployment

### Backend (Render)

1. Create account at https://render.com
2. Create new Web Service
3. Connect GitHub repository
4. Select backend folder
5. Build Command: \pip install -r requirements.txt\
6. Start Command: \python app.py\

### Frontend (Vercel)

1. Create account at https://vercel.com
2. Import GitHub repository
3. Select frontend folder
4. Deploy

## Notes

- Use \opencv-python-headless\ in production (not \opencv-python\)
- Update BACKEND_URL in script.js with your deployed backend URL
- Add alert.png and alarm.mp3 to frontend/assets/
