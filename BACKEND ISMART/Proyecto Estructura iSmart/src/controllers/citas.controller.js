const db = require('../config/db');

exports.generarBloque = async (req, res) => {
    let client;
    try {
        client = await db.connect();
        const { id_paquete, usuario, datos_paciente, citas } = req.body;
        
        await client.query('BEGIN');

        if (!usuario || !usuario.id) {
            throw new Error('Usuario no autenticado o sesión inválida');
        }

        // 1. Verificar si ya existe el paciente asociado al tutor
        let id_paciente = null;
        const pacienteExistente = await client.query('SELECT id FROM pacientes WHERE email_tutor = $1 LIMIT 1', [usuario.email]);

        if (pacienteExistente.rows.length > 0) {
            id_paciente = pacienteExistente.rows[0].id;
        } else {
            // 2. Crear nuevo paciente
            const nombreTutor = `${usuario.nombres || ''} ${usuario.apellidos || ''}`.trim() || 'Tutor Generico';
            const nuevoPaciente = await client.query(
                `INSERT INTO pacientes 
                (nombres, apellidos, fecha_nacimiento, email_tutor, nombre_tutor, telefono_tutor, fecha_creacion) 
                VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id`,
                [
                    datos_paciente.nombres, 
                    datos_paciente.apellidos, 
                    datos_paciente.fecha_nacimiento, 
                    usuario.email, 
                    nombreTutor, 
                    datos_paciente.telefono_tutor
                ]
            );
            id_paciente = nuevoPaciente.rows[0].id;
        }

        // 3. Registrar la compra del paquete
        const paqueteResult = await client.query(
            `INSERT INTO paquetes_adquiridos 
            (id_paciente, id_programa, total_sesiones_compradas, fecha_compra) 
            VALUES ($1, $2, $3, NOW()) RETURNING id`,
            [id_paciente, id_paquete, citas.length]
        );
        
        const id_paquete_adquirido = paqueteResult.rows[0].id;

        // 4. Generar el bloque de citas
        const citasAgendadas = [];
        for (const cita of citas) {
            const estado = 'PENDIENTE'; 
            const result = await client.query(
                `INSERT INTO citas 
                (id_paciente, id_paquete, fecha_hora_inicio, fecha_hora_fin, estado, fecha_creacion) 
                VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id, fecha_hora_inicio, fecha_hora_fin`,
                [id_paciente, id_paquete_adquirido, cita.fecha_hora_inicio, cita.fecha_hora_fin, estado]
            );
            citasAgendadas.push(result.rows[0]);
        }
        
        await client.query('COMMIT');
        
        res.status(201).json({ 
            mensaje: 'Citas y paquete generados exitosamente',
            citas: citasAgendadas
        });
    } catch (error) {
        if (client) await client.query('ROLLBACK');
        console.error('Error al generar bloque de compras:', error.message, error.stack);
        res.status(500).json({ error: error.message || 'Error del servidor al registrar compra y citas' });
    } finally {
        if (client) {
            client.release();
        }
    }
};
