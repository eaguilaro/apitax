const Ingreso = require('../models/Ingreso');

const obtenerTodos = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    const filtro = {};

    if (fechaInicio || fechaFin) {
      if (!fechaInicio || !fechaFin) {
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar fechaInicio y fechaFin'
        });
      }

      const inicio = new Date(`${fechaInicio}T00:00:00.000Z`);
      const finExclusivo = new Date(`${fechaFin}T00:00:00.000Z`);
      finExclusivo.setUTCDate(finExclusivo.getUTCDate() + 1);

      if (Number.isNaN(inicio.getTime()) || Number.isNaN(finExclusivo.getTime()) || inicio >= finExclusivo) {
        return res.status(400).json({
          success: false,
          message: 'El rango de fechas no es válido'
        });
      }

      filtro.fecha = { $gte: inicio, $lt: finExclusivo };
    }

    const ingresos = await Ingreso.find(filtro).sort({ fecha: -1 });
    res.json({
      success: true,
      data: ingresos,
      total: ingresos.length
    });
  } catch (error) {
    console.error('Error al obtener ingresos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener ingresos',
      error: error.message
    });
  }
};

const crear = async (req, res) => {
  try {
    const { fecha, concepto, detalle, valor } = req.body;
    const monto = Number(valor);
    const fechaIngreso = fecha ? new Date(`${fecha}T00:00:00.000Z`) : new Date();

    if (
      typeof concepto !== 'string' || !concepto.trim() ||
      typeof detalle !== 'string' || !detalle.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'El concepto y el detalle son obligatorios'
      });
    }

    if (!Number.isFinite(monto) || monto <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El valor debe ser un número mayor a 0'
      });
    }

    if (Number.isNaN(fechaIngreso.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'La fecha no es válida'
      });
    }

    const nuevoIngreso = await Ingreso.create({
      fecha: fechaIngreso,
      concepto: concepto.trim(),
      detalle: detalle.trim(),
      valor: monto
    });

    res.status(201).json({
      success: true,
      message: 'Ingreso creado exitosamente',
      data: nuevoIngreso
    });
  } catch (error) {
    console.error('Error al crear ingreso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear ingreso',
      error: error.message
    });
  }
};

module.exports = { obtenerTodos, crear };
