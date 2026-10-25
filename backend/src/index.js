require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
const gastoRoutes = require('./routes/gastoRoutes');
const authRoutes = require('./routes/authRoutes');
const { requireAuth } = require('./middleware/requireAuth');
const requireSameOrigin = require('./middleware/requireSameOrigin');
const { uploadDir } = require('./config/storage');

const app = express();
const PORT = process.env.PORT || 3001;
const allowedOrigins = new Set([
  process.env.FRONTEND_ORIGIN,
  ...(process.env.NODE_ENV === 'production'
    ? []
    : ['http://localhost:5173', 'http://127.0.0.1:5173'])
].filter(Boolean));

// Conectar a MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    callback(null, false);
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// La autenticación es pública solo para configurar o abrir una sesión; el resto de la API requiere sesión.
app.use('/api', requireSameOrigin);
app.use('/api/auth', authRoutes);
app.use('/api', requireAuth, gastoRoutes);
app.use('/uploads', requireAuth, express.static(uploadDir));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    message: '¡Bienvenido a API TAX!',
    version: '1.0.0',
    status: 'En funcionamiento'
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Manejo de errores general
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Error del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n✓ Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`✓ Ambiente: ${process.env.NODE_ENV}`);
});
