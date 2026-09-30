/**
 * AI Phone Detector - Ultra Fast Real-Time Client Engine
 */

// DOM Elements
const video = document.getElementById("video");
const overlayCanvas = document.getElementById("overlayCanvas");
const overlayCtx = overlayCanvas.getContext("2d");
const captureCanvas = document.getElementById("captureCanvas");
const captureCtx = captureCanvas.getContext("2d");

const viewportContainer = document.getElementById("viewportContainer");
const alertBox = document.getElementById("alertBox");
const alertConfTag = document.getElementById("alertConfTag");
const dismissAlertBtn = document.getElementById("dismissAlertBtn");
const audioUnlockPrompt = document.getElementById("audioUnlockPrompt");

const toggleDetectionBtn = document.getElementById("toggleDetectionBtn");
const toggleBtnText = document.getElementById("toggleBtnText");
const testSoundBtn = document.getElementById("testSoundBtn");
const backendStatus = document.getElementById("backendStatus");

const fpsVal = document.getElementById("fpsVal");
const latencyVal = document.getElementById("latencyVal");
const scanStatus = document.getElementById("scanStatus");
const statInference = document.getElementById("statInference");
const statFps = document.getElementById("statFps");
const statCount = document.getElementById("statCount");
const statTotalAlerts = document.getElementById("statTotalAlerts");

const soundToggle = document.getElementById("soundToggle");
const voiceToggle = document.getElementById("voiceToggle");
const confSlider = document.getElementById("confSlider");
const confVal = document.getElementById("confVal");
const cooldownSlider = document.getElementById("cooldownSlider");
const cooldownVal = document.getElementById("cooldownVal");
const backendUrlInput = document.getElementById("backendUrlInput");
const saveBackendUrlBtn = document.getElementById("saveBackendUrlBtn");

const alarmAudioElement = document.getElementById("alarmSound");

// Application State
let isRunning = false;
let isProcessingFrame = false;
let cooldownActive = false;
let cooldownTimer = null;
let totalAlertsCount = 0;

let detectionConfidence = 0.40; // Default 40%
let cooldownDurationMs = 1500;  // Default 1.5 seconds

let backendUrl = localStorage.getItem("phonedetector_backend_url") || "http://localhost:5000/detect";
backendUrlInput.value = backendUrl;

// FPS Tracking
let frameCount = 0;
let lastFpsUpdateTime = performance.now();
let currentFps = 0;

// Web Audio API State
let audioCtx = null;
let alarmAudioBuffer = null;
let isAudioUnlocked = false;

// Initialize Audio Context & Preload Alarm Buffer
function initAudioEngine() {
    if (audioCtx) return;
    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            audioCtx = new AudioContextClass();
            preloadAlarmAudio();
        }
    } catch (e) {
        console.warn("Web Audio API not supported:", e);
    }
}

async function unlockAudio() {
    if (isAudioUnlocked) return;
    initAudioEngine();
    if (audioCtx && audioCtx.state === "suspended") {
        await audioCtx.resume();
    }
    isAudioUnlocked = true;
    if (audioUnlockPrompt) {
        audioUnlockPrompt.classList.add("hidden");
    }
    console.log("✓ Audio Engine Unlocked");
}

async function preloadAlarmAudio() {
    try {
        const response = await fetch("assets/alarm.mp3");
        if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            if (audioCtx) {
                alarmAudioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
                console.log("✓ Alarm audio buffer preloaded for 0ms latency playback");
            }
        }
    } catch (e) {
        console.warn("Preloading alarm audio buffer failed, will use HTMLAudio fallback:", e);
    }
}

// Global user interaction listener to unlock audio seamlessly
["click", "touchstart", "keydown"].forEach(evtName => {
    document.addEventListener(evtName, () => unlockAudio(), { once: false, passive: true });
});

// Setup Webcam
async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: "user"
            },
            audio: false
        });

        video.srcObject = stream;

        await new Promise(resolve => {
            video.onloadedmetadata = () => {
                video.play();
                resolve();
            };
        });

        // Set matching dimensions for overlay
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        console.log("✓ Camera initialized successfully");
        checkBackendHealth();

        // Auto start detection once camera is ready
        startDetection();

    } catch (error) {
        console.error("Camera access error:", error);
        alert("Camera access is required for real-time phone detection. Please allow camera permissions and reload.");
    }
}

function resizeCanvas() {
    if (video.videoWidth && video.videoHeight) {
        overlayCanvas.width = video.videoWidth;
        overlayCanvas.height = video.videoHeight;
    }
}

// Check Backend Health
async function checkBackendHealth() {
    try {
        const base = backendUrl.replace(/\/detect\/?$/, "");
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const res = await fetch(`${base}/health`, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
            backendStatus.className = "status-badge online";
            backendStatus.innerHTML = '<span class="dot"></span> Backend Online';
            return true;
        } else {
            throw new Error("Status " + res.status);
        }
    } catch (e) {
        backendStatus.className = "status-badge offline";
        backendStatus.innerHTML = '<span class="dot"></span> Backend Offline';
        return false;
    }
}

// Detection Loop (Ultra Fast Continuous Pipeline)
async function runDetectionLoop() {
    if (!isRunning) return;

    if (!isProcessingFrame && video.readyState >= 2 && video.videoWidth > 0) {
        await processSingleFrame();
    }

    // Schedule next frame with zero delay for maximum real-time responsiveness
    if (isRunning) {
        requestAnimationFrame(runDetectionLoop);
    }
}

async function processSingleFrame() {
    isProcessingFrame = true;
    const requestStartTime = performance.now();

    try {
        // Frame capture resolution (320x240 for optimal speed and aspect ratio)
        const targetW = 320;
        const targetH = Math.round((video.videoHeight / video.videoWidth) * targetW) || 240;

        captureCanvas.width = targetW;
        captureCanvas.height = targetH;
        captureCtx.drawImage(video, 0, 0, targetW, targetH);

        // Convert canvas frame to binary JPEG Blob (faster than base64 string)
        const blob = await new Promise(resolve => captureCanvas.toBlob(resolve, "image/jpeg", 0.65));
        if (!blob) {
            isProcessingFrame = false;
            return;
        }

        const url = `${backendUrl}?conf=${detectionConfidence}&imgsz=320`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "image/jpeg"
            },
            body: blob
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const totalRoundtripMs = Math.round(performance.now() - requestStartTime);

        // Update HUD metrics
        latencyVal.textContent = `${data.inference_ms || totalRoundtripMs} ms`;
        statInference.textContent = `${data.inference_ms || totalRoundtripMs} ms`;
        statCount.textContent = data.count || 0;

        if (backendStatus.classList.contains("offline") || backendStatus.classList.contains("checking")) {
            backendStatus.className = "status-badge online";
            backendStatus.innerHTML = '<span class="dot"></span> Backend Online';
        }

        // Render Bounding Boxes on Overlay Canvas
        renderOverlay(data.detections || []);

        // Process Phone Detection Alert
        if (data.phone_detected) {
            viewportContainer.classList.add("alerting");
            viewportContainer.classList.remove("detecting");

            if (!cooldownActive) {
                const maxConf = data.detections && data.detections.length > 0 
                    ? Math.round(data.detections[0].confidence * 100) 
                    : 90;
                triggerAlert(maxConf);
            }
        } else {
            viewportContainer.classList.remove("alerting");
            if (isRunning) {
                viewportContainer.classList.add("detecting");
            }
            if (!cooldownActive) {
                scanStatus.className = "hud-status scanning";
                scanStatus.textContent = "SCANNING";
            }
        }

        // Track FPS
        frameCount++;
        const now = performance.now();
        if (now - lastFpsUpdateTime >= 500) {
            currentFps = Math.round((frameCount * 1000) / (now - lastFpsUpdateTime));
            fpsVal.textContent = currentFps;
            statFps.textContent = currentFps;
            frameCount = 0;
            lastFpsUpdateTime = now;
        }

    } catch (err) {
        console.warn("Detection frame error:", err.message);
        scanStatus.className = "hud-status ready";
        scanStatus.textContent = "RETRYING";
    } finally {
        isProcessingFrame = false;
    }
}

// Render Real-time Bounding Boxes and Target Reticles
function renderOverlay(detections) {
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    if (!detections || detections.length === 0) return;

    const scaleX = overlayCanvas.width / (captureCanvas.width || 320);
    const scaleY = overlayCanvas.height / (captureCanvas.height || 240);

    detections.forEach(det => {
        let [x1, y1, x2, y2] = det.box;
        x1 = Math.round(x1 * scaleX);
        y1 = Math.round(y1 * scaleY);
        x2 = Math.round(x2 * scaleX);
        y2 = Math.round(y2 * scaleY);

        const w = x2 - x1;
        const h = y2 - y1;
        const confPercent = Math.round((det.confidence || 0) * 100);

        // Box Glow & Border
        overlayCtx.shadowColor = "rgba(255, 0, 85, 0.9)";
        overlayCtx.shadowBlur = 15;
        overlayCtx.strokeStyle = "#ff0055";
        overlayCtx.lineWidth = 3;
        overlayCtx.strokeRect(x1, y1, w, h);

        // Corner Brackets
        const cornerLen = Math.min(20, w / 4, h / 4);
        overlayCtx.strokeStyle = "#00f2fe";
        overlayCtx.lineWidth = 4;
        overlayCtx.beginPath();
        // Top-Left
        overlayCtx.moveTo(x1, y1 + cornerLen); overlayCtx.lineTo(x1, y1); overlayCtx.lineTo(x1 + cornerLen, y1);
        // Top-Right
        overlayCtx.moveTo(x2 - cornerLen, y1); overlayCtx.lineTo(x2, y1); overlayCtx.lineTo(x2, y1 + cornerLen);
        // Bottom-Left
        overlayCtx.moveTo(x1, y2 - cornerLen); overlayCtx.lineTo(x1, y2); overlayCtx.lineTo(x1 + cornerLen, y2);
        // Bottom-Right
        overlayCtx.moveTo(x2 - cornerLen, y2); overlayCtx.lineTo(x2, y2); overlayCtx.lineTo(x2, y2 - cornerLen);
        overlayCtx.stroke();

        // Label Badge
        overlayCtx.shadowBlur = 0;
        overlayCtx.fillStyle = "rgba(255, 0, 85, 0.9)";
        const labelText = `📱 PHONE ${confPercent}%`;
        overlayCtx.font = "bold 14px 'Orbitron', Arial, sans-serif";
        const textMetrics = overlayCtx.measureText(labelText);
        const labelWidth = textMetrics.width + 16;
        const labelHeight = 24;

        overlayCtx.fillRect(x1, Math.max(0, y1 - labelHeight), labelWidth, labelHeight);
        overlayCtx.fillStyle = "#ffffff";
        overlayCtx.fillText(labelText, x1 + 8, Math.max(16, y1 - 6));
    });
}

// Instant Alarm & Alert Trigger
function triggerAlert(confPercent = 90) {
    if (cooldownActive) return;

    cooldownActive = true;
    totalAlertsCount++;
    statTotalAlerts.textContent = totalAlertsCount;

    scanStatus.className = "hud-status detected";
    scanStatus.textContent = "PHONE DETECTED!";
    alertConfTag.textContent = `Confidence: ${confPercent}%`;

    // Show Fullscreen Alert Modal
    alertBox.classList.remove("hidden");

    // Play Instant Sound Alarm (if enabled)
    if (soundToggle.checked) {
        playInstantAlarm();
    }

    // Play Voice Alert (if enabled)
    if (voiceToggle.checked) {
        speakVoiceWarning();
    }

    // Auto-dismiss popup after 2 seconds
    setTimeout(() => {
        alertBox.classList.add("hidden");
    }, 2000);

    // Cooldown management
    if (cooldownTimer) clearTimeout(cooldownTimer);
    cooldownTimer = setTimeout(() => {
        cooldownActive = false;
        if (isRunning) {
            scanStatus.className = "hud-status scanning";
            scanStatus.textContent = "SCANNING";
        }
    }, cooldownDurationMs);
}

// 0ms Ultra-Low Latency Sound Playback
function playInstantAlarm() {
    // Strategy 1: Preloaded Web Audio API Buffer (Instant 0ms latency)
    if (audioCtx && alarmAudioBuffer) {
        try {
            if (audioCtx.state === "suspended") {
                audioCtx.resume();
            }
            const source = audioCtx.createBufferSource();
            const gainNode = audioCtx.createGain();
            source.buffer = alarmAudioBuffer;
            gainNode.gain.setValueAtTime(1.0, audioCtx.currentTime);
            source.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            source.start(0);
            return;
        } catch (e) {
            console.warn("Buffer playback failed, falling back:", e);
        }
    }

    // Strategy 2: HTMLAudioElement playback
    if (alarmAudioElement) {
        try {
            alarmAudioElement.currentTime = 0;
            const playPromise = alarmAudioElement.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    // Strategy 3: Pure Web Audio Synthesizer Chime
                    playSynthesizerAlarm();
                });
            }
            return;
        } catch (e) {
            playSynthesizerAlarm();
        }
    }

    // Strategy 3: Pure Web Audio Synthesizer Chime Fallback
    playSynthesizerAlarm();
}

// Synthesizer Siren Fallback
function playSynthesizerAlarm() {
    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!audioCtx && AudioContextClass) {
            audioCtx = new AudioContextClass();
        }
        if (!audioCtx) return;

        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }

        const now = audioCtx.currentTime;
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc1.type = "sawtooth";
        osc2.type = "sine";

        // Siren dual tone pitch modulation
        osc1.frequency.setValueAtTime(880, now);
        osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.15);
        osc1.frequency.exponentialRampToValueAtTime(880, now + 0.3);

        osc2.frequency.setValueAtTime(440, now);
        osc2.frequency.exponentialRampToValueAtTime(660, now + 0.15);
        osc2.frequency.exponentialRampToValueAtTime(440, now + 0.3);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(audioCtx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.45);
        osc2.stop(now + 0.45);

    } catch (e) {
        console.error("Synthesizer error:", e);
    }
}

// Voice Warning Speech Synthesis
function speakVoiceWarning() {
    try {
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel(); // Cancel any lingering queued speech
            const utterance = new SpeechSynthesisUtterance("Stop using your phone and focus!");
            utterance.rate = 1.15;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            window.speechSynthesis.speak(utterance);
        }
    } catch (e) {
        console.warn("Speech error:", e);
    }
}

// Start & Stop Controls
function startDetection() {
    if (isRunning) return;
    isRunning = true;
    toggleBtnText.textContent = "Pause Detection";
    toggleDetectionBtn.classList.add("active-stop");
    viewportContainer.classList.add("detecting");
    scanStatus.className = "hud-status scanning";
    scanStatus.textContent = "SCANNING";
    runDetectionLoop();
}

function stopDetection() {
    isRunning = false;
    toggleBtnText.textContent = "Start Detection";
    toggleDetectionBtn.classList.remove("active-stop");
    viewportContainer.classList.remove("detecting", "alerting");
    scanStatus.className = "hud-status ready";
    scanStatus.textContent = "PAUSED";
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
}

// Event Listeners & UI Controls
toggleDetectionBtn.addEventListener("click", () => {
    unlockAudio();
    if (isRunning) {
        stopDetection();
    } else {
        startDetection();
    }
});

testSoundBtn.addEventListener("click", () => {
    unlockAudio();
    playInstantAlarm();
    if (voiceToggle.checked) {
        speakVoiceWarning();
    }
});

dismissAlertBtn.addEventListener("click", () => {
    alertBox.classList.add("hidden");
});

window.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !alertBox.classList.contains("hidden")) {
        alertBox.classList.add("hidden");
    }
});

confSlider.addEventListener("input", (e) => {
    detectionConfidence = parseInt(e.target.value, 10) / 100;
    confVal.textContent = `${e.target.value}%`;
});

cooldownSlider.addEventListener("input", (e) => {
    cooldownDurationMs = parseFloat(e.target.value) * 1000;
    cooldownVal.textContent = `${e.target.value}s`;
});

saveBackendUrlBtn.addEventListener("click", () => {
    const val = backendUrlInput.value.trim();
    if (val) {
        backendUrl = val;
        localStorage.setItem("phonedetector_backend_url", val);
        checkBackendHealth();
    }
});

// Initialize on Load
window.addEventListener("DOMContentLoaded", () => {
    initAudioEngine();
    setupCamera();
});