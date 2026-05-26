const db = require('../config/db');

// Crear un nuevo departamento (POST)
const crearDepartamento = async (req, res) => {
    try {
        const { nombre, esta_activo = true, fecha_creacion } = req.body;

        // Validación básica
        if (!nombre) {
            return res.status(400).json({ error: 'El nombre del departamento es obligatorio' });
        }

        // Inserción en la base de datos ($1 es para prevenir Inyección SQL)
        const result = await db.query(
            'INSERT INTO departamentos (nombre, esta_activo, fecha_creacion) VALUES ($1, $2, COALESCE($3, NOW())) RETURNING *',
            [nombre, esta_activo, fecha_creacion]
        );

        // Devolvemos el dato insertado (código 201: Created)
        res.status(201).json({
            mensaje: 'Departamento creado exitosamente',
            departamento: result.rows[0]
        });

    } catch (error) {
        // Manejo de errores (ej. si intentan insertar un nombre duplicado)
        console.error('Error al crear departamento:', error);
        if (error.code === '23505') { // Código de error de PostgreSQL para "Unique violation"
            return res.status(400).json({ error: 'Ya existe un departamento con ese nombre' });
        }
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Obtener todos los departamentos activos (GET)
const obtenerDepartamentos = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM departamentos WHERE esta_activo = true ORDER BY nombre ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener departamentos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {
    crearDepartamento,
    obtenerDepartamentos
};