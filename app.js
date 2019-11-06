const express = require('express')
const app = express()
const NATS = require('nats')
const nats = NATS.connect("nats:4222")
const mongoose = require('mongoose')
require('dotenv').config({path: '.env'})

const Measurements = require('./models/measurements')
const Vehicle = require('./models/vehicle')

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

    if (vehicleName) {
        let vehicle = await Vehicle.findOne({name: vehicleName})
        console.log('Existing vehicle: ', vehicle)
        if (!vehicle) {
            vehicle = new Vehicle({
                name: vehicleName
            })
            console.log('Added a new vehicle: ', vehicle)
            await vehicle.save()
        }


        const measurements = new Measurements({
            time: parsedMeasurements.time,
            energy: parsedMeasurements.energy,
            gps: parsedMeasurements.gps,
            odo: parsedMeasurements.odo,
            speed: parsedMeasurements.speed,
            soc: parsedMeasurements.soc,
            vehicle: vehicle
        })
        await measurements.save()
    }

    // {
    //     time: 1511436456000,
    //     energy: 53.768,
    //     gps: [ '52.09253692626953', '5.109260082244873' ],
    //     odo: 88527.018,
    //     speed: 23,
    //     soc: 72.8
    // }
})

mongoose.connect(process.env.MONGO_DATABASE_URL, {useNewUrlParser: true}) // Connecting to the MongoDB database service
mongoose.Promise = global.Promise // Tell Mongoose to use ES6 promises
mongoose.connection.on('connected', () => {
    console.log('Connected to database')
})
mongoose.connection.on('error', (err) => {
    console.error(`🚫 → ${err.message}`)
})

module.exports = app
