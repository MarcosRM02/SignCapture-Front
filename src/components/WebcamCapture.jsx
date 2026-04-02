import { Eye, Volume2, Wifi, Signal } from 'lucide-react'
import LandmarkOverlay from './LandmarkOverlay'

function WebcamCapture({
  videoRef,
  overlayCanvasRef,
  statusMessage,
  error,
  isCameraActive,
  isStreaming,
  hasDetection,
  isDarkMode,
}) {
  return (
    <div className={`relative overflow-hidden flex flex-col h-full w-full ${isDarkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900' : 'bg-gradient-to-br from-purple-50 to-blue-50'}`}>
      {/* Overlay con información */}
      <div className={`absolute inset-x-0 top-0 z-10 p-2 sm:p-3 md:p-4 lg:p-6 bg-gradient-to-b ${isDarkMode ? 'from-slate-800/80 to-transparent' : 'from-white/80 to-transparent'}`}>
        <div className="flex items-start justify-between gap-2 sm:gap-3 md:gap-4">
          <div className="flex-1 min-w-0 flex flex-col items-end gap-2 flex-shrink-0">
            <div className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg backdrop-blur border-2 ${isDarkMode ? 'bg-slate-700/40 border-slate-600' : 'bg-gradient-to-r from-violet-100 to-cyan-100 border-violet-300'}`}>
              <span className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full ${hasDetection ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <span className={`text-xs font-semibold whitespace-nowrap ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {hasDetection ? 'Detectado' : 'Esperando'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Video Container */}
      <div className={`relative w-full flex-1 flex items-center justify-center overflow-hidden ${isDarkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-blue-50 to-cyan-50'}`}>
        <video
          ref={videoRef}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isCameraActive ? 'opacity-100' : 'opacity-40'
          }`}
          autoPlay
          muted
          playsInline
        />

        <LandmarkOverlay canvasRef={overlayCanvasRef} />

        {!isCameraActive && (
          <div className={`absolute inset-0 flex items-center justify-center backdrop-blur-sm p-4 ${isDarkMode ? 'bg-slate-800/80' : 'bg-white/80'}`}>
            <div className="text-center max-w-xs sm:max-w-sm">
              <div className={`mb-3 sm:mb-4 inline-block p-2.5 sm:p-3 rounded-full border-2 ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-violet-100 to-cyan-100 border-violet-300'}`}>
                <Eye size={24} className={`sm:w-8 sm:h-8 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`} />
              </div>
              <p className={`text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                Cámara detenida
              </p>
              <p className={`text-xs sm:text-sm leading-relaxed font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>
                Presiona "Iniciar Captura" para activar la cámara y comenzar el análisis
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className={`absolute inset-x-2 sm:inset-x-4 bottom-3 sm:bottom-4 z-20 rounded-lg border-2 backdrop-blur px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium shadow-lg ${isDarkMode ? 'border-rose-800 bg-rose-900/80 text-rose-200' : 'border-rose-300 bg-rose-100/95 text-rose-800'}`}>
            {error}
          </div>
        )}
      </div>

      {/* Bottom Info Bar */}
      {isCameraActive && (
        <div className={`p-2 sm:p-3 md:p-4 lg:p-6 border-t-2 ${isDarkMode ? 'bg-gradient-to-t from-slate-800/80 to-transparent border-slate-700' : 'bg-gradient-to-t from-white/80 to-transparent border-violet-200'}`}>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <InfoPill
              icon={<Eye size={14} className="sm:w-4 sm:h-4" />}
              label="Cámara"
              value="Activa"
              active={true}
              isDarkMode={isDarkMode}
            />
            <InfoPill
              icon={<Wifi size={14} className="sm:w-4 sm:h-4" />}
              label="Streaming"
              value={isStreaming ? 'Activo' : 'Parado'}
              active={isStreaming}
              isDarkMode={isDarkMode}
            />
            <InfoPill
              icon={<Signal size={14} className="sm:w-4 sm:h-4" />}
              label="Detección"
              value={hasDetection ? 'Mano' : 'Esperando'}
              active={hasDetection}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function InfoPill({ icon, label, value, active, isDarkMode }) {
  return (
    <div className={`rounded-lg border-2 p-2 sm:p-3 shadow-sm ${isDarkMode ? 'bg-slate-700/40 border-slate-600' : 'bg-gradient-to-br from-blue-100 to-cyan-100 border-cyan-300'}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className={active ? 'text-violet-600' : isDarkMode ? 'text-slate-500' : 'text-slate-400'}>
          {icon}
        </span>
        <p className={`text-xs font-semibold uppercase tracking-wide truncate ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
          {label}
        </p>
      </div>
      <p className={`text-xs sm:text-sm font-bold truncate ${active ? 'text-emerald-600' : isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
        {value}
      </p>
    </div>
  )
}

export default WebcamCapture
