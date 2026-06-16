const db = require('../config/db');

exports.comprarPaquete = async (req, res) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        
        const { 
            id_programa, 
            total_sesiones_compradas,
            email_tutor, // From user context
            nombre_tutor,
            telefono_tutor,
            nombres_nino,
            apellidos_nino,
            fecha_nacimiento
        } = req.body;
        
        
        const origen = 'ECOMMERCE'; 

        // 1. Crear el paciente
        const pacienteResult = await client.query(
            `INSERT INTO pacientes (email_tutor, nombre_tutor, telefono_tutor, nombres, apellidos, fecha_nacimiento, fecha_creacion) 
             VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id`,
            [email_tutor, nombre_tutor, telefono_tutor, nombres_nino, apellidos_nino, fecha_nacimiento]
        );
        
        const id_paciente = pacienteResult.rows[0].id;

        // 2. Comprar el paquete
        const result = await client.query(
            `INSERT INTO paquetes_adquiridos 
            (id_paciente, id_programa, total_sesiones_compradas, origen, fecha_compra) 
            VALUES ($1, $2, $3, $4, NOW()) RETURNING id, total_sesiones_compradas`,
            [id_paciente, id_programa, total_sesiones_compradas, origen]
        );

        await client.query('COMMIT');

        res.status(201).json({ 
            mensaje: 'Paquete adquirido exitosamente',
            paquete: result.rows[0],
            paciente: { nombres: nombres_nino, apellidos: apellidos_nino }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al comprar paquete:', error);
        res.status(500).json({ error: 'Error del servidor' });
    } finally {
        client.release();
    }
};
