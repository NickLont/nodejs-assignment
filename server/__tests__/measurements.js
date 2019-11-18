const app = require('../app') // Link to your server file
const supertest = require('supertest')
const request = supertest(app)
const mongoose = require('mongoose')
const dropAllCollections = require('../helpers').dropAllCollections

const Measurements = require('../models/measurements')
const Vehicle = require('../models/vehicle')

const measurementsCollection = [
  {
    time: 1511436382000,
    energy: 53.272,
    gps: ['52.08948516845703', '5.10642147064209'],
    odo: 88526.46,
    speed: 7,
    soc: 72.8
  },
  {
    time: 1511436383000,
    energy: 53.272,
    gps: ['52.08948516845703', '5.10642147064209'],
    odo: 88526.461,
    speed: 5,
    soc: 72.8
  },
  {
    time: 1511436384000,
    energy: 53.272,
    gps: ['52.08948516845703', '5.10642147064209'],
    odo: 88526.463,
    speed: 5,
    soc: 72.8
  },
  {
    time: 1511436385000,
    energy: 53.272,
    gps: ['52.08953857421875', '5.1063947677612305'],
    odo: 88526.464,
    speed: 6,
    soc: 72.8
  },
  {
    time: 1511436386000,
    energy: 53.272,
    gps: ['52.08953857421875', '5.1063947677612305'],
    odo: 88526.466,
    speed: 7,
    soc: 72.8
  }
]

beforeEach(() => {
  process.env.ENVIRONMENT = 'testing'
})

beforeEach(async (done) => { // Would prefer to use beforeAll but it sometimes fails
  const url = process.env.MLAB_TESTING_DATABASE_URL
  await mongoose.connect(url, { useNewUrlParser: true })
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

// Drop all collections after tests are done
afterAll(async () => {
  await dropAllCollections(mongoose)
  // Closes the Mongoose connection
  await mongoose.connection.close()
})

describe('Measurements endpoints tests', () => {
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
})
