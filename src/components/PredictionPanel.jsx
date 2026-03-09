function PredictionPanel() {
  return (
    <div className="h-full bg-gray-800 rounded-xl p-6 flex flex-col gap-6">

      {/* Sección Superior — Letra detectada */}
      <div className="flex flex-col items-center gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
          Letra Detectada
        </h2>
        <div className="flex items-center justify-center w-full bg-gray-900 rounded-xl py-6">
          <span className="text-9xl font-extrabold text-green-400 leading-none">
            A
          </span>
        </div>
      </div>

      {/* Sección Media — Tipo de gesto */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
          Tipo de Gesto
        </h3>
        <span className="self-start bg-blue-950 text-blue-300 text-sm font-medium px-4 py-1.5 rounded-full border border-blue-800">
          Estático
        </span>
      </div>

      {/* Sección Inferior — Métricas */}
      <div className="mt-auto">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-3">
          Métricas
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-900 rounded-lg p-3 flex flex-col gap-1">
            <span className="text-xs text-gray-500 uppercase tracking-wide">Confianza</span>
            <span className="text-lg font-bold text-gray-200">98%</span>
          </div>
          <div className="bg-gray-900 rounded-lg p-3 flex flex-col gap-1">
            <span className="text-xs text-gray-500 uppercase tracking-wide">FPS</span>
            <span className="text-lg font-bold text-gray-200">30</span>
          </div>
        </div>
      </div>

    </div>
  )
}

export default PredictionPanel
