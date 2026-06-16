const { Pool } = require('pg');
require('dotenv').config(); // Carga las variables del archivo .env

// Creamos la instancia de conexión usando las variables de entorno
// Si existe DATABASE_URL, usamos esa (para producción/Neon), de lo contrario usamos las variables locales
const poolConfig = process.env.DATABASE_URL 
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false } // Requerido por servicios Cloud como Neon/Supabase
      }
    : {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
      };

const pool = new Pool(poolConfig);

// Función para probar la conexión al iniciar el servidor
const testConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('✅ Conexión exitosa a la base de datos:', process.env.DB_NAME);
        client.release(); // Liberamos la conexión de vuelta al pool
    } catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error.message);
    }
};

testConnection();

module.exports = pool;