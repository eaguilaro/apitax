# Frontend - API TAX

Frontend de la aplicación de registro de gastos diarios con Quasar y Vue.js

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Build para producción

```bash
npm run build
```

## Estructura del proyecto

```
frontend/
├── src/
│   ├── components/    # Componentes reutilizables
│   ├── pages/         # Páginas de la aplicación
│   ├── layouts/       # Layouts generales
│   ├── services/      # Servicios de API
│   ├── stores/        # Stores de Pinia
│   ├── router/        # Configuración de rutas
│   ├── App.vue        # Componente principal
│   └── main.js        # Punto de entrada
├── public/            # Archivos estáticos
├── index.html
├── vite.config.js
└── package.json
```

## Páginas principales

- **Listado de Gastos** (`/`) - Visualizar todos los gastos
- **Nuevo Gasto** (`/nuevo`) - Crear nuevo registro
- **Editar Gasto** (`/editar/:id`) - Editar gasto existente
- **Resumen** (`/resumen`) - Ver análisis de gastos por proveedor

## Características

- Lista de gastos con filtrado por fechas
- Crear, editar y eliminar gastos
- Subida de imágenes/recibos
- Visualización de imágenes
- Resumen de gastos por proveedor
- Cálculos de totales y promedios
- Interfaz responsiva para dispositivos móviles
