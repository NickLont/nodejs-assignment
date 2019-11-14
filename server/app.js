const express = require('express')
const app = express()
const mongoose = require('mongoose')
require('dotenv').config({ path: '../.env' })
const vehiclesRoutes = require('./routes/vehicles')
const measurementsRoutes = require('./routes/measurements')

// Connecting to the MongoDB database service with retry in case of first connection failure
const connectWithRetry = () => (
  mongoose.connect(process.env.MONGO_DATABASE_URL, { useNewUrlParser: true }, (err) => {
    if (err) {
      console.error('Failed to connect to mongo on startup - retrying in 1 sec', err)
      setTimeout(connectWithRetry, 1000)
    }
  })
)
connectWithRetry()
mongoose.Promise = global.Promise // Tell Mongoose to use ES6 promises
mongoose.connection.on('connected', () => {
  if (process.env.ENVIRONMENT !== 'testing') console.log('Connected to database')
})

// add headers to responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3010')
  res.header('Access-Control-Allow-Headers', 'Authorization, Origin, X-Requested-With, Content-Type, Accept')
  res.header('Access-Control-Allow-Credentials', true)
  next()
})

// add different routes
app.use('/vehicles', vehiclesRoutes)
app.use('/measurements', measurementsRoutes)

app.get('/', (req, res) => {
  res.send('Hello World')
})

module.exports = app
