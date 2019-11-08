const router = require('express').Router()
const measurementsController = require('../controllers/measurementsStats')

router.get('/', measurementsController.allMeasurements)

module.exports = router
