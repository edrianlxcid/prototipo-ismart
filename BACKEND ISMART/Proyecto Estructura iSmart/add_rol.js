const db = require('./src/config/db');

async function run() {
    try {
        await db.query("ALTER TYPE rol_usuario ADD VALUE 'PACIENTE'");
        console.log("Rol PACIENTE agregado a rol_usuario.");
    } catch (e) {
        console.error(e.message);
    } finally {
        process.exit(0);
    }
}
run();
