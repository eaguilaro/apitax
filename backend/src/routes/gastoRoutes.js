const express = require('express');
const router = express.Router();
const gastoController = require('../controllers/gastoController');
const ingresoController = require('../controllers/ingresoController');
const mantenimientoController = require('../controllers/mantenimientoController');
const upload = require('../middleware/upload');

// Las rutas conectan el endpoint HTTP con su controlador; Multer procesa el recibo antes de crear el gasto.
router.get('/balance/semanal', gastoController.obtenerBalanceSemanal);
router.post('/mantenimiento/inicializar', mantenimientoController.inicializarDatos);
router.post('/mantenimiento/limpiar', mantenimientoController.limpiarDatos);
router.get('/ingresos', ingresoController.obtenerTodos);
router.post('/ingresos', ingresoController.crear);

// Rutas para gastos
router.get('/gastos', gastoController.obtenerTodos);
router.get('/gastos/resumen', gastoController.obtenerResumen);
router.get('/gastos/fecha', gastoController.obtenerPorFecha);
router.get('/gastos/:id', gastoController.obtenerPorId);
router.post('/gastos', upload.single('imagen'), gastoController.crear);
router.put('/gastos/:id', upload.single('imagen'), gastoController.actualizar);
router.delete('/gastos/:id', gastoController.eliminar);

module.exports = router;
