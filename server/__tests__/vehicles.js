const app = require('../app') // Link to your server file
const supertest = require('supertest')
const request = supertest(app)
const mongoose = require('mongoose')

const Vehicle = require('../models/vehicle')


beforeAll(async () => {
  const url = 'mongodb://nick:nick1234@ds245018.mlab.com:45018/vehicle-test'
  await mongoose.connect(url, { useNewUrlParser: true })
})

it('Testing to see if server is up', async (done) => {
    const res = await request.get('/')
    expect(res.status).toBe(200)
    expect(res.text).toBe('Hello World')
    done()
})

it('/allVehicles endpoint', async (done) => {
    const vehicle = new Vehicle({name: 'test-bus-1'})
    await vehicle.save()
    const res = await request.get('/vehicles/all')
    const vehicles = await Vehicle.find({}, { name: 1 })
    expect(res.status).toBe(200)
    expect(JSON.stringify(res.body)).toBe(JSON.stringify(vehicles)) // JSON.stringify was used because res.send() automatically casts mongos ._id from hex to string
    done()
})

async function dropAllCollections () {
    const collections = Object.keys(mongoose.connection.collections)
    for (const collectionName of collections) {
      const collection = mongoose.connection.collections[collectionName]
      try {
        await collection.drop()
      } catch (error) {
        // This error happens when you try to drop a collection that's already dropped. Happens infrequently. 
        // Safe to ignore. 
        if (error.message === 'ns not found') return
  
        // This error happens when you use it.todo.
        // Safe to ignore. 
        if (error.message.includes('a background operation is currently running')) return
  
        console.log(error.message)
      }
    }
}

// Drop all collections after tests are done
afterAll(async () => {
    await dropAllCollections()
    // Closes the Mongoose connection
    await mongoose.connection.close()
})
