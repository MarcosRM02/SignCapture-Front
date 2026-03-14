# SignCapture Frontend

Cliente web en React + Vite para consumir una API FastAPI de deteccion de mano por frame.

## Configuracion

1. Crea un `.env` a partir de `.env.example`.
2. Ajusta la URL base del backend y los intervalos si lo necesitas.

Variables disponibles:

- `VITE_APP_TITLE`: titulo mostrado en la interfaz.
- `VITE_API_BASE_URL`: URL base del backend FastAPI.
- `VITE_DEFAULT_FRAME_INTERVAL_MS`: intervalo inicial de envio de frames.
- `VITE_HEALTHCHECK_INTERVAL_MS`: frecuencia del health check.
- `VITE_REQUEST_TIMEOUT_MS`: timeout de peticiones HTTP.

## Desarrollo

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Notas

- La URL e intervalo tambien se guardan en `localStorage`.
- Si aparece un error CORS, habilita `CORSMiddleware` en FastAPI para el origen del frontend, por ejemplo `http://localhost:5173`.
