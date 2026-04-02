const HEALTH_ENDPOINT = '/api/v1/health'
const INFERENCE_ENDPOINT = '/api/v1/inference/frame'

export async function checkHealth(apiBaseUrl, timeoutMs) {
  const response = await fetchWithTimeout(
    buildUrl(apiBaseUrl, HEALTH_ENDPOINT),
    {},
    timeoutMs,
  )

  if (!response.ok) {
    throw new Error(`Health check fallido con estado HTTP ${response.status}.`)
  }

  return response.json().catch(() => ({}))
}

export async function sendFrameForInference(
  apiBaseUrl,
  frameBlob,
  signal,
  timeoutMs,
) {
  const formData = new FormData()
  formData.append('file', frameBlob, 'frame.jpg')

  const response = await fetchWithTimeout(
    buildUrl(apiBaseUrl, INFERENCE_ENDPOINT),
    {
      method: 'POST',
      body: formData,
      signal,
    },
    timeoutMs,
  )

  if (!response.ok) {
    const errorBody = await safeReadErrorBody(response)
    throw new Error(
      `Inferencia fallida con estado HTTP ${response.status}.${errorBody ? ` ${errorBody}` : ''}`,
    )
  }

  return response.json()
}

function buildUrl(apiBaseUrl, endpoint) {
  return `${apiBaseUrl.replace(/\/+$/, '')}${endpoint}`
}

async function safeReadErrorBody(response) {
  try {
    const data = await response.json()

    if (typeof data?.detail === 'string') {
      return data.detail
    }

    return ''
  } catch {
    return ''
  }
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const timeoutController = new AbortController()
  const timeoutId = window.setTimeout(() => {
    timeoutController.abort()
  }, timeoutMs)

  const mergedSignal = options.signal
    ? AbortSignal.any([options.signal, timeoutController.signal])
    : timeoutController.signal

  try {
    return await fetch(url, {
      ...options,
      signal: mergedSignal,
    })
  } catch (error) {
    if (timeoutController.signal.aborted && error.name === 'AbortError') {
      throw new Error('La peticion ha superado el tiempo de espera configurado.')
    }

    throw error
  } finally {
    window.clearTimeout(timeoutId)
  }
}
