const app = require('./app')
const vehiclesRoutes = require('./routes/vehicles')
const measurementsRoutes = require('./routes/measurements')

app.get('/', (req, res) => {
  res.send('Hello World')
})

// add different routes
app.use('/vehicles', vehiclesRoutes)
app.use('/measurements', measurementsRoutes)
