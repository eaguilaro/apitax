# API TAX - Aplicación de Registro de Gastos

Aplicación mobile-first para registrar gastos y recibos, guardar movimientos en MongoDB y consultar ingresos semanales. Incluye backend Node.js/Express y frontend Vue.js con Quasar.

## 📋 Descripción

API TAX es una solución completa para registrar y gestionar gastos diarios. Los usuarios pueden:

- ✅ Registrar gastos con fecha, proveedor, valor, descripción y observaciones
- 📸 Adjuntar recibos en imagen o PDF
- 📊 Ver resumen de gastos por proveedor
- 🔍 Filtrar gastos por rango de fechas
- ✏️ Editar y eliminar gastos
- 💵 Registrar ingresos y consultar el total semanal
- 📱 Interfaz responsiva para dispositivos móviles

## 🏗️ Estructura del Proyecto

```
apitax/
├── backend/               # API Rest con Express
│   ├── src/
│   │   ├── config/       # Configuración (BD)
│   │   ├── controllers/  # Lógica de negocio
│   │   ├── models/       # Esquemas MongoDB
│   │   ├── routes/       # Rutas de API
│   │   ├── middleware/   # Middlewares (upload)
│   │   └── index.js      # Servidor principal
│   ├── uploads/          # Directorio de imágenes
│   └── README.md
│
└── frontend/              # App Vue + Quasar
    ├── src/
    │   ├── components/   # Componentes Vue
    │   ├── pages/        # Páginas principales
    │   ├── layouts/      # Layouts
    │   ├── services/     # Cliente HTTP
    │   ├── stores/       # Estado global (Pinia)
    │   ├── router/       # Rutas
    │   ├── App.vue
    │   └── main.js
    ├── public/
    └── README.md
```

## 🚀 Requisitos Previos

- **Node.js** 24 LTS o superior
- **MongoDB** (local o Atlas)
- **npm** o **yarn**

## 📦 Instalación

### Instalación sencilla con Docker (recomendada)

Requiere Docker Desktop con Compose y Node.js 24 LTS o superior. Desde la raíz:

```powershell
.\setup.bat
```

En Linux/macOS:

```bash
sh ./setup.sh
```

El instalador crea un `.env` local, prepara las colecciones MongoDB y levanta la aplicación en `http://localhost:8080`. Una instalación nueva usa MongoDB 8.0; si detecta un contenedor o volumen local anterior, conserva su versión para evitar una actualización implícita de los datos. Si existe `backend/.env`, reutiliza las claves de autenticación válidas para conservar el acceso a la cuenta actual. No sobrescribas `.env` ni cambies `MONGO_IMAGE` sin respaldar y planificar la migración. Al crear la cuenta propietaria, consulta `AUTH_SETUP_TOKEN` en ese archivo; después, retira ese token del `.env` y reinicia los servicios. MongoDB y los recibos persisten en volúmenes Docker separados.

### 1. Backend

```bash
cd backend
npm install
```

Configurar `.env`:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/apitax
NODE_ENV=development
```

Iniciar servidor:
```bash
npm run dev
```

El servidor estará en: `http://localhost:3001`

### 2. Frontend

```bash
cd frontend
npm install
```

Iniciar aplicación:
```bash
npm run dev
```

La app estará en: `http://localhost:5173`

## 📱 Campos del Registro de Gasto

| Campo | Requerido | Tipo | Descripción |
|-------|-----------|------|-------------|
| idrecibo | Sí | UUID | ID único generado automáticamente |
| fecha | Sí | Fecha | Fecha del gasto |
| proveedor | Sí | String | Nombre del proveedor |
| valor | Sí | Número | Monto del gasto |
| descripcion | Sí | String | Descripción detallada |
| observacion | No | String | Notas adicionales |
| imagen | No | Archivo | Foto del recibo (JPG, PNG, GIF, PDF) |

## 🔌 API Endpoints

### Flujo de captura y almacenamiento

1. La pantalla Vue recoge los campos y el archivo del recibo.
2. El store Pinia llama al servicio Axios, que envía los datos a `/api/gastos` como `multipart/form-data`.
3. Express enruta la petición a Multer, que valida el tipo y tamaño y guarda el archivo en el almacenamiento persistente configurado.
4. El controlador crea un documento `Gasto` en MongoDB con los datos y la ruta del recibo; el archivo binario no se guarda dentro de MongoDB.
5. La API devuelve el gasto y la pantalla vuelve al listado.

`frontend/src/main.js` registra los componentes y directivas de Quasar usados por las páginas. Si se añade un nuevo componente `q-*`, debe añadirse también a esa lista para que Vue lo renderice.

### Inicio de sesión e idiomas

La aplicación protege todas las rutas de datos en el backend y ofrece inicio de sesión de propietario con correo, contraseña y código TOTP. El autenticador genera códigos localmente; no se usa SMS ni un proveedor de mensajes. La cookie de sesión es HttpOnly y la semilla TOTP se cifra en MongoDB. La cuenta inicial requiere `AUTH_SETUP_TOKEN`, `JWT_SECRET` y `AUTH_TOTP_ENCRYPTION_KEY` en el `.env` generado por Docker o en `backend/.env` para el modo manual. Consulta la [guía de autenticación](./GUIA_AUTENTICACION.md) antes de arrancar el backend por primera vez.

La interfaz permite elegir español o inglés con `EN`/`ES`; la selección se guarda en el navegador y las traducciones están en `frontend/src/i18n.js`.

Para despliegue, `VITE_API_BASE_URL` configura la URL base de Axios al compilar. Se recomienda `/api` y un proxy inverso en el mismo origen para compartir la cookie de sesión. `UPLOAD_DIR` configura el almacenamiento persistente de recibos en el backend; lectura y borrado usan esa misma ruta. Consulta la [guía de despliegue](./GUIA_DESPLIEGUE.md) para configurar proxy, CORS y respaldos de MongoDB + recibos.

### Balance semanal y mantenimiento

- `/balance` consulta `GET /api/balance/semanal?anioFiscal=2026`, agrupa movimientos de lunes a domingo dentro del ejercicio julio-junio y calcula `balance = ingresos - gastos`. Permite recorrer ejercicios fiscales, consultar cada semana, ver el historial y una gráfica SVG de tendencia.
- `/mantenimiento` llama a `POST /api/mantenimiento/inicializar`. Crea las colecciones e índices que falten; no borra movimientos ni recibos.
- Desde Mantenimiento también se puede limpiar el ciclo: `POST /api/mantenimiento/limpiar` requiere confirmar con `BORRAR`, elimina gastos, ingresos y recibos, y conserva la cuenta propietaria.
- En móvil, Balance aparece en la barra inferior y Mantenimiento en el menú lateral.

Consulta la [guía de despliegue y uso en móvil/tablet](./GUIA_DESPLIEGUE.md). Es una versión educativa de una cuenta; completa las recomendaciones de producción de las guías antes de publicar datos reales.

### Ver los datos y archivos en desarrollo

**MongoDB desde MongoDB Compass:** conecta a `mongodb://localhost:27017` y abre la base `apitax`. Los gastos están en `gastos` y los ingresos en `ingresos`. Los documentos pueden consultarse también desde la terminal:

```powershell
docker exec -it apitax-mongodb mongosh apitax
```

Dentro de `mongosh`:

```javascript
show collections
db.gastos.find().sort({ createdAt: -1 }).limit(10)
db.ingresos.find().sort({ createdAt: -1 }).limit(10)
```

Para usar la interfaz opcional de Mongo Express incluida en Compose, ejecuta `docker compose --profile tools up -d mongodb mongo-express` desde la raíz del proyecto y abre `http://localhost:8081`.

Los contenedores usan `mongodb_data` para la base y `recibos_data` para los recibos. No borres esos volúmenes si quieres conservar los datos.

**Recibos:** en el modo manual con `npm run dev`, los archivos están en `backend/uploads`; con Docker, están en `recibos_data`. MongoDB solo guarda el nombre (`imagen`) y la ruta (`rutaImagen`) en el gasto. Estos archivos no están dentro del volumen MongoDB; respáldalos por separado.

**Fotos desde el teléfono:** en `/recibos` hay dos opciones: seleccionar una foto/PDF existente o usar “Tomar foto con la cámara”, que solicita la cámara trasera en navegadores móviles compatibles. Al publicar la aplicación, sirve la web por HTTPS para permitir acceso fiable a funciones del dispositivo y usa almacenamiento persistente para los recibos. La cámara depende del navegador y del permiso del teléfono; la opción de subir archivo sigue disponible.

### Ingresos

```
GET    /api/ingresos?fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD - Listar ingresos, opcionalmente por rango
POST   /api/ingresos                                           - Registrar un ingreso
```

Cada ingreso tiene fecha, concepto, detalle y valor. La pantalla semanal agrupa los movimientos de lunes a domingo.

### Gastos

```
GET    /api/gastos                 - Obtener todos
GET    /api/gastos/:id             - Obtener por ID
GET    /api/gastos/fecha            - Filtrar por fechas
GET    /api/gastos/resumen          - Resumen por proveedor
POST   /api/gastos                 - Crear (con archivo)
PUT    /api/gastos/:id             - Actualizar (con archivo)
DELETE /api/gastos/:id             - Eliminar
```

### Autenticación

```
GET    /api/auth/status          - Consulta estado de configuración
POST   /api/auth/setup/start     - Alta inicial protegida con AUTH_SETUP_TOKEN
POST   /api/auth/setup/verify    - Confirma TOTP y activa cuenta
POST   /api/auth/login           - Correo, contraseña y código TOTP
GET    /api/auth/me              - Consulta la sesión actual
POST   /api/auth/logout          - Cierra la sesión
```

Todas las rutas `/api` distintas de las anteriores requieren cookie de sesión. Las escrituras también validan el origen; el contenido de `/uploads` requiere sesión.

### Balance y mantenimiento

```
GET    /api/balance/semanal?anioFiscal=2026 - Balance semanal del ejercicio julio-junio (año en que inicia)
POST   /api/mantenimiento/inicializar - Prepara colecciones e índices sin borrar datos
```

## 🎨 Características Principales

### Backend
- ✅ Autenticación TOTP para un propietario y protección de API/recibos
- ✅ Validación de datos
- ✅ Manejo de errores global
- ✅ Subida de archivos con Multer
- ✅ Agregaciones MongoDB
- ✅ CORS habilitado

### Frontend
- ✅ Componentes Quasar optimizados
- ✅ State management con Pinia
- ✅ Validación de formularios
- ✅ Vista previa de imágenes
- ✅ Notificaciones toast
- ✅ Modal para visualizar recibos
- ✅ Responsive design

## 💾 Tecnologías

### Backend
- Express.js
- MongoDB + Mongoose
- Multer (Upload de archivos)
- UUID (ID únicos)

### Frontend
- Vue.js 3 (Composition API)
- Quasar Framework
- Pinia (State management)
- Axios (Client HTTP)
- Vite (Build tool)

## 📝 Scripts

### Backend
```bash
npm start       # Producción
npm run dev     # Desarrollo con nodemon
```

### Frontend
```bash
npm run dev     # Desarrollo
npm run build   # Producción
npm run preview # Preview del build
```

## 🗄️ Modelo de Datos (MongoDB)

```javascript
{
  _id: ObjectId,
  idrecibo: UUID,
  fecha: Date,
  proveedor: String,
  valor: Number,
  descripcion: String,
  observacion: String,
  imagen: String,         // nombre del archivo
  rutaImagen: String,    // ruta accesible /uploads/...
  createdAt: Date,
  updatedAt: Date
}
```

Los ingresos se almacenan en `ingresos`, un documento por movimiento. MongoDB conserva el nombre y la ruta de cada recibo; el archivo se guarda fuera de la base en el volumen Docker o en la ruta configurada para el modo manual. Consulta el [plan de trabajo y diseño de datos](./PLAN_DE_TRABAJO.md) para el esquema y las decisiones de modelado.

## 🔐 Seguridad

Consideraciones implementadas:
- CORS configurado
- Validación de tipos de archivo
- Límite de tamaño de archivo (10 MB)
- Sanitización de nombres de archivo
- Manejo seguro de rutas

## 🚀 Despliegue

Para desplegar en producción:

**Backend**: Railway, Render, Heroku
**Frontend**: Vercel, Netlify, Github Pages

## 📞 Soporte

Para reportar bugs o sugerencias, contacte al equipo de desarrollo.

## 📄 Licencia

ISC

---

**Versión**: 1.0.0  
**Última actualización**: Marzo 2026
