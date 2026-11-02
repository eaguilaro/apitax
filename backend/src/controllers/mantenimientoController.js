const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Gasto = require('../models/Gasto');
const Ingreso = require('../models/Ingreso');
const { uploadDir } = require('../config/storage');

const CONFIRMACION_BORRADO = 'BORRAR';

// Prepara colecciones e índices sin eliminar documentos ni archivos existentes.
const inicializarDatos = async (req, res) => {
  try {
    const modelos = [Gasto, Ingreso];
    const resultado = [];

    for (const Modelo of modelos) {
      const nombreColeccion = Modelo.collection.collectionName;
      const coleccionExiste = await mongoose.connection.db
        .listCollections({ name: nombreColeccion }, { nameOnly: true })
        .hasNext();

      if (!coleccionExiste) {
        await Modelo.createCollection();
      }

      const indices = await Modelo.createIndexes();
      resultado.push({
        coleccion: nombreColeccion,
        creada: !coleccionExiste,
        indices
      });
    }

    res.json({
      success: true,
      message: 'Base de datos preparada. No se borraron datos existentes.',
      data: resultado
    });
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    res.status(500).json({
      success: false,
      message: 'No se pudo inicializar la base de datos',
      error: error.message
    });
  }
};

// Conserva la cuenta propietaria y los índices; solo elimina movimientos y archivos de recibos.
const limpiarDatos = async (req, res) => {
  if (!req.body || req.body.confirmacion !== CONFIRMACION_BORRADO) {
    return res.status(400).json({
      success: false,
      message: `Escribe ${CONFIRMACION_BORRADO} para confirmar el borrado`
    });
  }

  let recibosEliminados = 0;
  let gastosEliminados = 0;
  let ingresosEliminados = 0;

  try {
    const archivos = await fs.promises.readdir(uploadDir, { withFileTypes: true });
    const recibos = archivos.filter((archivo) =>
      archivo.isFile() && archivo.name.startsWith('gasto-')
    );

    // Los recibos están en disco y los movimientos en MongoDB; esta operación no es transaccional.
    for (const recibo of recibos) {
      await fs.promises.unlink(path.join(uploadDir, recibo.name));
      recibosEliminados += 1;
    }

    const resultadoGastos = await Gasto.deleteMany({});
    gastosEliminados = resultadoGastos.deletedCount;
    const resultadoIngresos = await Ingreso.deleteMany({});
    ingresosEliminados = resultadoIngresos.deletedCount;

    res.json({
      success: true,
      message: 'Movimientos y recibos eliminados. La cuenta propietaria se conservó.',
      data: { gastosEliminados, ingresosEliminados, recibosEliminados }
    });
  } catch (error) {
    console.error('Error al limpiar los datos:', error);
    res.status(500).json({
      success: false,
      message: 'No se pudo completar la limpieza. Revisa el resultado y vuelve a intentarlo.',
      error: error.message,
      data: { gastosEliminados, ingresosEliminados, recibosEliminados }
    });
  }
};

module.exports = { inicializarDatos, limpiarDatos };
