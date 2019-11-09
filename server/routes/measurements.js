const router = require('express').Router()
const measurementsController = require('../controllers/measurements')
const catchErrors = require('../handlers/errorHandlers').catchErrors

router.get('/', catchErrors(measurementsController.allMeasurements))
router.get('/statistics', catchErrors(measurementsController.statistics))

module.exports = router
