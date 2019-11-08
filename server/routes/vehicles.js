const router = require('express').Router()
const vehiclesController = require('../controllers/vehicles')

router.get('/all', vehiclesController.allVehicles)

module.exports = router
