const router = require('express').Router()
const vehiclesController = require('../controllers/vehicles')
const catchErrors = require('../handlers/errorHandlers').catchErrors

router.get('/all', catchErrors(vehiclesController.allVehicles))

module.exports = router
