const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const alertBox = document.getElementById("alertBox");
const alarmSound = document.getElementById("alarmSound");

// Use environment variable for backend URL, or detect based on hostname
const BACKEND_URL = window.location.hostname === "localhost" 
    ? "http://localhost:5000/detect"
    : `https://${window.BACKEND_HOST || "YOUR-BACKEND-URL.onrender.com"}/detect`;

let cooldown = false;

console.log("🎥 Phone Detector initialized");

async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 } }
        });
        video.srcObject = stream;
        console.log("✅ Camera started");
    } catch (error) {
        console.error("❌ Camera error:", error);
        alert("Please allow camera access!");
    }
}

async function detectFrame() {
    if (!video.videoWidth || !video.videoHeight) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);

    const image = canvas.toDataURL("image/jpeg", 0.8);

    try {
        const response = await fetch(BACKEND_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ image })
        });

        const data = await response.json();

        if (data.phone_detected) {
            console.log("📱 PHONE DETECTED!", data);
            if (!cooldown) {
                triggerAlert();
            }
        }

    } catch (error) {
        console.error("❌ Detection error:", error);
    }
}

function triggerAlert() {
    console.log("🚨 ALERT TRIGGERED!");
    cooldown = true;

    // Show alert box
    alertBox.classList.remove("hidden");
    console.log("✅ Alert box shown");

    // Play audio
    const playPromise = alarmSound.play().catch(error => {
        console.error("❌ Audio play error:", error);
        // Fallback: use beep sound with Web Audio API
        playBeep();
    });

    setTimeout(() => {
        alertBox.classList.add("hidden");
        console.log("✅ Alert box hidden");
    }, 3000);

    setTimeout(() => {
        cooldown = false;
        console.log("✅ Cooldown reset");
    }, 5000);
}

// Fallback beep sound using Web Audio API
function playBeep() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = "sine";
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        
        console.log("✅ Beep sound played");
    } catch (error) {
        console.error("❌ Beep error:", error);
    }
}

// Start camera and detection
setupCamera();

setInterval(() => {
    if (video.videoWidth > 0) {
        detectFrame();
    }
}, 1500);

console.log("🔄 Detection loop started");
