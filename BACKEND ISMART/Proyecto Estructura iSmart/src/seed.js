const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'db_centro',
  password: process.env.DB_PASSWORD || '1752467272',
  port: process.env.DB_PORT || 5432,
});

async function seed() {
  try {
    // 1. Create a mock departamento if none exists
    let res = await pool.query('SELECT id FROM departamentos LIMIT 1');
    let deptoId;
    if (res.rows.length === 0) {
      const insertDepto = await pool.query(`INSERT INTO departamentos (nombre, descripcion) VALUES ('Terapia Acuática', 'Departamento de terapia acuática') RETURNING id`);
      deptoId = insertDepto.rows[0].id;
    } else {
      deptoId = res.rows[0].id;
    }

    // 2. Insert mock programas
    const programas = [
      { nombre: 'Terapia Acuática - 8 Sesiones', sesiones: 8 },
      { nombre: 'Terapia Acuática - 10 Sesiones', sesiones: 10 },
      { nombre: 'Terapia Acuática - 15 Sesiones', sesiones: 15 },
      { nombre: 'Terapia Acuática - 20 Sesiones', sesiones: 20 },
    ];

    for (const prog of programas) {
      const exists = await pool.query('SELECT id FROM programas WHERE nombre = $1', [prog.nombre]);
      if (exists.rows.length === 0) {
        await pool.query(
          `INSERT INTO programas (id_departamento, nombre, esta_activo) VALUES ($1, $2, true)`,
          [deptoId, prog.nombre]
        );
      }
    }
    console.log('✅ Programas mockeados correctamente.');

    // 3. Create a mock paciente
    res = await pool.query('SELECT id FROM pacientes LIMIT 1');
    if (res.rows.length === 0) {
      await pool.query(`
        INSERT INTO pacientes (nombres, apellidos, email_tutor, nombre_tutor, telefono_tutor, fecha_nacimiento) 
        VALUES ('Juanito', 'Pérez', 'tutor@test.com', 'Pedro Pérez', '0999999999', '2015-01-01')
      `);
      console.log('✅ Paciente mockeado correctamente.');
    } else {
      console.log('✅ Paciente ya existe.');
    }

  } catch (error) {
    console.error('❌ Error en el seed:', error);
  } finally {
    await pool.end();
  }
}

seed();
