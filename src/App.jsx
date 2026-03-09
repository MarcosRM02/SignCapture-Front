function App() {
  return (
    <div className="h-screen w-screen bg-gray-900 text-white flex flex-col overflow-hidden">

      {/* Header */}
      <header className="flex items-center px-6 py-4 bg-gray-800 border-b border-gray-700 shrink-0">
        <h1 className="text-2xl font-bold tracking-wide text-white">
          Sign<span className="text-blue-400">Capture</span>
        </h1>
      </header>

      {/* Main content area */}
      <main className="flex flex-1 overflow-hidden">

        {/* Left column — 70% — Camera area */}
        <section className="w-[70%] flex items-center justify-center border-2 border-dashed border-gray-600 m-4 rounded-lg">
          <span className="text-gray-400 text-lg font-medium tracking-wide">
            Área de Cámara
          </span>
        </section>

        {/* Right column — 30% — Prediction panel */}
        <section className="w-[30%] flex items-center justify-center border-2 border-dashed border-gray-600 m-4 ml-0 rounded-lg">
          <span className="text-gray-400 text-lg font-medium tracking-wide">
            Panel de Predicción
          </span>
        </section>

      </main>
    </div>
  )
}

export default App
