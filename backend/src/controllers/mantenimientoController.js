const mongoose = require('mongoose');
const Gasto = require('../models/Gasto');
const Ingreso = require('../models/Ingreso');

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

module.exports = { inicializarDatos };
