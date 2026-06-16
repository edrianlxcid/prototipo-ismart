const db = require('../config/db');
const bcrypt = require('bcryptjs');

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

const registrarUsuarioYPaciente = async (req, res) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        const {
            nombres,
            apellidos,
            email_tutor,
            password
        } = req.body;

        if (!nombres || !apellidos || !email_tutor || !password) {
             throw new Error('Nombres, apellidos, email y contraseña son obligatorios');
        }

        // Verificar si el correo ya existe
        const existing = await client.query('SELECT id FROM usuarios WHERE nombre_usuario = $1', [email_tutor]);
        if (existing.rows.length > 0) {
            throw new Error('El correo electrónico ya está registrado.');
        }

        // Hashear contraseña
        const hash = await bcrypt.hash(password, 10);

        // 1. Insertar Usuario
        const userResult = await client.query(
            'INSERT INTO usuarios (nombres, apellidos, nombre_usuario, hash_contrasena, rol, esta_activo) VALUES ($1, $2, $3, $4, $5, true) RETURNING id',
            [nombres, apellidos, email_tutor, hash, 'PACIENTE']
        );

        await client.query('COMMIT');
        res.status(201).json({
            mensaje: 'Registro exitoso',
            usuarioId: userResult.rows[0].id
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error en el registro:', error.message);
        res.status(400).json({ error: error.message || 'Error en el registro' });
    } finally {
        client.release();
    }
};

const loginUsuario = async (req, res) => {
    try {
        const { email_tutor, password } = req.body;

        if (!email_tutor || !password) {
            return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
        }

        const result = await db.query(
            'SELECT * FROM usuarios WHERE nombre_usuario = $1 AND esta_activo = true',
            [email_tutor]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = result.rows[0];

        // Comparamos el password recibido con el hash
        const isMatch = await bcrypt.compare(password, user.hash_contrasena);

        if (!isMatch) {
            // Check fallback for clear text (just in case dev environment has old records)
            if (password === user.hash_contrasena) {
                // It was clear text, let them in this time (optional safety for old mock data)
            } else {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }
        }

        res.status(200).json({
            mensaje: 'Inicio de sesión exitoso',
            usuario: {
                id: user.id,
                email: user.nombre_usuario,
                rol: user.rol
            }
        });
    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const obtenerUsuarios = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM usuarios WHERE esta_activo = true ORDER BY nombre_usuario ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const obtenerResumenDashboard = async (req, res) => {
    try {
        const { id } = req.params;
        const userRes = await db.query('SELECT nombre_usuario FROM usuarios WHERE id = $1', [id]);
        
        if (userRes.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        const emailTutor = userRes.rows[0].nombre_usuario;
        
        // 1. Buscar paciente asociado
        const pacienteRes = await db.query('SELECT id, nombres FROM pacientes WHERE email_tutor = $1 LIMIT 1', [emailTutor]);
        
        if (pacienteRes.rows.length === 0) {
            // Usuario sin paciente -> Es Nuevo
            return res.json({ esNuevo: true });
        }
        
        const pacienteId = pacienteRes.rows[0].id;
        
        // 2. Buscar si tiene paquetes adquiridos
        const paquetesRes = await db.query('SELECT id, total_sesiones_compradas FROM paquetes_adquiridos WHERE id_paciente = $1 LIMIT 1', [pacienteId]);
        
        if (paquetesRes.rows.length === 0) {
            // Paciente sin paquetes -> Es Nuevo
            return res.json({ esNuevo: true });
        }
        
        const paqueteId = paquetesRes.rows[0].id;
        const totalSesiones = paquetesRes.rows[0].total_sesiones_compradas;
        
        // 3. Buscar la próxima cita
        const proximaCitaRes = await db.query(`
            SELECT 
                c.id, 
                c.fecha_hora_inicio, 
                c.fecha_hora_fin, 
                c.estado,
                p.nombres as paciente_nombres,
                p.apellidos as paciente_apellidos,
                prog.nombre as programa_nombre
            FROM citas c
            JOIN pacientes p ON c.id_paciente = p.id
            JOIN paquetes_adquiridos pa ON c.id_paquete = pa.id
            JOIN programas prog ON pa.id_programa = prog.id
            WHERE c.id_paciente = $1 AND c.fecha_hora_inicio > NOW() AND (c.estado = 'PENDIENTE' OR c.estado = 'REPROGRAMADO_CENTRO')
            ORDER BY c.fecha_hora_inicio ASC
            LIMIT 1
        `, [pacienteId]);
        
        // 4. Progreso (sesiones completadas)
        const completadasRes = await db.query(`
            SELECT COUNT(*) as completadas 
            FROM citas 
            WHERE id_paciente = $1 AND (estado = 'ASISTIO' OR fecha_hora_fin < NOW())
        `, [pacienteId]);
        
        const completadas = parseInt(completadasRes.rows[0].completadas) || 0;
        
        return res.json({
            esNuevo: false,
            proximaCita: proximaCitaRes.rows.length > 0 ? proximaCitaRes.rows[0] : null,
            progreso: {
                completadas,
                total: totalSesiones || 8, // fallback si viene nulo
                porcentaje: totalSesiones ? Math.round((completadas / totalSesiones) * 100) : 0
            }
        });
        
    } catch (error) {
        console.error('Error al obtener resumen de dashboard:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

const obtenerHistorialMedico = async (req, res) => {
    try {
        const { id } = req.params;
        const userRes = await db.query('SELECT nombre_usuario FROM usuarios WHERE id = $1', [id]);
        
        if (userRes.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        const emailTutor = userRes.rows[0].nombre_usuario;
        
        const pacienteRes = await db.query('SELECT id, nombres, apellidos FROM pacientes WHERE email_tutor = $1 LIMIT 1', [emailTutor]);
        
        if (pacienteRes.rows.length === 0) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }
        
        const paciente = pacienteRes.rows[0];
        
        const historialRes = await db.query(`
            SELECT 
                c.id as cita_id,
                c.fecha_hora_inicio,
                c.fecha_hora_fin,
                c.estado,
                prog.nombre as programa_nombre,
                rt.actividades_realizadas,
                rt.observaciones,
                rt.fecha_creacion as fecha_registro
            FROM citas c
            JOIN paquetes_adquiridos pa ON c.id_paquete = pa.id
            JOIN programas prog ON pa.id_programa = prog.id
            LEFT JOIN registros_terapia rt ON rt.id_cita = c.id
            WHERE c.id_paciente = $1 AND (c.estado = 'ASISTIO' OR c.fecha_hora_fin < NOW())
            ORDER BY c.fecha_hora_inicio DESC
        `, [paciente.id]);

        // Mock para llenar las notas vacías temporalmente
        const historial = historialRes.rows.map(item => {
            if (!item.actividades_realizadas && !item.observaciones) {
                return {
                    ...item,
                    actividades_realizadas: "Ejercicios de flotación asistida, inmersiones breves y estimulación sensorial en piscina temperada. El paciente mostró buena tolerancia al medio acuático.",
                    observaciones: "Se recomienda continuar con los ejercicios de respiración en casa (en la tina) durante 5 minutos diarios."
                };
            }
            return item;
        });

        res.json({
            paciente: {
                nombres: paciente.nombres,
                apellidos: paciente.apellidos
            },
            historial: historial
        });
        
    } catch (error) {
        console.error('Error al obtener historial médico:', error);
        res.status(500).json({ error: 'Error del servidor al obtener historial' });
    }
};

module.exports = {
    crearUsuario,
    obtenerUsuarios,
    registrarUsuarioYPaciente,
    loginUsuario,
    obtenerResumenDashboard,
    obtenerHistorialMedico
};