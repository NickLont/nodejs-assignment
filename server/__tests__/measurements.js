const app = require('../app') // Link to your server file
const supertest = require('supertest')
const request = supertest(app)
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const dropAllCollections = require('../helpers').dropAllCollections
const measurementsCollection = require('../constants').measurementsCollection

const mongod = new MongoMemoryServer()

const Measurements = require('../models/measurements')
const Vehicle = require('../models/vehicle')

describe('Measurements endpoints tests', () => {
  beforeAll(async () => { // Connecting to the in-memory database
    process.env.ENVIRONMENT = 'testing'
    jest.setTimeout(10000)
    const uri = await mongod.getConnectionString()

    const mongooseOpts = {
      useNewUrlParser: true,
      autoReconnect: true,
      useUnifiedTopology: true,
      reconnectTries: Number.MAX_VALUE,
      reconnectInterval: 1000
    }

    await mongoose.connect(uri, mongooseOpts)
  })
  beforeEach(async (done) => {
    const vehicle = new Vehicle({ name: 'test-bus-1' })
    await vehicle.save()
    measurementsCollection.map(
      async m => {
        const measurements = new Measurements({
          time: m.time,
          energy: m.energy,
          gps: m.gps,
          odo: m.odo,
          speed: m.speed,
          soc: m.soc,
          vehicle: vehicle
        })
        await measurements.save()
      }
    )
    done()
  })

  afterEach(async () => {
    await Vehicle.deleteMany({})
    await Measurements.deleteMany({})
  })

  it('Testing to see if server is up', async (done) => {
    const res = await request.get('/')
    expect(res.status).toBe(200)
    expect(res.text).toBe('Hello World')
    done()
  })

  it('/measurements/ endpoint without query params', async (done) => {
    const res = await request
      .get('/measurements')
    expect(res.status).toBe(401)
    done()
  })

  it('/measurements/ endpoint with a vehicle name', async (done) => {
    const res = await request
      .get('/measurements')
      .query({ vehicleName: 'test-bus-1' })
    const fetchedVehicle = await Vehicle.findOne({ name: 'test-bus-1' })
    const measurements = await Measurements
      .find({ vehicle: fetchedVehicle }, { _id: 0 })
      .populate('vehicle')
    expect(res.status).toBe(200)
    expect(res.text).toBe(JSON.stringify({ data: measurements }))
    done()
  })

  it('/measurements/ endpoint with a vehicle id', async (done) => {
    const fetchedVehicle = await Vehicle.findOne({ name: 'test-bus-1' })
    const res = await request
      .get('/measurements')
      .query({ vehicleId: fetchedVehicle._id.toString() })
    const measurements = await Measurements
      .find({ vehicle: fetchedVehicle }, { _id: 0 })
      .populate('vehicle')
    expect(res.status).toBe(200)
    expect(res.text).toBe(JSON.stringify({ data: measurements }))
    done()
  })

  it('/measurements/ endpoint with a vehicle and date range', async (done) => {
    const res = await request
      .get('/measurements')
      .query({ vehicleName: 'test-bus-1' })
      .query({ startDate: 1511436382000 })
      .query({ endDate: 1511436388000 })
    const fetchedVehicle = await Vehicle.findOne({ name: 'test-bus-1' })
    const measurements = await Measurements
      .find({ vehicle: fetchedVehicle }, { _id: 0 })
      .populate('vehicle')
    expect(res.status).toBe(200)
    expect(res.text).toBe(JSON.stringify({ data: measurements }))
    done()
  })

  it('/measurements/ endpoint with a vehicle, date range and pagination', async (done) => {
    const res = await request
      .get('/measurements')
      .query({ vehicleName: 'test-bus-1' })
      .query({ startDate: 1511436382000 })
      .query({ endDate: 1511436388000 })
      .query({ pageNo: 1 })
      .query({ size: 1 })
    const fetchedVehicle = await Vehicle.findOne({ name: 'test-bus-1' })
    const measurements = await Measurements
      .find({ vehicle: fetchedVehicle }, { _id: 0 })
      .populate('vehicle')
    expect(res.status).toBe(200)
    expect(res.text).toBe(JSON.stringify({ data: [measurements[0]], pages: 5, current: 1 }))
    done()
  })

  it('/measurements/statistics endpoint', async (done) => {
    const res = await request
      .get('/measurements/statistics')
      .query({ vehicleName: 'test-bus-1' })
    const fetchedVehicle = await Vehicle.findOne({ name: 'test-bus-1' })
    const measurements = await Measurements
      .find({ vehicle: fetchedVehicle }, { _id: 0 })
      .populate('vehicle')
    let min = Infinity; let max = 0; let total = 0
    measurements.map(
      m => {
        if (m.speed > max) max = m.speed
        if (m.speed < min) min = m.speed
        total += m.speed
      }
    )
    expect(res.status).toBe(200)
    expect(res.text).toBe(JSON.stringify([{
      average: total / measurements.length,
      minimum: min,
      maximum: max,
      metric: 'Speed'
    }]))
    done()
  })

  it('/measurements/statistics endpoint with date range', async (done) => {
    const res = await request
      .get('/measurements/statistics')
      .query({ vehicleName: 'test-bus-1' })
      .query({ startDate: 1511436382000 })
      .query({ endDate: 1511436388000 })
    const fetchedVehicle = await Vehicle.findOne({ name: 'test-bus-1' })
    const measurements = await Measurements
      .find({ vehicle: fetchedVehicle }, { _id: 0 })
      .populate('vehicle')
    let min = Infinity; let max = 0; let total = 0
    measurements.map(
      m => {
        if (m.speed > max) max = m.speed
        if (m.speed < min) min = m.speed
        total += m.speed
      }
    )
    expect(res.status).toBe(200)
    expect(res.text).toBe(JSON.stringify([{
      average: total / measurements.length,
      minimum: min,
      maximum: max,
      metric: 'Speed'
    }]))
    done()
  })
  // Drop all collections after tests are done
  afterAll(async () => {
    await dropAllCollections(mongoose)
    // Closes the Mongoose connection
    await mongoose.connection.close()
  })
})
