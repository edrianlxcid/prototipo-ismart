const db = require('./src/config/db');

async function run() {
    try {
        console.log("Ejecutando ALTER TABLE en usuarios...");
        // Usamos IF NOT EXISTS para evitar errores si ya se corrió
        await db.query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS nombres VARCHAR(255), ADD COLUMN IF NOT EXISTS apellidos VARCHAR(255);`);
        console.log("Columnas agregadas exitosamente.");
    } catch (e) {
        console.error("Error al alterar la tabla:", e.message);
    } finally {
        process.exit(0);
    }
}
run();
