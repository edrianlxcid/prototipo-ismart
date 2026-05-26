const express = require('express');
const router = express.Router();
const departamentosController = require('../controllers/departamentos.controller');

// Definir las rutas y conectarlas con sus controladores
router.post('/', departamentosController.crearDepartamento);
router.get('/', departamentosController.obtenerDepartamentos);

module.exports = router;