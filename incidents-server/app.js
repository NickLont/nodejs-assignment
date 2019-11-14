const express = require('express')
const app = express()
const NATS = require('nats')
// const nats = NATS.connect('localhost:4222')
const nats = NATS.connect('nats:4222')
const mongoose = require('mongoose')
require('dotenv').config({ path: '../.env' })

const Measurements = require('./models/measurements') // TODO place in the same spot with ../server models
const Vehicle = require('./models/vehicle')
const Incident = require('./models/incident')

const port = process.env.INCIDENTS_PORT || 3001

// Connecting to the MongoDB database service with retry in case of first connection failure
const connectWithRetry = () => (
  mongoose.connect(process.env.MLAB_DATABASE_URL, { useNewUrlParser: true }, (err) => {
    if (err) {
      console.error('Failed to connect to mongo on startup - retrying in 1 sec', err)
      setTimeout(connectWithRetry, 1000)
    }
  })
)
connectWithRetry()
mongoose.Promise = global.Promise // Tell Mongoose to use ES6 promises
mongoose.connection.on('connected', () => {
  console.log('Connected to incidents database')
})
mongoose.connection.on('error', (err) => {
  console.error(`🚫 → ${err.message}`)
})

nats.on('connect', (c) => {
  console.log('Connected to nats')
})
nats.on('error', (err) => {
  console.log('Failed to connect to nats')
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

  if (vehicleName) {
    // Check for incidents
    if (soc < 20 || speed > 60) { // if battery level is less than 20%
      let error
      if (soc < 20) {
        error = 'Battery level less than 20%'
      }
      if (speed > 60) {
        error = 'Speed greater than 60km / h'
      }
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

      const incident = new Incident({
        error,
        measurements
      })
      console.log('incident: ', incident)
      await incident.save().catch(e => {
        console.log(`Error saving incident: ${incident}`)
      })
    }
  }
})

// add headers to responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Authorization, Origin, X-Requested-With, Content-Type, Accept')
  next()
})

app.listen(port, () => console.log(`Listening to ${port}`))

module.exports = app
