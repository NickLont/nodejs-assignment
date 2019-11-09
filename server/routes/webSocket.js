const router = require('express').Router()
const webSocketController = require('../controllers/webSocket')

router.get('/', webSocketController.webSocket)

module.exports = router