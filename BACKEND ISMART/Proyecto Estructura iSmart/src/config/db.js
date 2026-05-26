const { Pool } = require('pg');
require('dotenv').config(); // Carga las variables del archivo .env

// Creamos la instancia de conexión usando las variables de entorno
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

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