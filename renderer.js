
import {
  SmartSpectraSDK,
  breathingMetrics,
  cardioMetrics
} from "@smartspectra/node-sdk/renderer";

import { decodeMetrics } from "@smartspectra/node-sdk/messages";

const requestedMetrics = [
  ...breathingMetrics,
  ...cardioMetrics
];

const API_KEY = process.env.PRESAGE_API_KEY;


// DOM elements
const video = document.getElementById("camera");
const status = document.getElementById("status");
const pulseElement = document.getElementById("pulse");
const breathingElement = document.getElementById("breathing");
const hint = document.getElementById("hint");
const insight = document.getElementById("insight");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const consent = document.getElementById("consent");
const cameraStatus = document.getElementById("cameraStatus");

const breathCircle = document.getElementById("breathCircle");
const breathText = document.getElementById("breathText");
const breathBtn = document.getElementById("breathBtn");

// State
let sdk = null;
let cameraStream = null;
let running = false;
let stopping = false;
let exerciseActive = false;
let exerciseTimer = null;
let inhale = true;
let fpsCallbackActive = false;

function updateStatus(message) {
  status.textContent = "● " + message;
}

function resetMeasurements() {
  pulseElement.textContent = "--";
  breathingElement.textContent = "--";
  insight.textContent = "Waiting for valid signal measurements.";
}

function stopCameraTracks() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }

  video.srcObject = null;
  cameraStatus.textContent = "Camera inactive";
}

function measureCameraFPS() {
  if (!video.requestVideoFrameCallback || fpsCallbackActive) return;

  fpsCallbackActive = true;

  let frames = 0;
  let startTime = null;

  function measure(now) {
    if (!fpsCallbackActive || !video.srcObject) {
      fpsCallbackActive = false;
      return;
    }

    if (startTime === null) startTime = now;
    frames++;

    if (now - startTime >= 10000) {
      const fps = frames * 1000 / (now - startTime);

      console.log("[CUSTOM CAMERA FPS]", fps.toFixed(2));
      console.log("[CUSTOM CAMERA FRAMES]", frames);

      frames = 0;
      startTime = now;
    }

    video.requestVideoFrameCallback(measure);
  }

  video.requestVideoFrameCallback(measure);
}

function handleMetrics(buffer, timestamp) {
  try {
    const metrics = decodeMetrics(buffer);

    console.log("[FULL METRICS OBJECT]", metrics);
    console.log("[METRIC ROOT KEYS]", Object.keys(metrics ?? {}));

    const cardio = metrics?.cardio;
    const breathing = metrics?.breathing;

    console.log("[CARDIO OBJECT]", cardio);
    console.log("[BREATHING OBJECT]", breathing);

    const pulseSample = cardio?.pulseRate?.at(-1);
    const breathingSample = breathing?.rate?.at(-1);
    
    console.log("[PULSE SAMPLE RAW]");
    console.dir(pulseSample, { depth: 5 });
    
    console.log("[BREATHING SAMPLE RAW]");
    console.dir(breathingSample, { depth: 5 });
    
    console.log("[PULSE SAMPLE KEYS]", Object.keys(pulseSample ?? {}));
    console.log("[BREATHING SAMPLE KEYS]", Object.keys(breathingSample ?? {}));
    console.log("[METRICS TIMESTAMP]", timestamp);

  } catch (error) {
    console.error("[METRICS DECODE ERROR]", error);
  }
}

function registerFrameDiagnostics(instance) {
  let sentFrames = 0;
  let droppedFrames = 0;
  let start = Date.now();

  instance.on("frameSentThrough", (sent) => {
    if (sent) sentFrames++;
    else droppedFrames++;

    const elapsed = Date.now() - start;

    if (elapsed >= 5000) {
      console.log("[SDK FRAME REPORT]", {
        sentFrames,
        droppedFrames,
        elapsedMs: elapsed,
        callbackRate: Number(
          (sentFrames * 1000 / elapsed).toFixed(2)
        )
      });

      sentFrames = 0;
      droppedFrames = 0;
      start = Date.now();
    }
  });
}

async function releaseSession(instance) {
  if (stopping) return;

  stopping = true;
  fpsCallbackActive = false;

  try {
    if (instance) {
      try {
        await instance.stop();
      } catch (error) {
        console.warn("[SDK STOP]", error.message);
      }

      try {
        instance.destroy();
      } catch (error) {
        console.warn("[SDK DESTROY]", error.message);
      }
    }
  } finally {
    stopCameraTracks();

    if (sdk === instance) sdk = null;

    running = false;
    stopping = false;

    startBtn.disabled = false;
    stopBtn.disabled = true;
  }
}

// Start measurement
startBtn.addEventListener("click", async () => {
  if (!consent.checked) {
    hint.textContent = "Please provide camera consent before starting.";
    return;
  }

  if (running || stopping) return;

  if (!API_KEY) {
    hint.textContent = "Presage API key is missing.";
    return;
  }
  resetMeasurements();
  startBtn.disabled = true;
  updateStatus("Connecting");
  hint.textContent = "Opening custom camera stream...";

  let instance = null;

  try {
    // Request a lower-resolution camera stream.
    cameraStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        width: { ideal: 320 },
        height: { ideal: 240 },
        frameRate: { ideal: 30, min: 25 },
        facingMode: "user"
      }
    });

    const track = cameraStream.getVideoTracks()[0];

    console.log("[CUSTOM CAMERA SETTINGS]", track.getSettings());
    console.log("[CUSTOM CAMERA CAPABILITIES]", track.getCapabilities?.());

    video.srcObject = cameraStream;
    await video.play();

    cameraStatus.textContent = "Camera active";

    measureCameraFPS();

    // Create SDK
    instance = new SmartSpectraSDK({
      apiKey: API_KEY,
      requestedMetrics,
      enableTelemetry: false
    });

    sdk = instance;

    // Supply host-owned stream before starting SDK.
    instance.useMediaStream(cameraStream);

    instance.on("streamAvailable", (stream) => {
      console.log("[SDK STREAM AVAILABLE]", stream);
    });

    instance.on("processingStatus", (state) => {
      console.log("[PROCESSING STATUS]", state);
      updateStatus(String(state));
    });

    instance.on("validationStatus", (code, timestamp, message) => {
      console.log("[VALIDATION]", {
        code,
        timestamp,
        message
      });

      hint.textContent = message || "Adjust camera position and lighting.";
    });

    instance.on("metrics", handleMetrics);

    registerFrameDiagnostics(instance);

    instance.on("error", (code, message, retryable) => {
      console.error("[SMARTSPECTRA ERROR]", {
        code,
        message,
        retryable
      });

      updateStatus("Measurement error");
      hint.textContent = message || "Measurement failed.";

      void releaseSession(instance);
    });

    await instance.start();

    if (sdk !== instance) return;

    running = true;
    stopBtn.disabled = false;

    updateStatus("Live");
    hint.textContent =
      "Measurement started. Please remain comfortably positioned.";

  } catch (error) {
    console.error("[START ERROR]", error);

    hint.textContent = error.message || "Could not start measurement.";
    updateStatus("Disconnected");

    if (instance) {
      await releaseSession(instance);
    } else {
      fpsCallbackActive = false;
      stopCameraTracks();
      startBtn.disabled = false;
      stopBtn.disabled = true;
    }
  }
});

// Stop measurement
stopBtn.addEventListener("click", async () => {
  if (!sdk || stopping) return;

  stopBtn.disabled = true;

  const instance = sdk;

  await releaseSession(instance);

  resetMeasurements();

  updateStatus("Stopped");
  hint.textContent = "Session ended. Camera released.";
});

// Guided breathing exercise
breathBtn.addEventListener("click", () => {
  exerciseActive = !exerciseActive;

  if (exerciseActive) {
    inhale = true;

    breathBtn.textContent = "Stop exercise";
    breathCircle.classList.add("active", "inhale");
    breathText.textContent = "Breathe in";

    exerciseTimer = setInterval(() => {
      inhale = !inhale;

      breathCircle.classList.toggle("inhale", inhale);
      breathCircle.classList.toggle("exhale", !inhale);

      breathText.textContent = inhale ? "Breathe in" : "Breathe out";
    }, 4000);

  } else {
    clearInterval(exerciseTimer);
    exerciseTimer = null;

    breathCircle.classList.remove("active", "inhale", "exhale");

    breathBtn.textContent = "Start exercise";
    breathText.textContent = "Ready when you are";
  }
});

// Cleanup when application closes
window.addEventListener("beforeunload", () => {
  fpsCallbackActive = false;

  if (exerciseTimer) {
    clearInterval(exerciseTimer);
  }

  if (sdk) {
    try {
      sdk.destroy();
    } catch (error) {
      console.error(error);
    }
  }

  stopCameraTracks();
});
