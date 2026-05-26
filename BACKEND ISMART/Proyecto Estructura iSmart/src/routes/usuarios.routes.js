const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');

// Definir las rutas y conectarlas con sus controladores
router.post('/', usuariosController.crearUsuario);
router.get('/', usuariosController.obtenerUsuarios);

module.exports = router;