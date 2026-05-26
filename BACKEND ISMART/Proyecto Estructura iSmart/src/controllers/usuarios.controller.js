const db = require('../config/db');

const crearUsuario = async (req, res) => {
    try {
        const { email, departamento_id, esta_activo = true, fecha_creacion } = req.body;

        if (!email || !departamento_id) {
            return res.status(400).json({ error: 'Email y departamento_id son obligatorios' });
        }

        const result = await db.query(
            'INSERT INTO usuarios (email, departamento_id, esta_activo, fecha_creacion) VALUES ($1, $2, $3, COALESCE($4, NOW())) RETURNING *',
            [email, departamento_id, esta_activo, fecha_creacion]
        );

        res.status(201).json({
            mensaje: 'Usuario creado exitosamente',
            usuario: result.rows[0]
        });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const obtenerUsuarios = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM usuarios WHERE esta_activo = true ORDER BY email ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {
    crearUsuario,
    obtenerUsuarios
};