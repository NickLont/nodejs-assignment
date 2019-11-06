const mongoose = require('mongoose')

const vehicle = mongoose.Schema({
    name: {type: String, required: true},
})

module.exports = mongoose.model('Vehicle', vehicle)
