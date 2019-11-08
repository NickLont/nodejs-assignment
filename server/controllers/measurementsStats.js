const mongoose = require('mongoose')

const Measurements = require('../models/measurements')
const Vehicle = require('../models/vehicle')

exports.allMeasurements = async (req, res) => {
  const { vehicleId, vehicleName, startDate, endDate } = req.query
  let measurements
  let vehicle

  if (!vehicleId && !vehicleName) return res.status(401).send('Please provide a vehicleId or a vehicleName')
  if (vehicleId && vehicleName) return res.status(401).send('Please provide one of vehicleId or vehicleName')

  if (vehicleId) {
    if (!mongoose.Types.ObjectId.isValid(vehicleId)) return res.status(401).send('Invalid ID')

    vehicle = await Vehicle.findById(vehicleId)
    if (!vehicle) return res.status(401).send('No such vehicle ID found')
  }
  if (vehicleName) {
    vehicle = await Vehicle.findOne({ name: vehicleName })
    if (!vehicle) return res.status(401).send('No such vehicle name found')
  }

  let options = {
    vehicle: vehicle
  }
  // Conditionally creating { vehicle: vehicle, time: { $gte: new Date(1511437632000), $lt: new Date(1511437633000) }
  let time = {}
  if (startDate && endDate) {   
    time = {$gte: Number(startDate), $lt: Number(endDate)}
  }
  if (startDate && !endDate) {   
    time = {$gte: Number(startDate)}
  }
  if (!startDate && endDate) {   
    time = {$lt: Number(endDate)}
  }
  if (startDate || endDate) {
    options = {
      ...options,
      time
    }
  }

  measurements = await Measurements.find(options, { _id: 0 }).populate('vehicle')
  return res.status(200).send(measurements)
}
