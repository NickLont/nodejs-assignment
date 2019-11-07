const Vehicle = require('../models/vehicle')

// return all vehicles
exports.allVehicles = async (req, res) => {
  const vehicles = await Vehicle.find({}, { name: 1 }) // parameters: query & projection, 2nd param tells to return only name field (+id that is standard)
  res.status(200).json(vehicles)
}
