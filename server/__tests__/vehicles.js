const app = require('../app') // Link to your server file
const supertest = require('supertest')
const request = supertest(app)
const mongoose = require('mongoose')
const dropAllCollections = require('../helpers').dropAllCollections
const { MongoMemoryServer } = require('mongodb-memory-server')

const mongod = new MongoMemoryServer()

const Vehicle = require('../models/vehicle')

beforeAll(async () => { // Connecting to the in-memory database
  process.env.ENVIRONMENT = 'testing'
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

// Drop all collections after tests are done
afterAll(async () => {
  await dropAllCollections(mongoose)
  // Closes the Mongoose connection
  await mongoose.connection.close()
})

describe('Vehicles endpoints tests', () => {
  it('Testing to see if server is up', async (done) => {
    const res = await request.get('/')
    expect(res.status).toBe(200)
    expect(res.text).toBe('Hello World')
    done()
  })

  it('/allVehicles endpoint', async (done) => {
    const vehicle = new Vehicle({ name: 'test-bus-1' })
    await vehicle.save()
    const res = await request.get('/vehicles/all')
    const vehicles = await Vehicle.find({}, { name: 1 })
    expect(res.status).toBe(200)
    expect(JSON.stringify(res.body)).toBe(JSON.stringify(vehicles)) // JSON.stringify was used because res.send() automatically casts mongos ._id from hex to string
    done()
  })
})
