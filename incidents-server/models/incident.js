const mongoose = require('mongoose')

const incident = mongoose.Schema({
  error: { type: String, require },
  measurements: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Measurement'
  },
  time: { type: Date, default: Date.now }
}, { versionKey: false }) // disabling the version number "_v" param

module.exports = mongoose.model('Incident', incident)
