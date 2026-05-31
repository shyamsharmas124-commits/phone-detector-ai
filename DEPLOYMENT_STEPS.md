# Deployment Steps

## For First-Time Users

Follow these exact steps after cloning the repository.

---

## Prerequisites

- Python 3.11+
- GitHub account
- Render account (free)
- Vercel account (free)
- Git installed

---

## Step 1: Local Testing (Optional but Recommended)

### Terminal 1 - Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows
# or: source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
python app.py
```

### Terminal 2 - Frontend
```bash
cd frontend
python -m http.server 8000
```

Visit: `http://localhost:8000`

---

## Step 2: Deploy Backend to Render

### Step A: Prepare Repository
1. Push code to GitHub (if not already)
2. Note your **backend folder path** (should be `/backend`)

### Step B: Create Render Service
1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Select your repository
5. Fill in settings:
   - **Name:** `phonedetector-backend`
   - **Root Directory:** `backend`
   - **Environment:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python app.py`
   - **Plan:** Free

6. Click "Create Web Service"
7. Wait 2-3 minutes for deployment
8. **Copy your backend URL** (e.g., `https://phonedetector-backend.onrender.com`)

### Verify Backend is Running
Visit: `https://phonedetector-backend.onrender.com/`
Expected: `{"status": "running", "message": "Phone Detector API"}`

---

## Step 3: Deploy Frontend to Vercel

### Step A: Prepare Repository
1. Your code must already be on GitHub
2. Note your **frontend folder path** (should be `/frontend`)

### Step B: Create Vercel Project
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New..." → "Project"
4. Select your repository
5. Fill in settings:
   - **Project Name:** `phonedetector`
   - **Framework:** "Other"
   - **Root Directory:** `frontend`

6. Click "Deploy"
7. Wait 1-2 minutes
8. **Copy your frontend URL** (e.g., `https://phonedetector.vercel.app`)

---

## Step 4: Connect Backend URL to Frontend

Choose ONE option:

#### Option A: Environment Variable (Recommended)
1. Go to Vercel Dashboard
2. Select your project
3. Click "Settings" → "Environment Variables"
4. Add new variable:
   - **Name:** `NEXT_PUBLIC_BACKEND_HOST`
   - **Value:** `phonedetector-backend.onrender.com` (your Render URL without https://)
5. Redeploy project

#### Option B: Edit Code
1. Edit `frontend/script.js` line 7
2. Change:
   ```javascript
   `https://${window.BACKEND_HOST || "YOUR-BACKEND-URL.onrender.com"}/detect`
   ```
   To:
   ```javascript
   `https://${window.BACKEND_HOST || "your-actual-render-url.onrender.com"}/detect`
   ```
3. Push to GitHub → Vercel auto-redeploys

---

## Final Verification

1. Visit your frontend URL
2. Allow camera permission
3. Point phone at camera
4. Expected result: Red alert appears + alarm plays
5. Test with phone front and back

---

## Final URLs

- Frontend: `https://phone-detector-ai.vercel.app`
- Backend API: `https://phone-detector-ai-backend.onrender.com`
- Test Backend: `https://phone-detector-ai-backend.onrender.com/`

---

## Troubleshooting

### Backend Issues (Render)
- Check Render logs: Project → Logs
- Common issue: Model downloads on first run (1-2 minutes)
- Solution: Wait 2 minutes, refresh page

### Frontend Issues (Vercel)
- Check Vercel logs: Project → Deployments → View logs
- Hard refresh browser: Ctrl+Shift+R
- Clear browser cache

### Connection Issues
- Verify backend URL in script.js
- Check CORS is enabled (default)
- Test backend endpoint directly in browser

---

## Notes

- Both Render and Vercel free tiers are sufficient
- Model (YOLOv8) auto-downloads on first detection (~40MB)
- Backend may sleep after 15 min inactivity (free tier) - refresh to wake up
- No database needed - stateless API
