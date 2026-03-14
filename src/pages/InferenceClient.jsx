import { useState } from 'react'
import {
  Play,
  Square,
  Settings,
  Volume2,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertCircle,
  Eye,
  Hand,
  Zap,
  Clock,
  TrendingUp,
  Moon,
  Sun,
} from 'lucide-react'
import PredictionPanel from '../components/PredictionPanel'
import WebcamCapture from '../components/WebcamCapture'
import useWebcamInference from '../hooks/useWebcamInference'

function InferenceClient() {
  const [isControlCenterOpen, setIsControlCenterOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

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

  // Funciones combinadas para start/stop
  const handleToggleRecording = async () => {
    if (isCameraActive && isStreaming) {
      stopCamera()
      stopStreaming()
    } else {
      // Primero inicia la cámara y espera a que esté lista
      const cameraSuccess = await startCamera()
      // Solo si la cámara se inició exitosamente, comienza el envío de frames
      if (cameraSuccess) {
        startStreaming()
      }
    }
  }

  const isRecording = isCameraActive && isStreaming

  const connectionLabel = healthLoading
    ? 'Comprobando backend'
    : backendHealthy
      ? 'Backend disponible'
      : 'Backend sin conexion'

  const confidence =
    typeof prediction?.confidence === 'number'
      ? `${(prediction.confidence * 100).toFixed(1)}%`
      : '--'

  const lastInferenceTime = lastSuccessAt
    ? new Date(lastSuccessAt).toLocaleTimeString()
    : 'Sin inferencias'

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 text-slate-900'} flex flex-col`}>
      {/* Header */}
      <header className={`border-b ${isDarkMode ? 'border-slate-700 bg-slate-800/85' : 'border-purple-200 bg-white/85'} backdrop-blur-xl sticky top-0 z-20 shadow-sm`}>
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1 sm:mb-2">
                <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-violet-500 animate-pulse flex-shrink-0" />
                <span className={`text-xs font-semibold uppercase tracking-widest ${isDarkMode ? 'text-violet-400' : 'text-violet-600'} truncate`}>
                  {appTitle}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-cyan-600">
                Sign Analysis
              </h1>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className={`hidden sm:flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-r from-violet-100 to-cyan-100 border-violet-200'} border text-xs sm:text-sm`}>
                <div className={`h-2 w-2 rounded-full flex-shrink-0 ${backendHealthy ? 'bg-emerald-500' : 'bg-rose-500'} ${healthLoading ? 'animate-pulse' : ''}`} />
                <span className={`font-medium truncate ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {connectionLabel}
                </span>
              </div>
              
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 sm:p-2.5 rounded-lg transition-colors border ${isDarkMode ? 'hover:bg-slate-700 border-slate-600 text-slate-300 hover:text-slate-100' : 'hover:bg-violet-100 border-violet-200 hover:border-violet-300 text-slate-700'} flex-shrink-0`}
                title={isDarkMode ? 'Modo claro' : 'Modo oscuro'}
              >
                {isDarkMode ? <Sun size={18} className="sm:w-5 sm:h-5" /> : <Moon size={18} className="sm:w-5 sm:h-5" />}
              </button>
              
              <button
                onClick={() => setIsControlCenterOpen(true)}
                className={`p-2 sm:p-2.5 rounded-lg transition-colors border ${isDarkMode ? 'hover:bg-slate-700 border-slate-600 text-slate-300 hover:text-slate-100' : 'hover:bg-violet-100 border-violet-200 hover:border-violet-300 text-slate-700'} flex-shrink-0`}
              >
                <Settings size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 h-full">
          {/* Cámara Principal */}
          <div className="lg:col-span-2 flex flex-col gap-3 sm:gap-4 md:gap-6 overflow-hidden">
            {/* Video Container - FIXED ASPECT RATIO 16:9 */}
            <div className={`rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden border-2 ${isDarkMode ? 'border-slate-600 bg-slate-800' : 'border-violet-300 bg-white'} shadow-xl aspect-video`}>
              <WebcamCapture
                videoRef={videoRef}
                overlayCanvasRef={overlayCanvasRef}
                statusMessage={statusMessage}
                error={error}
                isCameraActive={isCameraActive}
                isStreaming={isStreaming}
                hasDetection={hasDetection}
                isDarkMode={isDarkMode}
              />
            </div>

            {/* Unified Capture Button */}
            <div className="flex justify-center flex-shrink-0">
              <button
                onClick={handleToggleRecording}
                disabled={!backendHealthy || healthLoading}
                className={`flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg transition-all duration-300 shadow-lg whitespace-nowrap ${
                  isRecording
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-pink-300/50'
                    : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-cyan-300/50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isRecording ? (
                  <>
                    <Square size={20} className="fill-current flex-shrink-0 sm:w-6 sm:h-6" />
                    <span>Detener Captura</span>
                  </>
                ) : (
                  <>
                    <Play size={20} className="fill-current flex-shrink-0 sm:w-6 sm:h-6" />
                    <span>Iniciar Captura</span>
                  </>
                )}
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
              <StatCard
                icon={<TrendingUp size={16} className="sm:w-5 sm:h-5" />}
                label="Predicción"
                value={prediction?.label || 'Sin deteccion'}
                isDarkMode={isDarkMode}
              />
              <StatCard
                icon={<Zap size={16} className="sm:w-5 sm:h-5" />}
                label="Confianza"
                value={confidence}
                isDarkMode={isDarkMode}
              />
              <StatCard
                icon={<Clock size={16} className="sm:w-5 sm:h-5" />}
                label="Latencia"
                value={
                  requestStats.lastRequestDurationMs > 0
                    ? `${requestStats.lastRequestDurationMs} ms`
                    : '--'
                }
                isDarkMode={isDarkMode}
              />
            </div>
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-3 sm:gap-4 md:gap-6 overflow-y-auto h-full">
            {/* Status Overview */}
            <div className={`rounded-lg sm:rounded-xl backdrop-blur p-4 sm:p-6 border-2 shadow-md ${isDarkMode ? 'bg-slate-700/40 border-slate-600' : 'bg-gradient-to-br from-blue-100 to-cyan-100 border-blue-300'}`}>
              <h3 className={`text-xs sm:text-sm font-semibold uppercase tracking-wide mb-3 sm:mb-4 flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-blue-900'}`}>
                <Volume2 size={14} className="sm:w-4 sm:h-4" />
                Estado del Sistema
              </h3>
              <div className="space-y-2 sm:space-y-3">
                <StatusRow
                  icon={isCameraActive ? <Eye size={14} className="sm:w-4 sm:h-4 text-emerald-600" /> : <Eye size={14} className="sm:w-4 sm:h-4 text-slate-400" />}
                  label="Cámara"
                  value={isCameraActive ? 'Activa' : 'Detenida'}
                  isActive={isCameraActive}
                  isDarkMode={isDarkMode}
                />
                <StatusRow
                  icon={isStreaming ? <Wifi size={14} className="sm:w-4 sm:h-4 text-violet-600" /> : <WifiOff size={14} className="sm:w-4 sm:h-4 text-slate-400" />}
                  label="Streaming"
                  value={isStreaming ? 'En curso' : 'Detenido'}
                  isActive={isStreaming}
                  isDarkMode={isDarkMode}
                />
                <StatusRow
                  icon={hasDetection ? <Hand size={14} className="sm:w-4 sm:h-4 text-orange-600" /> : <Hand size={14} className="sm:w-4 sm:h-4 text-slate-400" />}
                  label="Detección"
                  value={hasDetection ? 'Mano detectada' : 'Esperando'}
                  isActive={hasDetection}
                  isDarkMode={isDarkMode}
                />
                <StatusRow
                  icon={backendHealthy ? <CheckCircle size={14} className="sm:w-4 sm:h-4 text-emerald-600" /> : <AlertCircle size={14} className="sm:w-4 sm:h-4 text-rose-600" />}
                  label="Backend"
                  value={backendHealthy ? 'Disponible' : 'Desconectado'}
                  isActive={backendHealthy}
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>

            {/* Statistics */}
            <div className={`rounded-lg sm:rounded-xl backdrop-blur p-4 sm:p-6 border-2 shadow-md ${isDarkMode ? 'bg-slate-700/40 border-slate-600' : 'bg-gradient-to-br from-pink-100 to-purple-100 border-pink-300'}`}>
              <h3 className={`text-xs sm:text-sm font-semibold uppercase tracking-wide mb-3 sm:mb-4 flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-purple-900'}`}>
                <TrendingUp size={14} className="sm:w-4 sm:h-4" />
                Estadísticas
              </h3>
              <div className="space-y-1.5 sm:space-y-2">
                <StatRowSmall
                  label="Solicitudes exitosas"
                  value={requestStats.successCount}
                  isDarkMode={isDarkMode}
                />
                <StatRowSmall
                  label="Solicitudes fallidas"
                  value={requestStats.failureCount}
                  isDarkMode={isDarkMode}
                />
                <StatRowSmall
                  label="Frames con mano"
                  value={metadata?.hand_detected_frames ?? '--'}
                  isDarkMode={isDarkMode}
                />
                <StatRowSmall
                  label="Última inferencia"
                  value={lastInferenceTime}
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>

            {/* Configuration */}
            <div className={`rounded-lg sm:rounded-xl backdrop-blur p-4 sm:p-6 border-2 shadow-md ${isDarkMode ? 'bg-slate-700/40 border-slate-600' : 'bg-gradient-to-br from-amber-100 to-orange-100 border-amber-300'}`}>
              <h3 className={`text-xs sm:text-sm font-semibold uppercase tracking-wide mb-3 sm:mb-4 flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-amber-900'}`}>
                <Settings size={14} className="sm:w-4 sm:h-4" />
                Configuración
              </h3>
              <div className="space-y-2">
                <ConfigRow
                  label="API Base"
                  value={savedApiBaseUrl}
                  isDarkMode={isDarkMode}
                />
                <ConfigRow
                  label="Intervalo"
                  value={`${savedFrameIntervalMs} ms`}
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>

            {/* Prediction Display - Large Letter Box */}
            <div className={`flex-1 rounded-lg sm:rounded-xl border-3 flex items-center justify-center shadow-xl ${isDarkMode ? 'bg-gradient-to-br from-slate-700 to-slate-800 border-purple-500' : 'bg-gradient-to-br from-purple-100 to-indigo-100 border-purple-400'}`}>
              <div className="text-center">
                <p className={`text-xs sm:text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Letra Detectada
                </p>
                <div className={`text-3xl sm:text-4xl md:text-5xl font-bold transition-all duration-300 ${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600'}`}>
                  {prediction?.label || 'A'}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Control Center Panel */}
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
        metadata={metadata}
        error={error}
        lastSuccessAt={lastSuccessAt}
        statusMessage={statusMessage}
        requestStats={requestStats}
        isDarkMode={isDarkMode}
      />
    </div>
  )
}

// Componentes auxiliares
function StatCard({ icon, label, value, isDarkMode }) {
  return (
    <div className={`rounded-lg sm:rounded-xl border-2 p-3 sm:p-4 md:p-5 shadow-md ${isDarkMode ? 'bg-slate-700/40 border-slate-600' : 'bg-gradient-to-br from-emerald-100 to-cyan-100 border-cyan-300'}`}>
      <div className={`flex items-center gap-2 mb-2 sm:mb-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className={`text-lg sm:text-xl md:text-2xl font-bold break-words ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{value}</p>
    </div>
  )
}

function StatusRow({ icon, label, value, isActive, isDarkMode }) {
  return (
    <div className={`flex items-center justify-between gap-2 p-2 sm:p-2.5 rounded-lg transition-colors border ${isDarkMode ? 'bg-slate-600/30 border-slate-600 hover:bg-slate-600/50' : 'bg-white/50 border-blue-200 hover:bg-white/70'}`}>
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
        {icon}
        <span className={`text-xs sm:text-sm truncate font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{label}</span>
      </div>
      <span className={`text-xs sm:text-sm font-semibold flex-shrink-0 ${isActive ? 'text-emerald-600' : isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
        {value}
      </span>
    </div>
  )
}

function StatRowSmall({ label, value, isDarkMode }) {
  return (
    <div className={`flex justify-between items-center text-xs sm:text-sm gap-2 p-2 rounded-lg ${isDarkMode ? 'bg-slate-600/30' : 'bg-white/50'}`}>
      <span className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{label}</span>
      <span className={`font-bold flex-shrink-0 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{value}</span>
    </div>
  )
}

function ConfigRow({ label, value, isDarkMode }) {
  return (
    <div className={`text-xs sm:text-sm p-2 rounded-lg ${isDarkMode ? 'bg-slate-600/30' : 'bg-white/50'}`}>
      <span className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{label}:</span>
      <p className={`font-mono text-xs break-all mt-1 font-semibold ${isDarkMode ? 'text-slate-300' : 'text-amber-700'}`}>{value}</p>
    </div>
  )
}

export default InferenceClient
