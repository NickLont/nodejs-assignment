const express = require('express')
const app = express()
const NATS = require('nats')
const nats = NATS.connect('nats:4222')
const mongoose = require('mongoose')
require('dotenv').config({ path: '../' })

const Measurements = require('./models/measurements')
const Vehicle = require('./models/vehicle')
const vehiclesRoutes = require('./routes/vehicles')
const measurementsRoutes = require('./routes/measurements')

mongoose.connect(process.env.MONGO_DATABASE_URL, { useNewUrlParser: true }) // Connecting to the MongoDB database service
mongoose.Promise = global.Promise // Tell Mongoose to use ES6 promises
mongoose.connection.on('connected', () => {
  console.log('Connected to database')
})
mongoose.connection.on('error', (err) => {
  console.error(`🚫 → ${err.message}`)
})

// Subscribe to NATS and watch for keys starting with 'vehicle.'
// function arguments:
// - msg is the payload for the message
// - reply is an optional reply subject set by the sender (could be undefined)
// - subject is the subject the message was sent (which may be more specific
//   than the subscription subject - see "Wildcard Subscriptions".
// - subscription id is the local id for the subscription
nats.subscribe('vehicle.*', async (msg, subject, sid) => {
  const sidArray = sid.split('vehicle.')
  const vehicleName = (sidArray.length > 0 ? sidArray[1] : '')
  const parsedMeasurements = JSON.parse(msg)

  if (parsedMeasurements.gps) {
    parsedMeasurements.gps = parsedMeasurements.gps.split('|') // changing shape from "52.09281539916992|5.114230155944824" to [ '52.09281539916992', '5.114230155944824' ]
  }

  const {
    time,
    energy,
    gps,
    odo,
    speed,
    soc
  } = parsedMeasurements

  // if vehicle doesn't exist create a new one, otherwise use the existing
  if (vehicleName) {
    let vehicle = await Vehicle.findOne({ name: vehicleName })
    if (!vehicle) {
      vehicle = new Vehicle({
        name: vehicleName
      })
      await vehicle.save().catch(e => {
        console.log(`Error saving vehicle: ${vehicle}`)
      })
    }

    const measurements = new Measurements({
      time,
      energy,
      gps,
      odo,
      speed,
      soc,
      vehicle
    })
    await measurements.save().catch(e => {
      console.log(`Error saving measurements: ${measurements}`)
    })
  }
})

// add headers to responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Authorization, Origin, X-Requested-With, Content-Type, Accept')
  next()
})

// add different routes
app.use('/vehicles', vehiclesRoutes)
app.use('/measurements', measurementsRoutes)

module.exports = app
