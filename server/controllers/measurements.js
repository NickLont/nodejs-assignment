const mongoose = require('mongoose')

const Measurements = require('../models/measurements')
const Vehicle = require('../models/vehicle')

const helpers = require('../helpers')

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
    if (!helpers.isValidDate(Number(startDate))) return res.status(401).send('Invalid startDate')
    if (!helpers.isValidDate(Number(endDate))) return res.status(401).send('Invalid endDate')
    time = {$gte: Number(startDate), $lt: Number(endDate)}
  }
  if (startDate && !endDate) {   
    if (!helpers.isValidDate(Number(startDate))) return res.status(401).send('Invalid startDate')
    time = {$gte: Number(startDate)}
  }
  if (!startDate && endDate) {   
    if (!helpers.isValidDate(Number(endDate))) return res.status(401).send('Invalid endDate')
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

exports.statistics = async (req, res) => {
  const { vehicleId, vehicleName, startDate, endDate } = req.query
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

  // Conditionally creating [
          // { vehicle: mongoose.Types.ObjectId(String(vehicle._id)) },
          // { time: {$gte: new Date(Number(startDate)), $lt: new Date(Number(endDate))}},
        // ]
  const match = [{ vehicle: mongoose.Types.ObjectId(String(vehicle._id)) }]

  if (startDate && endDate) {   
    if (!helpers.isValidDate(Number(startDate))) return res.status(401).send('Invalid startDate')
    if (!helpers.isValidDate(Number(endDate))) return res.status(401).send('Invalid endDate')
    match.push({ time: {$gte: new Date(Number(startDate)), $lt: new Date(Number(endDate))}})
  }
  if (startDate && !endDate) {   
    if (!helpers.isValidDate(Number(startDate))) return res.status(401).send('Invalid startDate')
    match.push({ time: {$gte: new Date(Number(startDate))}})
  }
  if (!startDate && endDate) {   
    if (!helpers.isValidDate(Number(endDate))) return res.status(401).send('Invalid endDate')
    match.push({ time: {$lt: new Date(Number(endDate))}})
  }
  
  Measurements.aggregate([
    {
      $match: {
        "$and": match
      }
    }, // filter inside Measurements collection
    {
      "$group": { // Groups of aggregations to be shown
          "_id": null,
          "average": { "$avg": "$speed" },
          "minimum": { "$min": "$speed" },
          "maximum": { "$max": "$speed" },
      }
    },
    { 
      $project : { // Choose which fields to show
        _id : 0,
        metric: 'Speed',
        average: 1,
        maximum: 1,
        minimum: 1
      } 
    },
  ], (err, results) => {
    if (err) return res.status(401).send('An error occured')
    if (results) return res.status(200).send(results)
  })
}

