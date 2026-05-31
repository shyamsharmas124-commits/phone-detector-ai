const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const alertBox = document.getElementById("alertBox");
const alarmSound = document.getElementById("alarmSound");

const BACKEND_URL = "https://YOUR-BACKEND.onrender.com/detect";

let cooldown = false;

async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: true
    });

    video.srcObject = stream;
}

async function detectFrame() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);

    const image = canvas.toDataURL("image/jpeg");

    try {
        const response = await fetch(BACKEND_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ image })
        });

        const data = await response.json();

        if (data.phone_detected && !cooldown) {
            triggerAlert();
        }

    } catch (error) {
        console.error(error);
    }
}

function triggerAlert() {
    cooldown = true;

    alertBox.classList.remove("hidden");

    alarmSound.play();

    const speech = new SpeechSynthesisUtterance(
        "Stop using your phone and focus"
    );

    speechSynthesis.speak(speech);

    setTimeout(() => {
        alertBox.classList.add("hidden");
    }, 3000);

    setTimeout(() => {
        cooldown = false;
    }, 5000);
}

setupCamera();

setInterval(() => {
    if (video.videoWidth > 0) {
        detectFrame();
    }
}, 1500);
