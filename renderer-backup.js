
import { SmartSpectraSDK } from "@smartspectra/node-sdk/renderer";
import { decodeMetrics } from "@smartspectra/node-sdk/messages";

// SmartSpectra SDK v3.5.0 metric IDs
const breathingMetrics = [0, 1, 2];
const cardioMetrics = [15, 16, 17];

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

// SDK state
let sdk = null;
let running = false;
let stopping = false;

// Exercise state
let exerciseActive = false;
let exerciseTimer = null;
let inhale = true;

const breathCircle = document.getElementById("breathCircle");
const breathText = document.getElementById("breathText");
const breathBtn = document.getElementById("breathBtn");

// --------------------------------------------------
// UI helpers
// --------------------------------------------------

function updateStatus(message) {
  status.textContent = "● " + message;
}

function latestValue(list) {
  if (!Array.isArray(list) || list.length === 0) {
    return null;
  }

  const sample = list[list.length - 1];

  return sample?.value ?? null;
}

function updateInsights(pulse, breathing) {
  if (pulse == null && breathing == null) {
    insight.textContent =
      "Waiting for valid signal measurements.";
    return;
  }

  if (pulse != null && breathing != null) {
    insight.textContent =
      `Live measurements received: pulse ${pulse} BPM ` +
      `and breathing ${breathing} breaths per minute.`;
  } else if (breathing != null) {
    insight.textContent =
      `Breathing measurement received: ${breathing} ` +
      "breaths per minute. Pulse data is not available yet.";
  } else {
    insight.textContent =
      "Pulse measurement received. Waiting for breathing data.";
  }
}

// --------------------------------------------------
// Metrics diagnostics
// --------------------------------------------------

function handleMetrics(buffer, timestamp) {
  try {
    const metrics = decodeMetrics(buffer);

    console.log("========== NEUROSENSE METRICS ==========");
    console.dir(metrics, { depth: null });
    console.log("Timestamp:", timestamp);
    console.log("========================================");

    // Do not assume protobuf metric field names.
    // Inspect the actual decoded object before mapping
    // measurements into the dashboard.

  } catch (error) {
    console.error("[METRICS DECODE ERROR]", error);
  }
}

// --------------------------------------------------
// Camera diagnostics
// --------------------------------------------------

function measureCameraFPS() {
  let frameCount = 0;
  let startTime = 0;

  function measure(now) {
    if (!startTime) {
      startTime = now;
    }

    frameCount++;

    if (now - startTime >= 5000) {
      const fps = frameCount * 1000 / (now - startTime);

      console.log(
        "[ACTUAL CAMERA FPS]",
        fps.toFixed(2)
      );

      return;
    }

    if (video.requestVideoFrameCallback) {
      video.requestVideoFrameCallback(measure);
    }
  }

  if (video.requestVideoFrameCallback) {
    video.requestVideoFrameCallback(measure);
  } else {
    console.warn(
      "requestVideoFrameCallback is unavailable."
    );
  }
}



async function handleStream(stream) {
  video.srcObject = stream;

  const track = stream.getVideoTracks()[0];

  console.log("[CAMERA SETTINGS]", track?.getSettings());
  console.log("[CAMERA CAPABILITIES]", track?.getCapabilities?.());

  try {
    await video.play();
  } catch (error) {
    console.error("[VIDEO PLAY ERROR]", error);
  }

  cameraStatus.textContent = "Camera active";

  // Uses the existing measureCameraFPS() function.
  measureCameraFPS();
}



// --------------------------------------------------
// SDK frame delivery diagnostics
// --------------------------------------------------

function registerFrameDiagnostics(instance) {
  let sentFrames = 0;
  let droppedFrames = 0;
  let fpsStart = Date.now();

  instance.on("frameSentThrough", (sent, timestamp) => {
    if (sent) {
      sentFrames++;
    } else {
      droppedFrames++;
    }

    const elapsed = Date.now() - fpsStart;

    if (elapsed >= 5000) {
      console.log("[SDK FRAME REPORT]", {
        sentFrames,
        droppedFrames,
        elapsedMs: elapsed,
        successfulFPS: Number(
          (sentFrames * 1000 / elapsed).toFixed(2)
        )
      });

      sentFrames = 0;
      droppedFrames = 0;
      fpsStart = Date.now();
    }
  });
}

// --------------------------------------------------
// Start measurement
// --------------------------------------------------

startBtn.addEventListener("click", async () => {
  if (!consent.checked) {
    hint.textContent =
      "Please provide camera consent before starting.";
    return;
  }

  if (running || stopping) {
    return;
  }

  if (!API_KEY) {
    hint.textContent = "Presage API key is missing.";
    return;
  }

  try {
    startBtn.disabled = true;
    updateStatus("Connecting");
    hint.textContent = "Initializing SmartSpectra...";

    sdk = new SmartSpectraSDK({
      apiKey: API_KEY,
      requestedMetrics,
      enableTelemetry: false
    });

    const instance = sdk;

    // Register every event listener exactly once.
    instance.on("streamAvailable", handleStream);

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

      hint.textContent =
        message || "Adjust your camera position and lighting.";
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

      // Stop the UI from accepting another start while
      // the failed session is being cleaned up.
      running = false;
      startBtn.disabled = false;
      stopBtn.disabled = true;

      // Do not destroy the SDK inside its own callback.
      // Cleanup is handled asynchronously.
      void cleanupFailedSession(instance);
    });

    await instance.start();

    // Another error may have occurred while start() was pending.
    if (sdk !== instance) {
      return;
    }

    running = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;

    updateStatus("Live");

    hint.textContent =
      "Measurement started. Please remain comfortably positioned.";

  } catch (error) {
    console.error("[START ERROR]", error);

    hint.textContent =
      error.message || "Could not start measurement.";

    updateStatus("Disconnected");

    const failedSdk = sdk;
    sdk = null;

    if (failedSdk) {
      try {
        failedSdk.destroy();
      } catch (destroyError) {
        console.error("[DESTROY ERROR]", destroyError);
      }
    }

    running = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
  }
});

// --------------------------------------------------
// Failed-session cleanup
// --------------------------------------------------

async function cleanupFailedSession(instance) {
  if (stopping) {
    return;
  }

  stopping = true;

  try {
    await instance.stop();
  } catch (error) {
    console.warn("[SDK STOP WARNING]", error);
  }

  try {
    instance.destroy();
  } catch (error) {
    console.warn("[SDK DESTROY WARNING]", error);
  }

  if (sdk === instance) {
    sdk = null;
  }

  video.srcObject = null;
  cameraStatus.textContent = "Camera inactive";

  running = false;
  stopping = false;

  startBtn.disabled = false;
  stopBtn.disabled = true;
}

// --------------------------------------------------
// Stop measurement
// --------------------------------------------------

stopBtn.addEventListener("click", async () => {
  if (!sdk || stopping) {
    return;
  }

  stopping = true;

  const instance = sdk;

  stopBtn.disabled = true;

  try {
    await instance.stop();
  } catch (error) {
    console.error("[STOP ERROR]", error);
    hint.textContent = error.message;
  } finally {
    try {
      instance.destroy();
    } catch (error) {
      console.error("[DESTROY ERROR]", error);
    }

    if (sdk === instance) {
      sdk = null;
    }

    running = false;
    stopping = false;

    video.srcObject = null;

    pulseElement.textContent = "--";
    breathingElement.textContent = "--";

    cameraStatus.textContent = "Camera inactive";

    updateStatus("Stopped");

    hint.textContent = "Session ended. Camera released.";

    insight.textContent =
      "Waiting for valid signal measurements.";

    startBtn.disabled = false;
    stopBtn.disabled = true;
  }
});

// --------------------------------------------------
// Guided breathing exercise
// Independent of measured camera signals.
// --------------------------------------------------

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

      breathText.textContent =
        inhale ? "Breathe in" : "Breathe out";

    }, 4000);

  } else {
    clearInterval(exerciseTimer);
    exerciseTimer = null;

    breathCircle.classList.remove(
      "active",
      "inhale",
      "exhale"
    );

    breathBtn.textContent = "Start exercise";
    breathText.textContent = "Ready when you are";
  }
});

// --------------------------------------------------
// Window cleanup
// --------------------------------------------------

window.addEventListener("beforeunload", () => {
  if (exerciseTimer) {
    clearInterval(exerciseTimer);
    exerciseTimer = null;
  }

  if (sdk) {
    sdk.destroy();
    sdk = null;
  }
});
