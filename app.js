const express = require('express')
const app = express()
const NATS = require('nats')
const nats = NATS.connect("nats:4222")
const mongoose = require('mongoose')
require('dotenv').config({ path: '.env' })

// Subscribe to NATS and watch for keys starting with 'vahicle.'
nats.subscribe('vehicle.*', (msg, subject, sid) => {
    console.log('Received a message: ', msg, ' subject:', subject, ' sid: ', sid )
    const sidArray = sid.split('vehicle.')
    const vehicle = (sidArray.length > 0 ? sidArray[1] : '')
    console.log('vehicle: ', vehicle)
})

mongoose.connect(process.env.MONGO_DATABASE_URL, { useNewUrlParser: true }) // Connecting to the MongoDB database service
mongoose.Promise = global.Promise // Tell Mongoose to use ES6 promises
mongoose.connection.on('connected', () => {
  console.log('Connected to database')
})
mongoose.connection.on('error', (err) => {
  console.error(`🚫 → ${err.message}`)
})

module.exports = app