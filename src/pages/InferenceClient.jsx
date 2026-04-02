import { useState } from 'react'
import {
  Play,
  Square,
  Settings,
  Zap,
  Clock,
  Moon,
  Sun,
} from 'lucide-react'
import PredictionPanel from '../components/PredictionPanel'
import WebcamCapture from '../components/WebcamCapture'
import useWebcamInference from '../hooks/useWebcamInference'
import {
  formatConfidence,
  getDisplayLetter,
} from '../utils/inferencePresentation'

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

  const confidence = formatConfidence(prediction?.confidence)
  const displayLetter = getDisplayLetter(prediction)

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 text-slate-900'} flex flex-col`}>
      {/* Header */}
      <header className={`border-b ${isDarkMode ? 'border-slate-700 bg-slate-800/85' : 'border-purple-200 bg-white/85'} backdrop-blur-xl sticky top-0 z-20 shadow-sm`}>
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-cyan-600">
                SignCapture
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
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(280px,0.9fr)] gap-4 sm:gap-6 h-full">
          {/* Cámara Principal */}
          <div className="flex flex-col gap-3 sm:gap-4 md:gap-6 overflow-hidden">
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

          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-3 sm:gap-4 h-full min-h-[220px]">
            {/* Prediction Display - Large Letter Box */}
            <div className={`flex-1 min-h-[220px] rounded-lg sm:rounded-xl border-3 flex items-center justify-center shadow-xl ${isDarkMode ? 'bg-gradient-to-br from-slate-700 to-slate-800 border-purple-500' : 'bg-gradient-to-br from-purple-100 to-indigo-100 border-purple-400'}`}>
              <div className="text-center">
                <p className={`text-xs sm:text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Letra Detectada
                </p>
                <div className={`text-3xl sm:text-4xl md:text-5xl font-bold transition-all duration-300 ${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600'}`}>
                  {displayLetter}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
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
        error={error}
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

export default InferenceClient
