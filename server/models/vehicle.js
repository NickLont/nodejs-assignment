const mongoose = require('mongoose')

const vehicle = mongoose.Schema({
  name: { type: String, required: true }
}, { versionKey: false })

module.exports = mongoose.model('Vehicle', vehicle)
