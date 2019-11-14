/*
  Catch Errors Handler
  With async/await, you need some way to catch errors
  Instead of using try{} catch(e) {} in each controller, we wrap the function in
  catchErrors(), catch any errors they throw, and pass it along to our express middleware with next()
*/

exports.catchErrors = (fn) => {
  return function (req, res, next) {
    return fn(req, res, next).catch(next)
  }
}

exports.validateVehicle = async (req, res, vehicleModel, isValidId) => {
  const { vehicleId, vehicleName } = req.query
  let vehicle

  if (!vehicleId && !vehicleName) return res.status(401).send('Please provide a vehicleId or a vehicleName')
  if (vehicleId && vehicleName) return res.status(401).send('Please provide one of vehicleId or vehicleName')

  if (vehicleId) {
    if (!isValidId(vehicleId)) return res.status(401).send('Invalid ID')

    vehicle = await vehicleModel.findById(vehicleId)
    if (!vehicle) return res.status(401).send('No such vehicle ID found')
  }
  if (vehicleName) {
    vehicle = await vehicleModel.findOne({ name: vehicleName })
    if (!vehicle) return res.status(401).send('No such vehicle name found')
  }
  if (vehicleName || vehicleId) return vehicle
}
