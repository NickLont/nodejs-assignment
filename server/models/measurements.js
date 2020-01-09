const mongoose = require('mongoose')

// Assumption: all the fields are required
const measurement = mongoose.Schema({
  time: { type: Date, required: true },
  energy: { type: Number, required: true },
  gps: { type: [Number], required: true },
  odo: { type: Number, required: true },
  speed: { type: Number, required: true },
  soc: { type: Number, required: true },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle'
  }
}, { versionKey: false }) // disabling the version number "_v" param

module.exports = mongoose.model('Measurement', measurement)
