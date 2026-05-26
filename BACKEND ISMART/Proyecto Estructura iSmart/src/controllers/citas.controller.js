const db = require('../config/db');

exports.generarBloque = async (req, res) => {
    let client;
    try {
        client = await db.connect();
        let { id_paquete, id_paciente, citas } = req.body;
        
        await client.query('BEGIN');

        // Si id_paciente es nulo (prototipo), buscar el primer paciente de la DB
        if (!id_paciente) {
            const pacienteResult = await client.query('SELECT id FROM pacientes LIMIT 1');
            if (pacienteResult.rows.length > 0) {
                id_paciente = pacienteResult.rows[0].id;
            } else {
                throw new Error('No hay pacientes de prueba');
            }
        }
        
        const citasAgendadas = [];
        
        for (const cita of citas) {
            // "Confirmada" is standard for purchased packages
            const estado = 'Confirmada'; 
            
            const result = await client.query(
                `INSERT INTO citas 
                (id_paciente, id_paquete, fecha_hora_inicio, fecha_hora_fin, estado, fecha_creacion) 
                VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id, fecha_hora_inicio, fecha_hora_fin`,
                [id_paciente, id_paquete, cita.fecha_hora_inicio, cita.fecha_hora_fin, estado]
            );
            citasAgendadas.push(result.rows[0]);
        }
        
        await client.query('COMMIT');
        
        res.status(201).json({ 
            mensaje: 'Citas generadas exitosamente',
            citas: citasAgendadas
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al generar bloque de citas:', error);
        res.status(500).json({ error: 'Error del servidor al agendar citas' });
    } finally {
        if (client) {
            client.release();
        }
    }
};
