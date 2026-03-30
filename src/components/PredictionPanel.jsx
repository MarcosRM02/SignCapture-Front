import { X, Settings, CheckCircle, AlertCircle, Save, RotateCcw, Wifi, Eye, Zap } from 'lucide-react'
import {
  formatConfidence,
  getDisplayLetter,
  getPredictionSummary,
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
  isDarkMode,
}) {
  const confidence = formatConfidence(prediction?.confidence)
  const displayLetter = getDisplayLetter(prediction)
  const predictionSummary = getPredictionSummary(prediction)
  const topCandidates = getTopCandidates(prediction).slice(1)

  const saveDisabled =
    !apiBaseUrlDraft.trim() || Number(frameIntervalDraft) < 250 || healthLoading

  const healthLabel = healthLoading
    ? 'Comprobando backend'
    : backendHealthy
      ? 'Backend disponible'
      : 'Backend sin conexion'

  const feedbackTone = getFeedbackTone(feedback?.level, isDarkMode)
  const feedbackTips = feedback?.tips?.length
    ? feedback.tips
    : ['Activa la camara y empieza a signar para recibir indicaciones.']

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className={`fixed right-0 top-0 z-40 flex h-full w-full max-w-full sm:max-w-md md:max-w-lg flex-col border-l-4 shadow-2xl transition-transform duration-300 ${
          isDarkMode
            ? 'border-slate-700 bg-gradient-to-b from-slate-800/95 to-slate-900/95'
            : 'border-violet-300 bg-gradient-to-b from-white/95 to-blue-50/95'
        } ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-modal="true"
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className={`border-b-2 ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-violet-200 bg-gradient-to-r from-violet-50 to-cyan-50'} px-4 sm:px-6 py-4 sm:py-6 backdrop-blur flex items-start justify-between gap-3 sm:gap-4 flex-shrink-0`}>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-semibold uppercase tracking-widest mb-1 sm:mb-2 ${isDarkMode ? 'text-slate-400' : 'text-violet-600'}`}>
              {appTitle}
            </p>
            <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r truncate ${isDarkMode ? 'from-slate-100 to-slate-300' : 'from-violet-600 to-pink-600'}`}>
              Control Center
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors border-2 flex-shrink-0 ${isDarkMode ? 'hover:bg-slate-700 border-slate-600 text-slate-300 hover:text-slate-100' : 'hover:bg-violet-100 border-violet-200 text-slate-700 hover:text-slate-900'}`}
          >
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 ${isDarkMode ? 'bg-gradient-to-b from-slate-800 to-slate-900' : ''}`}>
          {/* Backend Status */}
          <section className={`rounded-lg sm:rounded-xl border-2 p-4 sm:p-6 shadow-md ${isDarkMode ? 'bg-slate-700/40 border-slate-600' : 'bg-gradient-to-br from-blue-100 to-cyan-100 border-cyan-300'}`}>
            <div className="flex items-start justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold uppercase tracking-widest mb-1 sm:mb-2 ${isDarkMode ? 'text-slate-400' : 'text-blue-900'}`}>
                  Backend
                </p>
                <p className={`text-base sm:text-lg font-bold break-words ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{healthLabel}</p>
              </div>
              <button
                type="button"
                onClick={onCheckHealth}
                disabled={healthLoading}
                className={`p-2 sm:p-2.5 rounded-lg transition-colors border-2 disabled:opacity-50 flex-shrink-0 ${isDarkMode ? 'hover:bg-slate-700 border-slate-600 text-slate-300 hover:text-slate-100' : 'hover:bg-blue-200 border-blue-300 text-blue-700 hover:text-blue-900'}`}
              >
                <Zap size={16} className="sm:w-5 sm:h-5" />
              </button>
            </div>
            <p className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{statusMessage}</p>
          </section>

          {/* Current Prediction */}
          <section className={`rounded-lg sm:rounded-xl border-2 p-4 sm:p-6 shadow-md ${isDarkMode ? 'bg-slate-700/40 border-slate-600' : 'bg-gradient-to-br from-orange-100 to-pink-100 border-pink-300'}`}>
            <p className={`text-xs font-semibold uppercase tracking-widest mb-3 sm:mb-4 ${isDarkMode ? 'text-slate-400' : 'text-pink-900'}`}>
              Predicción Actual
            </p>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className={`rounded-lg border p-2.5 sm:p-3 ${isDarkMode ? 'bg-slate-600/30 border-slate-600' : 'bg-white/60 border-pink-200'}`}>
                <p className={`text-xs mb-1 sm:mb-2 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>Resultado</p>
                <p className={`text-xs sm:text-sm font-bold break-words ${isDarkMode ? 'text-slate-200' : 'text-violet-600'}`}>
                  {predictionSummary}
                </p>
              </div>
              <div className={`rounded-lg border p-2.5 sm:p-3 ${isDarkMode ? 'bg-slate-600/30 border-slate-600' : 'bg-white/60 border-pink-200'}`}>
                <p className={`text-xs mb-1 sm:mb-2 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>Confianza</p>
                <p className="text-xs sm:text-sm font-bold text-emerald-600">{confidence}</p>
              </div>
              <div className={`rounded-lg border p-2.5 sm:p-3 col-span-2 ${isDarkMode ? 'bg-slate-600/30 border-slate-600' : 'bg-white/60 border-pink-200'}`}>
                <p className={`text-xs mb-1 sm:mb-2 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>Última inferencia</p>
                <p className={`text-xs sm:text-sm font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                  {lastSuccessAt ? new Date(lastSuccessAt).toLocaleTimeString() : 'Sin datos'}
                </p>
              </div>
            </div>
            <div className={`mt-3 sm:mt-4 rounded-lg border p-3 sm:p-4 ${feedbackTone.container}`}>
              <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${feedbackTone.eyebrow}`}>
                Coaching
              </p>
              <p className={`text-sm sm:text-base font-bold mb-1 ${feedbackTone.title}`}>
                {feedback?.title || 'Esperando una deteccion clara'}
              </p>
              <p className={`text-xs sm:text-sm leading-relaxed ${feedbackTone.message}`}>
                {feedback?.message || 'Cuando la API reciba una postura reconocible, aqui veras consejos para corregirla.'}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-bold border ${isDarkMode ? 'border-slate-500 bg-slate-700/60 text-slate-100' : 'border-white/80 bg-white/70 text-slate-800'}`}>
                  Letra: {displayLetter}
                </span>
                {topCandidates.map((candidate) => (
                  <span
                    key={candidate.label}
                    className={`rounded-full px-3 py-1 text-xs font-semibold border ${isDarkMode ? 'border-slate-500 bg-slate-800/70 text-slate-200' : 'border-white/80 bg-white/70 text-slate-700'}`}
                  >
                    {candidate.label} {formatConfidence(candidate.confidence)}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Configuration */}
          <section className={`rounded-lg sm:rounded-xl border-2 p-4 sm:p-6 shadow-md ${isDarkMode ? 'bg-slate-700/40 border-slate-600' : 'bg-gradient-to-br from-amber-100 to-orange-100 border-amber-300'}`}>
            <p className={`text-xs font-semibold uppercase tracking-widest mb-3 sm:mb-4 ${isDarkMode ? 'text-slate-400' : 'text-amber-900'}`}>
              Configuración API
            </p>

            <label className="block mb-3 sm:mb-4">
              <span className={`text-xs font-semibold uppercase tracking-widest mb-1.5 sm:mb-2 block ${isDarkMode ? 'text-slate-400' : 'text-amber-900'}`}>
                URL Base API
              </span>
              <input
                type="text"
                value={apiBaseUrlDraft}
                onChange={(e) => onApiBaseUrlChange(e.target.value)}
                placeholder="http://127.0.0.1:8000"
                className={`w-full rounded-lg border-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm placeholder-slate-400 focus:outline-none transition font-medium ${isDarkMode ? 'bg-slate-600/30 border-slate-600 text-slate-100 placeholder-slate-500 focus:border-slate-400' : 'bg-white/70 border-amber-200 text-slate-900 placeholder-slate-400 focus:border-amber-400'}`}
              />
            </label>

            <label className="block mb-4 sm:mb-5">
              <span className={`text-xs font-semibold uppercase tracking-widest mb-1.5 sm:mb-2 block ${isDarkMode ? 'text-slate-400' : 'text-amber-900'}`}>
                Intervalo de Envío (ms)
              </span>
              <input
                type="number"
                min="250"
                step="250"
                value={frameIntervalDraft}
                onChange={(e) => onFrameIntervalChange(e.target.value)}
                className={`w-full rounded-lg border-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm placeholder-slate-400 focus:outline-none transition font-medium ${isDarkMode ? 'bg-slate-600/30 border-slate-600 text-slate-100 placeholder-slate-500 focus:border-slate-400' : 'bg-white/70 border-amber-200 text-slate-900 placeholder-slate-400 focus:border-amber-400'}`}
              />
            </label>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4">
              <button
                type="button"
                onClick={onSaveSettings}
                disabled={saveDisabled}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border-2 text-white disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xs sm:text-sm transition shadow-md ${isDarkMode ? 'bg-gradient-to-r from-emerald-700 to-cyan-700 border-emerald-600 hover:from-emerald-600 hover:to-cyan-600' : 'bg-gradient-to-r from-emerald-400 to-cyan-400 border-emerald-500 hover:from-emerald-500 hover:to-cyan-500'}`}
              >
                <Save size={14} className="sm:w-4 sm:h-4" />
                Guardar
              </button>
              <button
                type="button"
                onClick={onResetSettings}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border-2 font-bold text-xs sm:text-sm transition shadow-md ${isDarkMode ? 'bg-gradient-to-r from-slate-700 to-slate-600 border-slate-600 text-slate-200 hover:from-slate-600 hover:to-slate-500' : 'bg-gradient-to-r from-slate-200 to-slate-300 border-slate-400 text-slate-900 hover:from-slate-300 hover:to-slate-400'}`}
              >
                <RotateCcw size={14} className="sm:w-4 sm:h-4" />
                Restaurar
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className={`rounded-lg border p-2.5 sm:p-3 ${isDarkMode ? 'bg-slate-600/30 border-slate-600' : 'bg-white/60 border-amber-200'}`}>
                <p className={`text-xs mb-1 sm:mb-2 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>API Activa</p>
                <p className={`text-xs font-mono break-all font-bold ${isDarkMode ? 'text-slate-200' : 'text-amber-700'}`}>{savedApiBaseUrl}</p>
              </div>
              <div className={`rounded-lg border p-2.5 sm:p-3 ${isDarkMode ? 'bg-slate-600/30 border-slate-600' : 'bg-white/60 border-amber-200'}`}>
                <p className={`text-xs mb-1 sm:mb-2 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>Intervalo Activo</p>
                <p className={`text-xs sm:text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>{savedFrameIntervalMs} ms</p>
              </div>
            </div>
          </section>

          {/* Quick Controls */}
          <section className={`rounded-lg sm:rounded-xl border-2 p-4 sm:p-6 shadow-md ${isDarkMode ? 'bg-slate-700/40 border-slate-600' : 'bg-gradient-to-br from-green-100 to-emerald-100 border-emerald-300'}`}>
            <p className={`text-xs font-semibold uppercase tracking-widest mb-3 sm:mb-4 ${isDarkMode ? 'text-slate-400' : 'text-emerald-900'}`}>
              Controles Rápidos
            </p>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
              <QuickButton
                onClick={onStartCamera}
                disabled={isCameraActive}
                icon={<Eye size={14} className="sm:w-4 sm:h-4" />}
                label="Iniciar Cámara"
                color="emerald"
                isDarkMode={isDarkMode}
              />
              <QuickButton
                onClick={onStopCamera}
                disabled={!isCameraActive}
                icon={<Eye size={14} className="sm:w-4 sm:h-4" />}
                label="Detener Cámara"
                color="rose"
                isDarkMode={isDarkMode}
              />
              <QuickButton
                onClick={onStartStreaming}
                disabled={!isCameraActive || isStreaming}
                icon={<Wifi size={14} className="sm:w-4 sm:h-4" />}
                label="Enviar"
                color="cyan"
                isDarkMode={isDarkMode}
              />
              <QuickButton
                onClick={onStopStreaming}
                disabled={!isStreaming}
                icon={<Wifi size={14} className="sm:w-4 sm:h-4" />}
                label="Parar Envío"
                color="amber"
                isDarkMode={isDarkMode}
              />
            </div>
          </section>

          {/* Statistics */}
          <section className={`rounded-lg sm:rounded-xl border-2 p-4 sm:p-6 shadow-md ${isDarkMode ? 'bg-slate-700/40 border-slate-600' : 'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-300'}`}>
            <p className={`text-xs font-semibold uppercase tracking-widest mb-3 sm:mb-4 ${isDarkMode ? 'text-slate-400' : 'text-purple-900'}`}>
              Estadísticas
            </p>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <StatBlock
                label="Frames Procesados"
                value={metadata?.processed_frames ?? '--'}
                isDarkMode={isDarkMode}
              />
              <StatBlock
                label="Frames con Mano"
                value={metadata?.hand_detected_frames ?? '--'}
                isDarkMode={isDarkMode}
              />
              <StatBlock label="Solicitudes OK" value={requestStats.successCount} isDarkMode={isDarkMode} />
              <StatBlock label="Solicitudes KO" value={requestStats.failureCount} isDarkMode={isDarkMode} />
            </div>
          </section>

          <section className={`rounded-lg sm:rounded-xl border-2 p-4 sm:p-6 shadow-md ${feedbackTone.container}`}>
            <p className={`text-xs font-semibold uppercase tracking-widest mb-3 sm:mb-4 ${feedbackTone.eyebrow}`}>
              Recomendaciones
            </p>
            <div className="space-y-2">
              {feedbackTips.map((tip) => (
                <div
                  key={tip}
                  className={`rounded-lg border px-3 py-2 text-xs sm:text-sm ${isDarkMode ? 'border-slate-600 bg-slate-800/40 text-slate-200' : 'border-white/80 bg-white/65 text-slate-800'}`}
                >
                  {tip}
                </div>
              ))}
            </div>
          </section>

          {/* Error Display */}
          {error && (
            <section className={`rounded-lg sm:rounded-xl border-2 p-3 sm:p-4 shadow-md ${isDarkMode ? 'bg-slate-700/40 border-slate-600' : 'bg-gradient-to-br from-rose-100 to-pink-100 border-rose-300'}`}>
              <div className="flex gap-2 sm:gap-3">
                <AlertCircle size={16} className={`sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`} />
                <p className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-rose-200' : 'text-rose-800'}`}>{error}</p>
              </div>
            </section>
          )}
        </div>
      </aside>
    </>
  )
}

function getFeedbackTone(level, isDarkMode) {
  const tones = {
    success: {
      container: isDarkMode
        ? 'bg-emerald-900/20 border-emerald-700'
        : 'bg-gradient-to-br from-emerald-100 to-teal-100 border-emerald-300',
      eyebrow: isDarkMode ? 'text-emerald-300' : 'text-emerald-900',
      title: isDarkMode ? 'text-emerald-100' : 'text-emerald-950',
      message: isDarkMode ? 'text-emerald-50/90' : 'text-emerald-900',
    },
    info: {
      container: isDarkMode
        ? 'bg-cyan-900/20 border-cyan-700'
        : 'bg-gradient-to-br from-cyan-100 to-blue-100 border-cyan-300',
      eyebrow: isDarkMode ? 'text-cyan-300' : 'text-cyan-900',
      title: isDarkMode ? 'text-cyan-100' : 'text-cyan-950',
      message: isDarkMode ? 'text-cyan-50/90' : 'text-cyan-900',
    },
    warning: {
      container: isDarkMode
        ? 'bg-amber-900/20 border-amber-700'
        : 'bg-gradient-to-br from-amber-100 to-orange-100 border-amber-300',
      eyebrow: isDarkMode ? 'text-amber-300' : 'text-amber-900',
      title: isDarkMode ? 'text-amber-100' : 'text-amber-950',
      message: isDarkMode ? 'text-amber-50/90' : 'text-amber-900',
    },
    error: {
      container: isDarkMode
        ? 'bg-rose-900/20 border-rose-700'
        : 'bg-gradient-to-br from-rose-100 to-pink-100 border-rose-300',
      eyebrow: isDarkMode ? 'text-rose-300' : 'text-rose-900',
      title: isDarkMode ? 'text-rose-100' : 'text-rose-950',
      message: isDarkMode ? 'text-rose-50/90' : 'text-rose-900',
    },
  }

  return tones[level] || tones.info
}

function QuickButton({ onClick, disabled, icon, label, color, isDarkMode }) {
  const colorClasses = {
    emerald: isDarkMode ? 'bg-gradient-to-r from-emerald-700 to-cyan-700 border-2 border-emerald-600 text-white hover:from-emerald-600 hover:to-cyan-600' : 'bg-gradient-to-r from-emerald-400 to-cyan-400 border-2 border-emerald-500 text-white hover:from-emerald-500 hover:to-cyan-500',
    rose: isDarkMode ? 'bg-gradient-to-r from-rose-700 to-pink-700 border-2 border-rose-600 text-white hover:from-rose-600 hover:to-pink-600' : 'bg-gradient-to-r from-rose-400 to-pink-400 border-2 border-rose-500 text-white hover:from-rose-500 hover:to-pink-500',
    cyan: isDarkMode ? 'bg-gradient-to-r from-cyan-700 to-blue-700 border-2 border-cyan-600 text-white hover:from-cyan-600 hover:to-blue-600' : 'bg-gradient-to-r from-cyan-400 to-blue-400 border-2 border-cyan-500 text-white hover:from-cyan-500 hover:to-blue-500',
    amber: isDarkMode ? 'bg-gradient-to-r from-amber-700 to-orange-700 border-2 border-amber-600 text-white hover:from-amber-600 hover:to-orange-600' : 'bg-gradient-to-r from-amber-400 to-orange-400 border-2 border-amber-500 text-white hover:from-amber-500 hover:to-orange-500',
  }[color]

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center justify-center gap-1.5 p-2.5 sm:p-3 rounded-lg transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-bold ${colorClasses}`}
    >
      {icon}
      <span className="text-xs font-semibold text-center break-words">{label}</span>
    </button>
  )
}

function StatBlock({ label, value, isDarkMode }) {
  return (
    <div className={`rounded-lg border-2 p-2.5 sm:p-3 ${isDarkMode ? 'bg-slate-600/30 border-slate-600' : 'bg-white/60 border-purple-200'}`}>
      <p className={`text-xs mb-1 sm:mb-2 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>{label}</p>
      <p className={`text-base sm:text-lg font-bold ${isDarkMode ? 'text-slate-200' : 'text-purple-700'}`}>{value}</p>
    </div>
  )
}

export default PredictionPanel
