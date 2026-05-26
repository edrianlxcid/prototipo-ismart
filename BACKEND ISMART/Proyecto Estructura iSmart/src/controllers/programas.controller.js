const db = require('../config/db');

exports.getProgramas = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM programas WHERE esta_activo = true');
        // Agregamos la logica de cuantas sesiones tiene basandonos en el nombre temporalmente
        const programas = result.rows.map(p => {
            const match = p.nombre.match(/\d+/);
            const num = match ? parseInt(match[0]) : 0;
            return {
                ...p,
                sesiones: num
            };
        });
        res.json(programas);
    } catch (error) {
        console.error('Error al obtener programas:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};
