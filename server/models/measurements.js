const mongoose = require('mongoose')

// Clarification: are all the fields required?
const measurement = mongoose.Schema({
  time: { type: Date, required: true },
  energy: { type: Number, required: true },
  gps: { type: [String], required: true },
  odo: { type: Number, required: true },
  speed: { type: Number, required: true },
  soc: { type: Number, required: true },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle'
  }
}, { versionKey: false }) // disabling the version number "_v" param

module.exports = mongoose.model('Measurement', measurement)
