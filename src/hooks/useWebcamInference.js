import { useEffect, useState } from "react";
import { appConfig, storageKeys } from "../config/appConfig";
import {
  checkHealth as requestHealth,
  sendFrameForInference,
  sendFeedback as apiSendFeedback,
} from "../services/inferenceApi";
import { usePersistentState } from "./usePersistentState";
import { useWebcamSession } from "./useWebcamSession";

function useWebcamInference() {
  const [savedApiBaseUrl, setSavedApiBaseUrl] = usePersistentState(
    storageKeys.apiBaseUrl,
    appConfig.apiBaseUrl,
  );
  const [savedFrameIntervalMs, setSavedFrameIntervalMs] = usePersistentState(
    storageKeys.frameIntervalMs,
    appConfig.defaultFrameIntervalMs,
  );

  const [apiBaseUrlDraft, setApiBaseUrlDraft] = useState(savedApiBaseUrl);
  const [frameIntervalDraft, setFrameIntervalDraft] =
    useState(savedFrameIntervalMs);
  const [backendHealthy, setBackendHealthy] = useState(false);
  const [healthLoading, setHealthLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState(
    "Camara lista para iniciarse.",
  );
  const [prediction, setPrediction] = useState(null);
  const [lastValidPrediction, setLastValidPrediction] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [landmarks, setLandmarks] = useState([]);
  const [lastSuccessAt, setLastSuccessAt] = useState(null);
  const [requestStats, setRequestStats] = useState({
    successCount: 0,
    failureCount: 0,
    lastRequestDurationMs: 0,
  });

  const {
    videoRef,
    overlayCanvasRef,
    captureCanvasRef,
    streamRef,
    intervalRef,
    healthIntervalRef,
    requestInFlightRef,
    abortControllerRef,
    isCameraActive,
    setIsCameraActive,
    isStreaming,
    setIsStreaming,
    resizeOverlay,
    clearOverlay,
    drawLandmarks,
    stopCameraTracks,
  } = useWebcamSession();

  const activeApiBaseUrl = savedApiBaseUrl.trim();
  const activeFrameIntervalMs = sanitizeFrameInterval(savedFrameIntervalMs);

  useEffect(() => {
    drawLandmarks(landmarks);
  }, [drawLandmarks, landmarks]);

  useEffect(() => {
    setApiBaseUrlDraft(savedApiBaseUrl);
  }, [savedApiBaseUrl]);

  useEffect(() => {
    setFrameIntervalDraft(savedFrameIntervalMs);
  }, [savedFrameIntervalMs]);

  useEffect(() => {
    const runHealthCheck = async () => {
      if (!activeApiBaseUrl) {
        setBackendHealthy(false);
        return;
      }

      setHealthLoading(true);

      try {
        await requestHealth(activeApiBaseUrl, appConfig.requestTimeoutMs);
        setBackendHealthy(true);
      } catch {
        setBackendHealthy(false);
      } finally {
        setHealthLoading(false);
      }
    };

    runHealthCheck();

    if (healthIntervalRef.current) {
      window.clearInterval(healthIntervalRef.current);
    }

    healthIntervalRef.current = window.setInterval(() => {
      runHealthCheck();
    }, appConfig.healthcheckIntervalMs);

    return () => {
      if (healthIntervalRef.current) {
        window.clearInterval(healthIntervalRef.current);
        healthIntervalRef.current = null;
      }
    };
  }, [activeApiBaseUrl, healthIntervalRef]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return undefined;
    }

    const handleLoadedMetadata = () => {
      resizeOverlay();
      drawLandmarks(landmarks);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    window.addEventListener("resize", resizeOverlay);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      window.removeEventListener("resize", resizeOverlay);
    };
  }, [drawLandmarks, landmarks, resizeOverlay, videoRef]);

  useEffect(() => {
    const currentVideo = videoRef.current;

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      stopCameraTracks();

      if (currentVideo) {
        currentVideo.srcObject = null;
      }

      if (healthIntervalRef.current) {
        window.clearInterval(healthIntervalRef.current);
        healthIntervalRef.current = null;
      }
    };
  }, [
    abortControllerRef,
    healthIntervalRef,
    intervalRef,
    stopCameraTracks,
    videoRef,
  ]);

  const stopStreaming = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    requestInFlightRef.current = false;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setIsStreaming(false);
  };

  const stopCamera = () => {
    stopStreaming();
    stopCameraTracks();

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraActive(false);
    setPrediction(null);
    setLastValidPrediction(null);
    setFeedback(null);
    setMetadata(null);
    setLandmarks([]);
    clearOverlay();
    setStatusMessage("Camara detenida.");
  };

  const checkHealth = async () => {
    if (!activeApiBaseUrl) {
      setBackendHealthy(false);
      return;
    }

    setHealthLoading(true);

    try {
      await requestHealth(activeApiBaseUrl, appConfig.requestTimeoutMs);
      setBackendHealthy(true);
      setStatusMessage("Backend accesible y listo para inferencia.");
    } catch (requestError) {
      setBackendHealthy(false);
      setError(buildRequestErrorMessage(requestError));
    } finally {
      setHealthLoading(false);
    }
  };

  const captureAndSendFrame = async () => {
    const video = videoRef.current;

    if (
      !video ||
      !streamRef.current ||
      video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
      requestInFlightRef.current
    ) {
      return;
    }

    if (!captureCanvasRef.current) {
      captureCanvasRef.current = document.createElement("canvas");
    }

    const captureCanvas = captureCanvasRef.current;
    captureCanvas.width = video.videoWidth;
    captureCanvas.height = video.videoHeight;

    const context = captureCanvas.getContext("2d");

    if (!context) {
      setError("No se pudo preparar el canvas de captura.");
      return;
    }

    context.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);

    requestInFlightRef.current = true;
    setError("");

    const startedAt = performance.now();

    try {
      const blob = await new Promise((resolve, reject) => {
        captureCanvas.toBlob(
          (frameBlob) => {
            if (frameBlob) {
              resolve(frameBlob);
              return;
            }

            reject(new Error("No se pudo convertir el frame a imagen."));
          },
          "image/jpeg",
          0.85,
        );
      });

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const response = await sendFrameForInference(
        activeApiBaseUrl,
        blob,
        controller.signal,
        appConfig.requestTimeoutMs,
      );

      const durationMs = Math.round(performance.now() - startedAt);

      setPrediction(response.prediction ?? null);
      if (response.prediction && response.prediction.label !== 'sin_deteccion') {
        setLastValidPrediction(response.prediction);
      }
      setFeedback(response.feedback ?? null);
      setMetadata(response.metadata ?? null);
      setLandmarks(response.landmarks ?? []);
      setLastSuccessAt(Date.now());
      setBackendHealthy(true);
      setStatusMessage("Recibiendo inferencias del backend.");
      setRequestStats((currentStats) => ({
        successCount: currentStats.successCount + 1,
        failureCount: currentStats.failureCount,
        lastRequestDurationMs: durationMs,
      }));
    } catch (requestError) {
      if (requestError.name !== "AbortError") {
        setBackendHealthy(false);
        setLandmarks([]);
        setError(buildRequestErrorMessage(requestError));
        setStatusMessage(
          "La camara sigue activa, pero la inferencia ha fallado.",
        );
        const durationMs = Math.round(performance.now() - startedAt);
        setRequestStats((currentStats) => ({
          successCount: currentStats.successCount,
          failureCount: currentStats.failureCount + 1,
          lastRequestDurationMs: durationMs,
        }));
      }
    } finally {
      requestInFlightRef.current = false;
      abortControllerRef.current = null;
    }
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Este navegador no soporta acceso a webcam con getUserMedia.");
      setStatusMessage("Webcam no soportada.");
      return false;
    }

    setError("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsCameraActive(true);
      setStatusMessage("Camara activa y lista para capturar frames.");
      return true;
    } catch (cameraError) {
      const message =
        cameraError?.name === "NotAllowedError"
          ? "Permiso de camara denegado. Acepta el acceso en el navegador."
          : cameraError?.name === "NotFoundError"
            ? "No se ha encontrado ninguna camara disponible."
            : "No se pudo iniciar la camara.";

      setError(message);
      setStatusMessage("No se pudo activar la camara.");
      return false;
    }
  };

  const startStreaming = () => {
    // Solo verificar que el stream exista (se actualiza instantáneamente, no es asincrónico)
    if (!streamRef.current) {
      setError("Inicia la camara antes de comenzar el envio de frames.");
      return;
    }

    if (!activeApiBaseUrl) {
      setError("Configura una URL base valida antes de comenzar el envio.");
      return;
    }

    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }

    setError("");
    setIsStreaming(true);
    setStatusMessage("Enviando frames periodicamente al backend.");

    intervalRef.current = window.setInterval(() => {
      captureAndSendFrame();
    }, activeFrameIntervalMs);

    captureAndSendFrame();
  };

  const saveSettings = () => {
    const sanitizedApiBaseUrl = apiBaseUrlDraft.trim();
    const sanitizedFrameInterval = sanitizeFrameInterval(frameIntervalDraft);

    setSavedApiBaseUrl(sanitizedApiBaseUrl);
    setSavedFrameIntervalMs(sanitizedFrameInterval);
    setStatusMessage("Configuracion guardada correctamente.");
  };

  const resetSettings = () => {
    setSavedApiBaseUrl(appConfig.apiBaseUrl);
    setSavedFrameIntervalMs(appConfig.defaultFrameIntervalMs);
    setApiBaseUrlDraft(appConfig.apiBaseUrl);
    setFrameIntervalDraft(appConfig.defaultFrameIntervalMs);
    setStatusMessage("Configuracion restaurada a los valores por defecto.");
  };

  const submitFeedback = async (isCorrect) => {
    if (!activeApiBaseUrl) {
      setError("No hay conexión con la API para enviar feedback.");
      return false;
    }
    
    try {
      await apiSendFeedback(activeApiBaseUrl, isCorrect, appConfig.requestTimeoutMs);
      setStatusMessage("Feedback enviado exitosamente.");
      return true;
    } catch (requestError) {
      setError(buildRequestErrorMessage(requestError));
      setStatusMessage("No se pudo enviar el feedback.");
      return false;
    }
  };

  return {
    appTitle: appConfig.appTitle,
    apiBaseUrlDraft,
    savedApiBaseUrl,
    frameIntervalDraft,
    savedFrameIntervalMs: activeFrameIntervalMs,
    setApiBaseUrlDraft,
    setFrameIntervalDraft,
    saveSettings,
    resetSettings,
    isCameraActive,
    isStreaming,
    backendHealthy,
    healthLoading,
    error,
    statusMessage,
    prediction,
    lastValidPrediction,
    feedback,
    metadata,
    landmarks,
    lastSuccessAt,
    requestStats,
    hasDetection: Array.isArray(landmarks) && landmarks.length > 0,
    videoRef,
    overlayCanvasRef,
    startCamera,
    stopCamera,
    startStreaming,
    stopStreaming,
    checkHealth,
    submitFeedback,
  };
}

function sanitizeFrameInterval(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return appConfig.defaultFrameIntervalMs;
  }

  return Math.max(250, Math.round(numericValue));
}

function buildRequestErrorMessage(error) {
  const rawMessage =
    error?.message || "Error desconocido al contactar con la API.";

  if (
    rawMessage.includes("Failed to fetch") ||
    rawMessage.toLowerCase().includes("networkerror")
  ) {
    return "No se pudo conectar con el backend. Revisa la URL base, que FastAPI este levantado y la configuracion CORS.";
  }

  return rawMessage;
}

export default useWebcamInference;
