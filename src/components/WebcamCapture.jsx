import { CameraOff, TriangleAlert } from 'lucide-react'
import LandmarkOverlay from './LandmarkOverlay'

function WebcamCapture({
  videoRef,
  overlayCanvasRef,
  error,
  isCameraActive,
  isStreaming,
  hasDetection,
  isDarkMode,
}) {
  return (
    <div className={`relative aspect-video w-full overflow-hidden ${isDarkMode ? 'bg-slate-950' : 'bg-slate-100'}`}>
      <video
        ref={videoRef}
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          isCameraActive ? 'opacity-100' : 'opacity-35'
        }`}
        autoPlay
        muted
        playsInline
      />

      <LandmarkOverlay canvasRef={overlayCanvasRef} />

      {(isStreaming || hasDetection) && (
        <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/15 bg-slate-950/68 px-3 py-1.5 text-xs font-medium text-slate-100 shadow-lg">
          {hasDetection ? 'Landmarks visibles' : 'Streaming activo'}
        </div>
      )}

      {!isCameraActive && (
        <div className={`absolute inset-0 flex items-center justify-center p-6 ${isDarkMode ? 'bg-slate-950/78' : 'bg-slate-50/86'}`}>
          <div className="max-w-sm rounded-[24px] border border-white/10 bg-slate-950/72 px-6 py-7 text-center text-slate-50 shadow-xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/8">
              <CameraOff size={28} />
            </div>
            <p className="text-lg font-semibold">Camara detenida</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Activa la captura para iniciar el flujo de video y mostrar las inferencias en directo.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-rose-400/35 bg-rose-500/14 px-4 py-3 text-sm text-rose-50 shadow-lg backdrop-blur">
          <div className="flex items-start gap-3">
            <TriangleAlert size={18} className="mt-0.5 shrink-0" />
            <p className="leading-6">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default WebcamCapture
