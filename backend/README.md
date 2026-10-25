# Backend - API TAX

Este es el backend de la aplicación de registro de gastos.

## Instalación

```bash
npm install
```

## Variables de entorno

Configurar el archivo `.env`:

```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/apitax
NODE_ENV=development
```

## Iniciar el servidor

**Desarrollo:**
```bash
npm run dev
```

**Producción:**
```bash
npm start
```

## Estructura del proyecto

```
backend/
├── src/
│   ├── config/       # Configuración (BD, etc)
│   ├── controllers/  # Controladores
│   ├── models/       # Modelos de datos
│   ├── routes/       # Rutas de API
│   ├── middleware/   # Middlewares (upload, etc)
│   └── index.js      # Punto de entrada
├── uploads/          # Directorio de imágenes
├── package.json
├── .env
└── .gitignore
```

## Endpoints disponibles

### Gastos
- `GET /api/gastos` - Obtener todos los gastos
- `GET /api/gastos/:id` - Obtener gasto por ID
- `GET /api/gastos/fecha?fechaInicio=DATE&fechaFin=DATE` - Gastos por rango de fechas
- `GET /api/gastos/resumen` - Resumen de gastos por proveedor
- `POST /api/gastos` - Crear nuevo gasto (con imagen)
- `PUT /api/gastos/:id` - Actualizar gasto
- `DELETE /api/gastos/:id` - Eliminar gasto
