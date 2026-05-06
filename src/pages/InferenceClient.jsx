import { useEffect, useMemo, useState } from 'react'
import {
  Clock3,
  Expand,
  Hand,
  Search,
  Moon,
  PanelsTopLeft,
  Radio,
  Server,
  Square,
  SunMedium,
  X,
  Zap,
} from 'lucide-react'
import PredictionPanel from '../components/PredictionPanel'
import WebcamCapture from '../components/WebcamCapture'
import useWebcamInference from '../hooks/useWebcamInference'
import aslReferenceSrc from '../assets/ASL_Alphabet.png'
import {
  formatConfidence,
  getDisplayLetter,
} from '../utils/inferencePresentation'

function InferenceClient() {
  const [isControlCenterOpen, setIsControlCenterOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isGuideOpen, setIsGuideOpen] = useState(false)

  const {
    appTitle,
    apiBaseUrlDraft,
    savedApiBaseUrl,
    frameIntervalDraft,
    savedFrameIntervalMs,
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
    feedback,
    metadata,
    lastSuccessAt,
    requestStats,
    hasDetection,
    videoRef,
    overlayCanvasRef,
    startCamera,
    stopCamera,
    startStreaming,
    stopStreaming,
    checkHealth,
  } = useWebcamInference()

  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? 'dark' : 'light'
  }, [isDarkMode])

  useEffect(() => {
    if (!isGuideOpen) {
      return undefined
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsGuideOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isGuideOpen])

  const handleToggleRecording = async () => {
    if (isCameraActive && isStreaming) {
      stopCamera()
      stopStreaming()
      return
    }

    const cameraSuccess = await startCamera()
    if (cameraSuccess) {
      startStreaming()
    }
  }

  const isRecording = isCameraActive && isStreaming
  const connectionLabel = healthLoading
    ? 'Comprobando backend'
    : backendHealthy
      ? 'Backend disponible'
      : 'Backend sin conexion'

  const cameraStateLabel = isCameraActive ? 'Activa' : 'Inactiva'
  const streamingStateLabel = isStreaming ? 'Activo' : 'Inactivo'
  const detectionStateLabel = hasDetection ? 'Mano detectada' : 'Sin mano'
  const displayLetter = getDisplayLetter(prediction)
  const confidence = formatConfidence(prediction?.confidence)
  const confidenceValue = typeof prediction?.confidence === 'number'
    ? prediction.confidence * 100
    : null

  const contextualMessage = useMemo(() => {
    if (!hasDetection) {
      return 'Coloca la mano dentro del encuadre.'
    }

    if (typeof confidenceValue !== 'number') {
      return 'Resultado actual de la inferencia.'
    }

    if (confidenceValue >= 90) {
      return `La configuracion de la mano coincide con bastante seguridad con la letra ${displayLetter}.`
    }

    if (confidenceValue >= 70) {
      return 'La prediccion es probable, pero todavia hay cierta ambiguedad.'
    }

    return 'Prediccion poco estable. Intenta centrar mejor la mano.'
  }, [confidenceValue, displayLetter, hasDetection])

  return (
    <div className="app-shell min-h-screen lg:h-screen lg:overflow-hidden">
      <div className="page-shell reference-shell mx-auto flex min-h-screen lg:h-screen w-full flex-col px-4 py-2.5 sm:px-5 sm:py-3 lg:px-8">
        <header className="surface-panel reference-header">
          <div className="header-grid">
            <div className="flex min-w-0 items-start gap-4">
              <div className="brand-mark flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl">
                <Hand size={24} />
              </div>
              <div className="min-w-0">
                <p className="section-kicker mb-1">Reconocimiento ASL en tiempo real</p>
                <h1 className="reference-title">SignCapture</h1>
              </div>
            </div>

            <div className="header-actions header-actions-reference">
              <StatusPill
                icon={<Server size={15} />}
                label={connectionLabel}
                tone={healthLoading ? 'neutral' : (backendHealthy ? 'positive' : 'negative')}
                pulsing={healthLoading}
              />
              <button
                type="button"
                onClick={() => setIsDarkMode((current) => !current)}
                className="toolbar-button"
                title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {isDarkMode ? <SunMedium size={18} /> : <Moon size={18} />}
              </button>
              <button
                type="button"
                onClick={() => setIsControlCenterOpen(true)}
                className="toolbar-button toolbar-button-accent"
              >
                <PanelsTopLeft size={18} />
                <span>Panel tecnico</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 min-h-0">
          <div className="dashboard-grid dashboard-grid-reference h-full">
            <section className="left-column min-h-0 space-y-4">
              <article className="surface-panel camera-shell-card">
                <div className="camera-shell-header">
                  <div className="min-w-0">
                    <p className="section-kicker">Vista en directo</p>
                    <p className="section-copy mt-1">
                      {backendHealthy
                        ? 'Recibiendo inferencias del backend.'
                        : 'Esperando conexion estable con el backend.'}
                    </p>
                  </div>
                  <div className="camera-shell-actions">
                    <StatusPill
                      icon={<Radio size={14} />}
                      label={hasDetection ? 'Mano detectada' : 'Esperando mano'}
                      tone={hasDetection ? 'positive' : 'neutral'}
                    />
                    <button
                      type="button"
                      onClick={handleToggleRecording}
                      disabled={!backendHealthy || healthLoading}
                      className={`session-button ${isRecording ? 'session-button-stop' : 'session-button-start'}`}
                    >
                      <Square size={16} className={isRecording ? 'fill-current' : ''} />
                      <span>{isRecording ? 'Detener captura' : 'Iniciar captura'}</span>
                    </button>
                  </div>
                </div>

                <div className="camera-stage camera-stage-reference">
                  <div className="overflow-hidden rounded-[20px]">
                    <WebcamCapture
                      videoRef={videoRef}
                      overlayCanvasRef={overlayCanvasRef}
                      error={error}
                      isCameraActive={isCameraActive}
                      isStreaming={isStreaming}
                      hasDetection={hasDetection}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                </div>

                <div className="camera-help-text">
                  <span className="camera-help-label">Ayuda contextual:</span>
                  <span>{contextualMessage}</span>
                </div>

              </article>

            </section>

            <section className="middle-column min-h-0 space-y-4">
              <article className="surface-panel info-panel info-panel-tight">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="section-kicker">Letra detectada</p>
                    <p className="section-copy mt-1">Resultado principal de la inferencia actual.</p>
                  </div>
                  <span className="text-sm font-semibold text-[var(--accent-brand)]">
                    {hasDetection ? 'Activo' : 'En espera'}
                  </span>
                </div>

                <div className="prediction-letter-wrap">
                  <div className="prediction-letter prediction-letter-reference mt-3">
                    {displayLetter}
                  </div>
                </div>

              </article>

              <article className="surface-panel info-panel info-panel-tight">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="section-kicker">Referencia ASL</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsGuideOpen(true)}
                    className="guide-expand-button"
                    aria-label="Ampliar guia ASL"
                  >
                    <Search size={14} />
                  </button>
                </div>
                <div className="asl-reference-frame asl-reference-frame-side">
                  <img
                    src={aslReferenceSrc}
                    alt="Guia visual del alfabeto dactilologico ASL"
                    className="asl-reference-image"
                  />
                </div>
              </article>
            </section>

            <aside className="right-column right-column-reference min-h-0 space-y-4">
              <article className="surface-panel info-panel info-panel-tight">
                <div className="mb-4">
                  <p className="section-kicker">Estados del sistema</p>
                  <p className="section-copy mt-1">Resumen esencial de la sesion.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <BasicStatusRow label="Cámara" value={cameraStateLabel} active={isCameraActive} />
                  <BasicStatusRow label="Streaming" value={streamingStateLabel} active={isStreaming} />
                  <BasicStatusRow
                    label="Detección"
                    value={detectionStateLabel}
                    active={hasDetection}
                    className="sm:col-span-2"
                  />
                </div>
              </article>

              <article className="surface-panel info-panel info-panel-tight">
                <div className="mb-4">
                  <p className="section-kicker">Resumen técnico</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <MetricCard icon={<Zap size={16} />} label="Confianza" value={confidence} compact />
                  <MetricCard
                    icon={<Clock3 size={16} />}
                    label="Latencia"
                    value={
                      requestStats.lastRequestDurationMs > 0
                        ? `${requestStats.lastRequestDurationMs} ms`
                        : '--'
                    }
                    compact
                  />
                  <MetricCard label="Solicitudes OK" value={requestStats.successCount} compact />
                  <MetricCard label="Solicitudes KO" value={requestStats.failureCount} compact />
                  <MetricCard
                    label="Última respuesta"
                    value={lastSuccessAt ? new Date(lastSuccessAt).toLocaleTimeString() : '--'}
                    compact
                  />
                  <MetricCard
                    label="Frames con mano"
                    value={metadata?.hand_detected_frames ?? '--'}
                    compact
                  />
                </div>
              </article>
            </aside>
          </div>
        </main>
      </div>

      <PredictionPanel
        isOpen={isControlCenterOpen}
        onClose={() => setIsControlCenterOpen(false)}
        appTitle={appTitle}
        apiBaseUrlDraft={apiBaseUrlDraft}
        savedApiBaseUrl={savedApiBaseUrl}
        frameIntervalDraft={frameIntervalDraft}
        savedFrameIntervalMs={savedFrameIntervalMs}
        onApiBaseUrlChange={setApiBaseUrlDraft}
        onFrameIntervalChange={setFrameIntervalDraft}
        onSaveSettings={saveSettings}
        onResetSettings={resetSettings}
        onStartCamera={startCamera}
        onStopCamera={stopCamera}
        onStartStreaming={startStreaming}
        onStopStreaming={stopStreaming}
        onCheckHealth={checkHealth}
        isCameraActive={isCameraActive}
        isStreaming={isStreaming}
        backendHealthy={backendHealthy}
        healthLoading={healthLoading}
        prediction={prediction}
        feedback={feedback}
        metadata={metadata}
        lastSuccessAt={lastSuccessAt}
        error={error}
        statusMessage={statusMessage}
        requestStats={requestStats}
        isDarkMode={isDarkMode}
      />

      {isGuideOpen && (
        <div
          className="guide-modal-backdrop"
          role="presentation"
          onClick={() => setIsGuideOpen(false)}
        >
          <div
            className="guide-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="asl-guide-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="guide-modal-header">
              <div>
                <p className="section-kicker">Referencia ASL</p>
                <h2 id="asl-guide-title" className="section-title">Guia visual ampliada del alfabeto dactilologico</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsGuideOpen(false)}
                className="toolbar-button"
                aria-label="Cerrar guia ampliada"
              >
                <X size={16} />
                <span>Cerrar</span>
              </button>
            </div>
            <div className="guide-modal-body">
              <div className="asl-reference-frame asl-reference-frame-modal">
                <img
                  src={aslReferenceSrc}
                  alt="Guia visual del alfabeto dactilologico ASL"
                  className="asl-reference-image"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusPill({ icon, label, tone = 'neutral', pulsing = false, eyebrow }) {
  let dotClass = 'bg-[var(--text-secondary)]'
  let pillClass = ''

  if (tone === 'positive') {
    dotClass = 'bg-[var(--accent-green)]'
    pillClass = 'status-pill-positive'
  } else if (tone === 'negative') {
    dotClass = 'bg-[var(--accent-danger)]'
    pillClass = 'status-pill-negative'
  }

  return (
    <div className={`status-pill ${pillClass}`}>
      <span className={`status-pill-dot ${dotClass} ${pulsing ? 'animate-pulse' : ''}`} />
      <span className="status-pill-icon">{icon}</span>
      <span className="flex flex-col leading-tight">
        {eyebrow ? <span className="status-pill-eyebrow">{eyebrow}</span> : null}
        <span>{label}</span>
      </span>
    </div>
  )
}

function MetricCard({ icon, label, value, compact = false }) {
  return (
    <div className={`metric-card ${compact ? 'metric-card-compact' : ''}`}>
      <div className={`flex items-center gap-2 text-[var(--text-secondary)] ${compact ? 'mb-2' : 'mb-3'}`}>
        {icon ? <span className="text-[var(--accent-cyan)]">{icon}</span> : null}
        <p className="mini-label">{label}</p>
      </div>
      <p className={`${compact ? 'text-[1.05rem]' : 'text-[1.35rem]'} font-semibold leading-none text-[var(--text-primary)]`}>
        {value}
      </p>
    </div>
  )
}

function BasicStatusRow({ label, value, active, className = '' }) {
  return (
    <div className={`basic-status-card ${className}`}>
      <span className="mini-label mb-2 block">{label}</span>
      <span className={`text-base font-semibold ${active ? 'text-[var(--accent-green)]' : 'text-[var(--text-primary)]'}`}>
        {value}
      </span>
    </div>
  )
}

export default InferenceClient
