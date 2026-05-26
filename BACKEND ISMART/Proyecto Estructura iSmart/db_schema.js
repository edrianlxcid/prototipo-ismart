const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'db_centro',
  password: '1752467272',
  port: 5432,
});

async function querySchema() {
  const tables = ['programas', 'paquetes_adquiridos', 'citas', 'pacientes', 'usuarios'];
  for (const table of tables) {
    try {
      const res = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1
      `, [table]);
      console.log(`\nTable: ${table}`);
      console.table(res.rows);
    } catch (err) {
      console.error(`Error querying ${table}:`, err.message);
    }
  }
  await pool.end();
}

querySchema();
