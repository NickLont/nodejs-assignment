const router = require('express').Router()
const mongoose = require('mongoose')

const Measurements = require('../models/measurements')
const Vehicle = require('../models/vehicle')

router.get('/statistics', async (req, res) => {
  const { vehicleId, vehicleName } = req.query
  let measurements

  if (!vehicleId && !vehicleName) return res.status(401).send('Please provide a vehicleId or a vehicleName')
  if (vehicleId && vehicleName) return res.status(401).send('Please provide one of vehicleId or vehicleName')

  if (vehicleId) {
    if (!mongoose.Types.ObjectId.isValid(vehicleId)) return res.status(401).send('Invalid ID')

    const vehicle = await Vehicle.findById(vehicleId)
    if (!vehicle) return res.status(401).send('No such vehicle ID found')

    measurements = await Measurements.find({ vehicle: vehicle }, { _id: 0 }).populate('vehicle')
  }
  if (vehicleName) {
    const vehicle = await Vehicle.findOne({name: vehicleName})
    console.log('vehicle: ', vehicle)
    if (!vehicle) return res.status(401).send('No such vehicle name found')
    measurements = await Measurements.find({ vehicle: vehicle }, { _id: 0 }).populate('vehicle')
  }
  // console.log('queries: ', req.query)
  // console.log('vehicleId: ', vehicleId)
  // console.log('vehicleName: ', vehicleName)
  res.status(200).send(measurements)
})

module.exports = router
