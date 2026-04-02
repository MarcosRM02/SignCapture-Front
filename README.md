# SignCapture Frontend

Frontend web construido con React y Vite para capturar imagen desde la webcam, enviar frames a un backend de inferencia y mostrar en tiempo real la letra detectada, su confianza y el estado general del sistema.

El proyecto esta pensado como cliente visual para una API de vision por computador o reconocimiento de signos. La aplicacion se conecta a un backend FastAPI, comprueba si esta disponible y, cuando el usuario activa la captura, envia imagenes periodicamente para obtener predicciones.

## Que hace este proyecto

- Activa la webcam del navegador.
- Envia frames al backend cada cierto intervalo configurable.
- Muestra la letra detectada y el nivel de confianza.
- Dibuja landmarks de la mano sobre el video cuando el backend los devuelve.
- Ensena metricas basicas como latencia, solicitudes correctas y errores.
- Permite cambiar la URL del backend y el intervalo de envio desde la interfaz.
- Guarda la configuracion en `localStorage` para no tener que reconfigurarla en cada recarga.

## Flujo de uso

1. La app comprueba automaticamente si el backend esta disponible.
2. El usuario pulsa `Iniciar Captura`.
3. El navegador solicita permiso para usar la camara.
4. La app empieza a enviar frames al backend.
5. La interfaz muestra la prediccion actual, la confianza y el estado de las peticiones.

## Requisitos

- `Node.js` y `npm`
- Un backend accesible compatible con los endpoints esperados
- Un navegador con soporte para `getUserMedia`

## Instalacion

1. Instala las dependencias:

```bash
npm install
```

2. Crea tu archivo de entorno a partir del ejemplo:

```bash
cp .env.example .env
```

En Windows PowerShell puedes usar:

```powershell
Copy-Item .env.example .env
```

3. Ajusta las variables del `.env` segun tu entorno.

4. Arranca el servidor de desarrollo:

```bash
npm run dev
```

5. Abre en el navegador la URL que muestre Vite, normalmente `http://localhost:5173`.

## Variables de entorno

Estas variables se leen al arrancar la aplicacion:

| Variable | Descripcion | Valor por defecto |
| --- | --- | --- |
| `VITE_APP_TITLE` | Titulo interno de la aplicacion | `SignCapture Frontend` |
| `VITE_API_BASE_URL` | URL base del backend | `http://127.0.0.1:8000` |
| `VITE_DEFAULT_FRAME_INTERVAL_MS` | Intervalo inicial entre envios de frames | `1200` |
| `VITE_HEALTHCHECK_INTERVAL_MS` | Frecuencia de comprobacion del backend | `10000` |
| `VITE_REQUEST_TIMEOUT_MS` | Tiempo maximo de espera por peticion | `8000` |

## Como iniciar el proyecto

### Desarrollo

```bash
npm run dev
```

Levanta la aplicacion en modo desarrollo con recarga automatica.

### Build de produccion

```bash
npm run build
```

Genera la version optimizada en la carpeta `dist`.

### Vista previa de la build

```bash
npm run preview
```

Sirve localmente la build generada para comprobar el resultado final.

### Lint

```bash
npm run lint
```

Ejecuta ESLint sobre el proyecto.

## Como usar la interfaz

### Pantalla principal

- Muestra el video de la webcam.
- Ensena la letra detectada en grande.
- Muestra confianza y latencia.
- Permite iniciar o detener la captura con un unico boton.

### Panel `Control Center`

Desde el icono de ajustes puedes:

- Ver el estado del backend.
- Cambiar la URL base de la API.
- Ajustar el intervalo de envio de frames.
- Guardar o restaurar la configuracion.
- Lanzar acciones rapidas como iniciar o detener camara y streaming.
- Consultar estadisticas y las secciones de ayuda del panel.

## Integracion con el backend

Este frontend espera que el backend exponga al menos estos endpoints:

- `GET /api/v1/health`
- `POST /api/v1/inference/frame`

La peticion de inferencia se envia como `multipart/form-data`, con el frame en el campo `file`.

La respuesta JSON de inferencia puede incluir campos como:

- `prediction`
- `feedback`
- `metadata`
- `landmarks`

## Configuracion persistente

La aplicacion guarda en `localStorage`:

- La URL activa del backend
- El intervalo de envio de frames

Esto permite recargar la pagina sin perder la configuracion manual hecha desde la interfaz.

Si guardas una URL o un intervalo desde el panel de ajustes, esos valores se reutilizaran en futuras recargas aunque el `.env` tenga otros valores.

## Problemas comunes

### El backend aparece como no disponible

- Verifica que el servidor este arrancado.
- Comprueba que `VITE_API_BASE_URL` o la URL guardada en la interfaz sea correcta.
- Revisa si el backend responde al endpoint `/api/v1/health`.

### Error de CORS

Si frontend y backend estan en origenes distintos, habilita CORS en el backend para el origen del frontend, por ejemplo:

- `http://localhost:5173`

### La camara no arranca

- Acepta el permiso del navegador.
- Comprueba que no haya otra aplicacion bloqueando la webcam.
- Verifica que tu navegador soporte `navigator.mediaDevices.getUserMedia`.

### No se reciben predicciones

- Revisa si el backend esta procesando correctamente el endpoint de inferencia.
- Comprueba que el backend devuelve JSON valido.
- Reduce el intervalo de envio si necesitas una respuesta mas frecuente.

## Estructura principal

```text
src/
  components/      Componentes visuales de la interfaz
  config/          Configuracion global y claves persistentes
  hooks/           Logica de webcam, estado y comunicacion con la API
  pages/           Vista principal de la aplicacion
  services/        Cliente HTTP para hablar con el backend
  utils/           Formateo y helpers de presentacion
```

## Resumen rapido

Si quieres ponerlo en marcha cuanto antes:

```bash
npm install
Copy-Item .env.example .env
npm run dev
```

Despues abre la app, revisa que el backend este disponible y pulsa `Iniciar Captura`.
