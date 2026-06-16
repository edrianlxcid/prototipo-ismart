const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');

// Definir las rutas y conectarlas con sus controladores
router.post('/', usuariosController.crearUsuario);
router.post('/registro', usuariosController.registrarUsuarioYPaciente);
router.post('/login', usuariosController.loginUsuario);
router.get('/', usuariosController.obtenerUsuarios);
router.get('/:id/dashboard', usuariosController.obtenerResumenDashboard);
router.get('/:id/historial-medico', usuariosController.obtenerHistorialMedico);

module.exports = router;