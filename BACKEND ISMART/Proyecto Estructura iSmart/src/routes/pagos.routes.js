const express = require('express');
const router = express.Router();
const pagosController = require('../controllers/pagos.controller');

// Ruta para simular el pago
router.post('/simular', pagosController.simularPago);

module.exports = router;
