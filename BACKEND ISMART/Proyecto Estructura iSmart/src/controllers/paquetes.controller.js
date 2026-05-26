const db = require('../config/db');

exports.comprarPaquete = async (req, res) => {
    try {
        let { id_programa, id_paciente, total_sesiones_compradas } = req.body;
        
        // Mock origen for the prototype
        const origen = 'Centro'; 

        // Si id_paciente es nulo (prototipo), buscar el primer paciente de la DB
        if (!id_paciente) {
            const pacienteResult = await db.query('SELECT id FROM pacientes LIMIT 1');
            if (pacienteResult.rows.length > 0) {
                id_paciente = pacienteResult.rows[0].id;
            } else {
                return res.status(400).json({ error: 'No hay pacientes de prueba en la base de datos' });
            }
        }

        const result = await db.query(
            `INSERT INTO paquetes_adquiridos 
            (id_paciente, id_programa, total_sesiones_compradas, origen, fecha_compra) 
            VALUES ($1, $2, $3, $4, NOW()) RETURNING id, total_sesiones_compradas`,
            [id_paciente, id_programa, total_sesiones_compradas, origen]
        );

        res.status(201).json({ 
            mensaje: 'Paquete adquirido exitosamente',
            paquete: result.rows[0]
        });
    } catch (error) {
        console.error('Error al comprar paquete:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};
