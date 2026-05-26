const express = require('express');
const router = express.Router();
const paquetesController = require('../controllers/paquetes.controller');

router.post('/comprar', paquetesController.comprarPaquete);

module.exports = router;
