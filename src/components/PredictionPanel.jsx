import {
  AlertCircle,
  CheckCircle2,
  Eye,
  RotateCcw,
  Save,
  Send,
  Server,
  Square,
  Wifi,
  X,
  Zap,
} from 'lucide-react'
import {
  formatConfidence,
  getDisplayLetter,
  getTopCandidates,
} from '../utils/inferencePresentation'

function PredictionPanel({
  isOpen,
  onClose,
  appTitle,
  apiBaseUrlDraft,
  savedApiBaseUrl,
  frameIntervalDraft,
  savedFrameIntervalMs,
  onApiBaseUrlChange,
  onFrameIntervalChange,
  onSaveSettings,
  onResetSettings,
  onStartCamera,
  onStopCamera,
  onStartStreaming,
  onStopStreaming,
  onCheckHealth,
  isCameraActive,
  isStreaming,
  backendHealthy,
  healthLoading,
  prediction,
  feedback,
  metadata,
  error,
  lastSuccessAt,
  statusMessage,
  requestStats,
}) {
  const confidence = formatConfidence(prediction?.confidence)
  const displayLetter = getDisplayLetter(prediction)
  const topCandidates = getTopCandidates(prediction)
  const saveDisabled =
    !apiBaseUrlDraft.trim() || Number(frameIntervalDraft) < 250 || healthLoading

  const healthLabel = healthLoading
    ? 'Comprobando backend'
    : backendHealthy
      ? 'Backend disponible'
      : 'Backend sin conexion'

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/45 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`technical-drawer fixed right-0 top-0 z-50 flex h-full w-full max-w-[720px] flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-modal="true"
        aria-hidden={!isOpen}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] px-5 py-5 sm:px-6">
          <div className="min-w-0">
            <p className="section-kicker">{appTitle}</p>
            <h2 className="section-title">Panel tecnico</h2>
            <p className="section-copy">Controles avanzados y telemetria real de la sesion.</p>
          </div>
          <button type="button" onClick={onClose} className="toolbar-button shrink-0">
            <X size={18} />
            <span>Cerrar</span>
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          <DrawerSection
            title="Backend"
            subtitle="Conexion activa y configuracion de envio"
          >
            <div className="grid gap-3 md:grid-cols-2">
              <InfoBlock
                icon={<Server size={16} />}
                label="Estado"
                value={healthLabel}
                emphasis={backendHealthy}
              />
              <button
                type="button"
                onClick={onCheckHealth}
                disabled={healthLoading}
                className="drawer-secondary-button"
              >
                <Zap size={16} />
                <span>Comprobar backend</span>
              </button>
              <InfoBlock label="URL API" value={savedApiBaseUrl} mono />
              <InfoBlock label="Intervalo de envio" value={`${savedFrameIntervalMs} ms`} />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="drawer-label">URL base API</span>
                <input
                  type="text"
                  value={apiBaseUrlDraft}
                  onChange={(event) => onApiBaseUrlChange(event.target.value)}
                  placeholder="http://127.0.0.1:8000"
                  className="drawer-input"
                />
              </label>
              <label className="space-y-2">
                <span className="drawer-label">Intervalo de envio (ms)</span>
                <input
                  type="number"
                  min="250"
                  step="250"
                  value={frameIntervalDraft}
                  onChange={(event) => onFrameIntervalChange(event.target.value)}
                  className="drawer-input"
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onSaveSettings}
                disabled={saveDisabled}
                className="drawer-save-button"
              >
                <Save size={16} />
                <span>Guardar</span>
              </button>
              <button
                type="button"
                onClick={onResetSettings}
                className="drawer-secondary-button"
              >
                <RotateCcw size={16} />
                <span>Restaurar</span>
              </button>
            </div>
          </DrawerSection>

          <DrawerSection
            title="Prediccion actual"
            subtitle="Resumen de la ultima respuesta del backend"
          >
            <div className="grid gap-3 md:grid-cols-2">
              <InfoBlock label="Letra" value={displayLetter} prominent />
              <InfoBlock label="Confianza" value={confidence} />
              <InfoBlock
                label="Ultima inferencia"
                value={lastSuccessAt ? new Date(lastSuccessAt).toLocaleTimeString() : 'Sin datos'}
              />
              <InfoBlock label="Estado de sesion" value={statusMessage} />
            </div>

            {topCandidates.length > 0 && (
              <div className="mt-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-4">
                <p className="drawer-label">Top predicciones</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {topCandidates.map((candidate) => (
                    <span key={candidate.label} className="candidate-pill">
                      {candidate.label} {formatConfidence(candidate.confidence)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </DrawerSection>

          <DrawerSection
            title="Controles rapidos"
            subtitle="Acciones directas para camara y envio"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <ControlButton
                onClick={onStartCamera}
                disabled={isCameraActive}
                icon={<Eye size={16} />}
                label="Iniciar camara"
                tone="neutral"
              />
              <ControlButton
                onClick={onStopCamera}
                disabled={!isCameraActive}
                icon={<Square size={16} />}
                label="Detener camara"
                tone="danger"
              />
              <ControlButton
                onClick={onStartStreaming}
                disabled={!isCameraActive || isStreaming}
                icon={<Send size={16} />}
                label="Enviar frames"
                tone="accent"
              />
              <ControlButton
                onClick={onStopStreaming}
                disabled={!isStreaming}
                icon={<Wifi size={16} />}
                label="Parar envio"
                tone="neutral"
              />
            </div>
          </DrawerSection>

          <DrawerSection
            title="Estadisticas"
            subtitle="Metricas reales de la sesion actual"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoBlock label="Frames procesados" value={metadata?.processed_frames ?? '--'} />
              <InfoBlock label="Frames con mano" value={metadata?.hand_detected_frames ?? '--'} />
              <InfoBlock label="Solicitudes OK" value={requestStats.successCount} />
              <InfoBlock label="Solicitudes KO" value={requestStats.failureCount} />
            </div>
          </DrawerSection>

          {feedback && (feedback.message || (feedback.tips && feedback.tips.length > 0)) && (
            <DrawerSection
              title="Recomendaciones"
              subtitle="Mensajes justificados por la respuesta del backend"
            >
              <div className="space-y-3">
                {feedback.title && (
                  <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-4">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{feedback.title}</p>
                    {feedback.message && (
                      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                        {feedback.message}
                      </p>
                    )}
                  </div>
                )}
                {feedback?.tips?.map((tip) => (
                  <div
                    key={tip}
                    className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-3 text-sm text-[var(--text-primary)]"
                  >
                    {tip}
                  </div>
                ))}
              </div>
            </DrawerSection>
          )}

          {error && (
            <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p className="leading-6">{error}</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

function DrawerSection({ title, subtitle, children }) {
  return (
    <section className="rounded-[24px] border border-[var(--border-subtle)] bg-[var(--surface-panel)] p-5 shadow-[var(--soft-shadow)]">
      <div className="mb-4">
        <p className="section-title">{title}</p>
        <p className="section-copy">{subtitle}</p>
      </div>
      {children}
    </section>
  )
}

function InfoBlock({ icon, label, value, emphasis = false, mono = false, prominent = false }) {
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-4">
      <div className="mb-2 flex items-center gap-2 text-[var(--text-secondary)]">
        {icon && <span>{icon}</span>}
        <p className="drawer-label">{label}</p>
      </div>
      <p
        className={`leading-6 text-[var(--text-primary)] ${
          prominent
            ? 'text-[2.25rem] font-semibold leading-none'
            : emphasis
              ? 'text-base font-semibold text-[var(--accent-green)]'
              : mono
                ? 'font-mono text-sm break-all'
                : 'text-sm font-medium'
        }`}
      >
        {value}
      </p>
    </div>
  )
}

function ControlButton({ onClick, disabled, icon, label, tone }) {
  const toneClass = {
    neutral: 'drawer-secondary-button',
    accent: 'drawer-accent-button',
    danger: 'drawer-danger-button',
  }[tone]

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={toneClass}>
      {icon}
      <span>{label}</span>
    </button>
  )
}

export default PredictionPanel
