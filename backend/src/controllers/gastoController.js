const Gasto = require('../models/Gasto');
const Ingreso = require('../models/Ingreso');
const path = require('path');
const fs = require('fs');
const { uploadDir } = require('../config/storage');

const inicioDeSemanaUTC = (fecha) => {
  const inicio = new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate()));
  const diasDesdeLunes = (inicio.getUTCDay() + 6) % 7;
  inicio.setUTCDate(inicio.getUTCDate() - diasDesdeLunes);
  return inicio;
};

// Agrupa los dos tipos de movimiento por lunes UTC y completa semanas sin movimientos.
const obtenerBalanceSemanal = async (req, res) => {
  try {
    const semanasSolicitadas = Number(req.query.semanas || 12);
    if (!Number.isInteger(semanasSolicitadas) || semanasSolicitadas < 1 || semanasSolicitadas > 104) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro semanas debe ser un entero entre 1 y 104'
      });
    }

    const lunesActual = inicioDeSemanaUTC(new Date());
    const desde = new Date(lunesActual);
    desde.setUTCDate(desde.getUTCDate() - (semanasSolicitadas - 1) * 7);
    const hasta = new Date(lunesActual);
    hasta.setUTCDate(hasta.getUTCDate() + 7);

    const agruparPorSemana = [
      { $match: { fecha: { $gte: desde, $lt: hasta } } },
      {
        $group: {
          _id: {
            $dateTrunc: {
              date: '$fecha',
              unit: 'week',
              startOfWeek: 'monday',
              timezone: 'UTC'
            }
          },
          total: { $sum: '$valor' },
          cantidad: { $sum: 1 }
        }
      }
    ];

    const [gastosPorSemana, ingresosPorSemana] = await Promise.all([
      Gasto.aggregate(agruparPorSemana),
      Ingreso.aggregate(agruparPorSemana)
    ]);

    const gastosIndexados = new Map(gastosPorSemana.map((semana) => [
      semana._id.toISOString().slice(0, 10),
      semana
    ]));
    const ingresosIndexados = new Map(ingresosPorSemana.map((semana) => [
      semana._id.toISOString().slice(0, 10),
      semana
    ]));

    const semanas = [];
    for (let indice = 0; indice < semanasSolicitadas; indice += 1) {
      const inicio = new Date(desde);
      inicio.setUTCDate(inicio.getUTCDate() + indice * 7);
      const clave = inicio.toISOString().slice(0, 10);
      const gastoSemana = gastosIndexados.get(clave);
      const ingresoSemana = ingresosIndexados.get(clave);
      const totalGastos = gastoSemana ? gastoSemana.total : 0;
      const totalIngresos = ingresoSemana ? ingresoSemana.total : 0;
      const fin = new Date(inicio);
      fin.setUTCDate(fin.getUTCDate() + 6);

      semanas.push({
        inicio: clave,
        fin: fin.toISOString().slice(0, 10),
        totalIngresos,
        totalGastos,
        balance: totalIngresos - totalGastos,
        cantidadIngresos: ingresoSemana ? ingresoSemana.cantidad : 0,
        cantidadGastos: gastoSemana ? gastoSemana.cantidad : 0
      });
    }

    res.json({ success: true, data: semanas });
  } catch (error) {
    console.error('Error al obtener el balance semanal:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el balance semanal',
      error: error.message
    });
  }
};

// Obtener todos los gastos
const obtenerTodos = async (req, res) => {
  try {
    const gastos = await Gasto.find().sort({ fecha: -1 });
    res.json({
      success: true,
      data: gastos,
      total: gastos.length
    });
  } catch (error) {
    console.error('Error al obtener gastos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener gastos',
      error: error.message
    });
  }
};

// Obtener gasto por ID
const obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const gasto = await Gasto.findById(id);
    
    if (!gasto) {
      return res.status(404).json({
        success: false,
        message: 'Gasto no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: gasto
    });
  } catch (error) {
    console.error('Error al obtener gasto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener gasto',
      error: error.message
    });
  }
};

// Crear nuevo gasto
const crear = async (req, res) => {
  try {
    const { fecha, proveedor, valor, descripcion, observacion } = req.body;
    
    // Validaciones
    if (!proveedor || !valor || !descripcion) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: proveedor, valor, descripción'
      });
    }
    
    // Multer deja el archivo en uploads y solo guardamos sus metadatos en MongoDB.
    const nuevoGasto = new Gasto({
      fecha: fecha ? new Date(fecha) : new Date(),
      proveedor,
      valor: parseFloat(valor),
      descripcion,
      observacion: observacion || '',
      imagen: req.file ? req.file.filename : null,
      rutaImagen: req.file ? `/uploads/${req.file.filename}` : null
    });
    
    await nuevoGasto.save();
    
    res.status(201).json({
      success: true,
      message: 'Gasto creado exitosamente',
      data: nuevoGasto
    });
  } catch (error) {
    console.error('Error al crear gasto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear gasto',
      error: error.message
    });
  }
};

// Actualizar gasto
const actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha, proveedor, valor, descripcion, observacion } = req.body;
    
    const gasto = await Gasto.findById(id);
    
    if (!gasto) {
      return res.status(404).json({
        success: false,
        message: 'Gasto no encontrado'
      });
    }
    
    // Eliminar imagen anterior si hay una nueva
    if (req.file && gasto.imagen) {
      const rutaAnterior = path.join(uploadDir, gasto.imagen);
      if (fs.existsSync(rutaAnterior)) {
        fs.unlinkSync(rutaAnterior);
      }
    }
    
    // Actualizar campos
    if (fecha) gasto.fecha = new Date(fecha);
    if (proveedor) gasto.proveedor = proveedor;
    if (valor) gasto.valor = parseFloat(valor);
    if (descripcion) gasto.descripcion = descripcion;
    if (observacion !== undefined) gasto.observacion = observacion;
    
    // Si hay nuevo archivo
    if (req.file) {
      gasto.imagen = req.file.filename;
      gasto.rutaImagen = `/uploads/${req.file.filename}`;
    }
    
    await gasto.save();
    
    res.json({
      success: true,
      message: 'Gasto actualizado exitosamente',
      data: gasto
    });
  } catch (error) {
    console.error('Error al actualizar gasto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar gasto',
      error: error.message
    });
  }
};

// Eliminar gasto
const eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    const gasto = await Gasto.findByIdAndDelete(id);
    
    if (!gasto) {
      return res.status(404).json({
        success: false,
        message: 'Gasto no encontrado'
      });
    }
    
    // Eliminar archivo de imagen si existe
    if (gasto.imagen) {
      const rutaImagen = path.join(uploadDir, gasto.imagen);
      if (fs.existsSync(rutaImagen)) {
        fs.unlinkSync(rutaImagen);
      }
    }
    
    res.json({
      success: true,
      message: 'Gasto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar gasto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar gasto',
      error: error.message
    });
  }
};

// Obtener gastos por rango de fechas
const obtenerPorFecha = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    
    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar fechaInicio y fechaFin'
      });
    }
    
    const gastos = await Gasto.find({
      fecha: {
        $gte: new Date(fechaInicio),
        $lte: new Date(fechaFin)
      }
    }).sort({ fecha: -1 });
    
    const total = gastos.reduce((sum, gasto) => sum + gasto.valor, 0);
    
    res.json({
      success: true,
      data: gastos,
      total: total,
      cantidad: gastos.length
    });
  } catch (error) {
    console.error('Error al obtener gastos por fecha:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener gastos por fecha',
      error: error.message
    });
  }
};

// Obtener resumen de gastos por proveedor
const obtenerResumen = async (req, res) => {
  try {
    const resumen = await Gasto.aggregate([
      {
        $group: {
          _id: '$proveedor',
          total: { $sum: '$valor' },
          cantidad: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);
    
    const totalGeneral = resumen.reduce((sum, item) => sum + item.total, 0);
    
    res.json({
      success: true,
      data: resumen,
      totalGeneral: totalGeneral
    });
  } catch (error) {
    console.error('Error al obtener resumen:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener resumen',
      error: error.message
    });
  }
};

module.exports = {
  obtenerBalanceSemanal,
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  obtenerPorFecha,
  obtenerResumen
};
