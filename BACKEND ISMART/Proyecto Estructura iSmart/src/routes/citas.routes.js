const express = require('express');
const router = express.Router();
const citasController = require('../controllers/citas.controller');

router.post('/generar-bloque', citasController.generarBloque);

module.exports = router;
