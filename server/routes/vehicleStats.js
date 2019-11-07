const router = require('express').Router()
const vehicleStatsController = require('../controllers/vehicleStats')

router.get('/allVehicles', vehicleStatsController.allVehicles)

module.exports = router
