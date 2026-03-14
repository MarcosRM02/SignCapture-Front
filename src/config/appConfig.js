const FALLBACKS = {
  appTitle: 'SignCapture Frontend',
  apiBaseUrl: 'http://127.0.0.1:8000',
  defaultFrameIntervalMs: 1200,
  healthcheckIntervalMs: 10000,
  requestTimeoutMs: 8000,
}

function parsePositiveInteger(value, fallback) {
  const parsedValue = Number(value)

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return fallback
  }

  return Math.round(parsedValue)
}

export const appConfig = {
  appTitle: import.meta.env.VITE_APP_TITLE || FALLBACKS.appTitle,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || FALLBACKS.apiBaseUrl,
  defaultFrameIntervalMs: Math.max(
    250,
    parsePositiveInteger(
      import.meta.env.VITE_DEFAULT_FRAME_INTERVAL_MS,
      FALLBACKS.defaultFrameIntervalMs,
    ),
  ),
  healthcheckIntervalMs: parsePositiveInteger(
    import.meta.env.VITE_HEALTHCHECK_INTERVAL_MS,
    FALLBACKS.healthcheckIntervalMs,
  ),
  requestTimeoutMs: parsePositiveInteger(
    import.meta.env.VITE_REQUEST_TIMEOUT_MS,
    FALLBACKS.requestTimeoutMs,
  ),
}

export const storageKeys = {
  apiBaseUrl: 'signcapture.apiBaseUrl',
  frameIntervalMs: 'signcapture.frameIntervalMs',
}
