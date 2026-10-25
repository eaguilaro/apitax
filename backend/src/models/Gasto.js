const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const gastoSchema = new mongoose.Schema({
  idrecibo: {
    type: String,
    default: () => uuidv4(),
    unique: true,
    trim: true
  },
  fecha: {
    type: Date,
    required: true,
    default: Date.now
  },
  proveedor: {
    type: String,
    required: true,
    trim: true
  },
  valor: {
    type: Number,
    required: true,
    min: 0
  },
  descripcion: {
    type: String,
    required: true,
    trim: true
  },
  observacion: {
    type: String,
    trim: true,
    default: ''
  },
  imagen: {
    type: String,
    default: null
  },
  rutaImagen: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Mongoose persiste este modelo en la colección "gastos" de la base apitax.
gastoSchema.index({ fecha: -1 });

// Middleware para actualizar updatedAt
gastoSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Gasto', gastoSchema);
