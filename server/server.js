const app = require('./app')
const SocketServer = require('ws').Server
const port = process.env.PORT || 3000
const NATS = require('nats')
const nats = NATS.connect('nats:4222')

const Measurements = require('./models/measurements')
const Vehicle = require('./models/vehicle')

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

const server = app.listen(port, () => console.log(`Listening to ${port}`))

const wss = new SocketServer({ server })

// init Websocket ws and handle incoming connect requests
wss.on('connection', connection = (ws) => {
  console.log('connection ...')
  // on connect message
  ws.on('message', incoming = (message) => {
    console.log('received: ', message)
    ws.send('message back: ' + message)
  })
  // when nats receives a messaage, broadcast it
  nats.subscribe('vehicle.*', async (msg, subject, sid) => {
    const sidArray = sid.split('vehicle.')
    const vehicleName = (sidArray.length > 0 ? sidArray[1] : '')
    const parsedMeasurements = JSON.parse(msg)

    if (parsedMeasurements.gps) {
      parsedMeasurements.gps = parsedMeasurements.gps.split('|') // changing shape from "52.09281539916992|5.114230155944824" to [ '52.09281539916992', '5.114230155944824' ]
      parsedMeasurements.vehicle = vehicleName
    }
    ws.send(JSON.stringify(parsedMeasurements))
  })

  ws.send('message from server at: ' + new Date())
})
