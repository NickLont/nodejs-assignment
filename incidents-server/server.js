const app = require('./app')

app.get('/', (req, res) => {
  res.send('Incidents server working')
})
