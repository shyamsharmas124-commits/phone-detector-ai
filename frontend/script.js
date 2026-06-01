const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const alertBox = document.getElementById("alertBox");
const alarmSound = document.getElementById("alarmSound");

const BACKEND_URL =
    window.location.hostname === "localhost"
        ? "http://localhost:5000/detect"
        : "https://phonedetectorai-backend.onrender.com/detect";

let cooldown = false;
let isDetecting = false;

console.log("Phone Detector initialized");

async function setupCamera() {
    try {
        const stream =
            await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: "user"
                }
            });

        video.srcObject = stream;

        console.log("Camera started");

    } catch (error) {
        console.error("Camera error:", error);
        alert("Please allow camera access!");
    }
}

async function detectFrame() {

    if (isDetecting) return;

    if (!video.videoWidth || !video.videoHeight) {
        return;
    }

    isDetecting = true;

    try {

        canvas.width = 224;
        canvas.height = 224;

        ctx.drawImage(video, 0, 0, 224, 224);

        const image = canvas.toDataURL("image/jpeg", 0.3);

        const response = await fetch(
            BACKEND_URL,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    image
                })
            }
        );

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        console.log("Backend response:", data);

        if (data.phone_detected && !cooldown) {
            triggerAlert();
        }

    } catch (error) {

        console.error("Detection error:", error.message);

    } finally {

        isDetecting = false;
    }
}

function triggerAlert() {

    console.log("Alert triggered");

    cooldown = true;

    alertBox.classList.remove("hidden");

    alarmSound.play()
        .catch(() => {
            playBeep();
        });

    try {

        const speech =
            new SpeechSynthesisUtterance(
                "Stop using your phone and focus"
            );

        speech.volume = 1;
        speech.rate = 1;
        speech.pitch = 1;

        speechSynthesis.speak(speech);

    } catch (error) {

        console.error("Speech error:", error);
    }

    setTimeout(() => {
        alertBox.classList.add("hidden");
    }, 3000);

    setTimeout(() => {
        cooldown = false;
    }, 5000);
}

function playBeep() {

    try {

        const audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

        const oscillator =
            audioContext.createOscillator();

        const gainNode =
            audioContext.createGain();

        oscillator.connect(gainNode);

        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;

        oscillator.type = "sine";

        gainNode.gain.setValueAtTime(
            0.3,
            audioContext.currentTime
        );

        gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.5
        );

        oscillator.start(audioContext.currentTime);

        oscillator.stop(audioContext.currentTime + 0.5);

    } catch (error) {

        console.error("Beep error:", error);
    }
}

setupCamera();

setInterval(() => {
    if (!cooldown) {
        detectFrame();
    }
}, 15000);

console.log("Detection loop started");