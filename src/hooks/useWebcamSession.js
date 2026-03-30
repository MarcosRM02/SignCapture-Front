import { useCallback, useRef, useState } from "react";

export function useWebcamSession() {
  const videoRef = useRef(null);
  const captureCanvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const healthIntervalRef = useRef(null);
  const requestInFlightRef = useRef(false);
  const abortControllerRef = useRef(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const resizeOverlay = useCallback(() => {
    const video = videoRef.current;
    const overlayCanvas = overlayCanvasRef.current;

    if (!video || !overlayCanvas || !video.videoWidth || !video.videoHeight) {
      return;
    }

    overlayCanvas.width = video.videoWidth;
    overlayCanvas.height = video.videoHeight;
  }, []);

  const clearOverlay = useCallback(() => {
    const overlayCanvas = overlayCanvasRef.current;
    const context = overlayCanvas?.getContext("2d");

    if (!overlayCanvas || !context) {
      return;
    }

    context.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  }, []);

  const drawLandmarks = useCallback((nextLandmarks) => {
    const overlayCanvas = overlayCanvasRef.current;
    const context = overlayCanvas?.getContext("2d");

    if (!overlayCanvas || !context) {
      return;
    }

    context.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    if (!Array.isArray(nextLandmarks) || nextLandmarks.length === 0) {
      return;
    }

    // Colores vibrantes para las manos
    const colors = ["#6366f1", "#ec4899"]; // Indigo y Pink

    nextLandmarks.forEach((hand, handIndex) => {
      const color = colors[handIndex % colors.length];

      // Dibuja líneas conectando los puntos
      const connections = [
        // Pulgar
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        // Índice
        [0, 5],
        [5, 6],
        [6, 7],
        [7, 8],
        // Medio
        [0, 9],
        [9, 10],
        [10, 11],
        [11, 12],
        // Anular
        [0, 13],
        [13, 14],
        [14, 15],
        [15, 16],
        // Meñique
        [0, 17],
        [17, 18],
        [18, 19],
        [19, 20],
      ];

      // Dibuja líneas
      context.strokeStyle = color;
      context.lineWidth = 2.5;
      context.lineCap = "round";
      context.lineJoin = "round";

      connections.forEach(([start, end]) => {
        if (hand[start] && hand[end]) {
          const fromX = hand[start].x * overlayCanvas.width;
          const fromY = hand[start].y * overlayCanvas.height;
          const toX = hand[end].x * overlayCanvas.width;
          const toY = hand[end].y * overlayCanvas.height;

          context.beginPath();
          context.moveTo(fromX, fromY);
          context.lineTo(toX, toY);
          context.stroke();
        }
      });

      // Dibuja puntos
      hand.forEach((point) => {
        const x = point.x * overlayCanvas.width;
        const y = point.y * overlayCanvas.height;

        context.beginPath();
        context.arc(x, y, 5, 0, Math.PI * 2);
        context.fillStyle = color;
        context.fill();

        // Borde del punto
        context.strokeStyle = "#ffffff";
        context.lineWidth = 1.5;
        context.stroke();
      });
    });
  }, []);

  const stopCameraTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  return {
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
  };
}
