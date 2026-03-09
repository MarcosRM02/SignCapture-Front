import WebcamCapture from './components/WebcamCapture'
import PredictionPanel from './components/PredictionPanel'

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
      <main className="flex flex-1 overflow-hidden p-4 gap-4">

        {/* Left column — 70% — Webcam */}
        <section className="w-[70%] overflow-hidden rounded-lg">
          <WebcamCapture />
        </section>

        {/* Right column — 30% — Prediction panel */}
        <section className="w-[30%] h-full">
          <PredictionPanel />
        </section>

      </main>
    </div>
  )
}

export default App
