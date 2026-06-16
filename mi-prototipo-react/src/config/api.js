// Archivo central para configurar la URL del backend
// VITE_API_URL es inyectada automáticamente por Vercel durante el despliegue
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
