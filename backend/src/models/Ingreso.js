const mongoose = require('mongoose');

const ingresoSchema = new mongoose.Schema({
  fecha: {
    type: Date,
    required: true,
    default: Date.now
  },
  concepto: {
    type: String,
    required: true,
    trim: true
  },
  detalle: {
    type: String,
    required: true,
    trim: true
  },
  valor: {
    type: Number,
    required: true,
    min: 0.01
  }
}, {
  timestamps: true
});

ingresoSchema.index({ fecha: -1 });

module.exports = mongoose.model('Ingreso', ingresoSchema);
