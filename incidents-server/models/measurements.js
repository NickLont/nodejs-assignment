const mongoose = require('mongoose')

// Clarification: are all the fields required?
const measurement = mongoose.Schema({
  time: { type: Date },
  energy: { type: Number },
  gps: { type: [String] },
  odo: { type: Number },
  speed: { type: Number },
  soc: { type: Number },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle'
  }
}, { versionKey: false }) // disabling the version number "_v" param

module.exports = mongoose.model('Measurement', measurement)
