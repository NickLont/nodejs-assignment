const router = require('express').Router()
const vehicleStatsController = require('../controllers/vehicleStats')

router.get('/all', vehicleStatsController.allVehicles)

module.exports = router
