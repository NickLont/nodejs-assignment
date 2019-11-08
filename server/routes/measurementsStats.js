const router = require('express').Router()
const measurementsController = require('../controllers/measurementsStats')

router.get('/all', measurementsController.allMeasurements)

module.exports = router
