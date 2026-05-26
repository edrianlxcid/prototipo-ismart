const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Log de peticiones para saber qué está llegando
app.use((req, res, next) => {
    console.log(`📡 Solicitud recibida: ${req.method} ${req.url}`);
    next();
});

// --- IMPORTACIÓN DE RUTAS ---
const departamentosRoutes = require('./routes/departamentos.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const programasRoutes = require('./routes/programas.routes');
const paquetesRoutes = require('./routes/paquetes.routes');
const citasRoutes = require('./routes/citas.routes');

// --- USO DE RUTAS ---
app.use('/api/departamentos', departamentosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/programas', programasRoutes);
app.use('/api/paquetes', paquetesRoutes);
app.use('/api/citas', citasRoutes);

// Ruta de prueba
app.get('/api/test-db', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.json({ mensaje: 'DB Conectada', hora: result.rows[0].now });
    } catch (error) {
        console.error('❌ Error en test-db:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor listo en http://localhost:${PORT}`);
});