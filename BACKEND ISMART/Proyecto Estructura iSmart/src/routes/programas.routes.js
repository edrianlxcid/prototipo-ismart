const express = require('express');
const router = express.Router();
const programasController = require('../controllers/programas.controller');

router.get('/', programasController.getProgramas);

module.exports = router;
