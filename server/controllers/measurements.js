const mongoose = require('mongoose')
const isValidId = mongoose.Types.ObjectId.isValid

const Measurements = require('../models/measurements')
const Vehicle = require('../models/vehicle')

const isValidDate = require('../helpers').isValidDate
const validateVehicle = require('../handlers/errorHandlers').validateVehicle

exports.allMeasurements = async (req, res) => {
  const { startDate, endDate, pageNo, size } = req.query
  let measurements
  let vehicle

  vehicle = await validateVehicle(req, res, Vehicle, isValidId)

  let options = {
    vehicle: vehicle
  }

  // Conditionally creating { vehicle: vehicle, time: { $gte: new Date(1511437632000), $lt: new Date(1511437633000) }
  let time = {}
  if (startDate && endDate) {
    if (!isValidDate(Number(startDate))) return res.status(401).send('Invalid startDate')
    if (!isValidDate(Number(endDate))) return res.status(401).send('Invalid endDate')
    time = { $gte: Number(startDate), $lt: Number(endDate) }
  }
  if (startDate && !endDate) {
    if (!isValidDate(Number(startDate))) return res.status(401).send('Invalid startDate')
    time = { $gte: Number(startDate) }
  }
  if (!startDate && endDate) {
    if (!isValidDate(Number(endDate))) return res.status(401).send('Invalid endDate')
    time = { $lt: Number(endDate) }
  }
  if (startDate || endDate) {
    options = {
      ...options,
      time
    }
  }

  let totalCount
  // Pagination
  if (size && pageNo && ('name' in vehicle)) {
    totalCount = await Measurements.count(options)
    measurements = await Measurements.find(options, { _id: 0 })
      .skip(parseInt(size) * (parseInt(pageNo) - 1))
      .limit(parseInt(size))
      .populate('vehicle')
      .catch((e) => console.log('error', e))
    const response = {
      data: measurements,
      pages: Math.ceil(totalCount / size),
      current: Number(pageNo)
    }
    return res.status(200).send(response)
  } else {
    if ('name' in vehicle) {
      measurements = await Measurements
        .find(options, { _id: 0 })
        .populate('vehicle')
        .catch((e) => console.log('error:', e))
      const response = {
        data: measurements
      }
      return res.status(200).send(response)
    }
  }
}

exports.statistics = async (req, res) => {
  const { startDate, endDate } = req.query
  let vehicle = await validateVehicle(req, res, Vehicle, isValidId)

  // Conditionally creating [
  // { vehicle: mongoose.Types.ObjectId(String(vehicle._id)) },
  // { time: {$gte: new Date(Number(startDate)), $lt: new Date(Number(endDate))}},
  // ]
  const match = [{ vehicle: mongoose.Types.ObjectId(String(vehicle._id)) }]

  if (startDate && endDate) {
    if (!isValidDate(Number(startDate))) return res.status(401).send('Invalid startDate')
    if (!isValidDate(Number(endDate))) return res.status(401).send('Invalid endDate')
    match.push({ time: { $gte: new Date(Number(startDate)), $lt: new Date(Number(endDate)) } })
  }
  if (startDate && !endDate) {
    if (!isValidDate(Number(startDate))) return res.status(401).send('Invalid startDate')
    match.push({ time: { $gte: new Date(Number(startDate)) } })
  }
  if (!startDate && endDate) {
    if (!isValidDate(Number(endDate))) return res.status(401).send('Invalid endDate')
    match.push({ time: { $lt: new Date(Number(endDate)) } })
  }

  Measurements.aggregate([
    {
      $match: {
        $and: match
      }
    }, // filter inside Measurements collection
    {
      $group: { // Groups of aggregations to be shown
        _id: null,
        average: { $avg: '$speed' },
        minimum: { $min: '$speed' },
        maximum: { $max: '$speed' }
      }
    },
    {
      $project: { // Choose which fields to show
        _id: 0,
        metric: 'Speed',
        average: 1,
        maximum: 1,
        minimum: 1
      }
    }
  ], (err, results) => {
    if (err) return res.status(401).send('An error occured')
    if (results) return res.status(200).send(results)
  })
}
