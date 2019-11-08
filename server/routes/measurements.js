const router = require('express').Router()
const measurementsController = require('../controllers/measurements')

router.get('/', measurementsController.allMeasurements)
router.get('/statistics', measurementsController.statistics)

module.exports = router
