import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProgramSelection.css';

function ProgramSelection() {
  const [programas, setProgramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch programs from backend
    axios.get('http://localhost:3000/api/programas')
      .then(res => {
        setProgramas(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching programas', err);
        setLoading(false);
      });
  }, []);

  const handleComprar = async (programa) => {
    try {
      // Usar un paciente mockeado por defecto.
      // En un entorno real se tomaría del contexto del usuario.
      // Aquí hardcodeamos un id o pedimos al backend que use uno de prueba.
      // Para prototipo, mandamos un id genérico o null si el backend lo gestiona (usaremos el mock id del backend si es posible, o le hacemos select primero).
      // Mejor: el backend asume un paciente si mandamos id_paciente fijo, o le enviamos un correo.
      // Enviemos null y ajustemos el backend si falla, o mandemos un req a un nuevo endpoint.
      // Espera, el seed insertó un paciente, obtengamos todos los pacientes o modifiquemos el backend para auto-asignar.
      // Vamos a enviar un POST normal y el backend (modificado) tomará el primer paciente de la DB para este prototipo.

      const res = await axios.post('http://localhost:3000/api/paquetes/comprar', {
        id_programa: programa.id,
        id_paciente: null, // El backend lo rellenará con el de prueba
        total_sesiones_compradas: programa.sesiones
      });

      const paqueteAdquirido = res.data.paquete;
      
      // Ir a agendar citas pasando la cantidad de sesiones en el estado
      navigate(`/agendar/${paqueteAdquirido.id}`, { state: { sesiones: programa.sesiones } });

    } catch (error) {
      console.error('Error al comprar paquete:', error);
      alert('Hubo un error al procesar tu compra.');
    }
  };

  return (
    <div className="programs-container">
      <h1>Selecciona un Programa de Terapia Acuática</h1>
      <p className="subtitle">Elige el paquete que mejor se adapte a tus necesidades. Podrás agendar tus horarios en el siguiente paso.</p>
      
      {loading ? (
        <p>Cargando programas...</p>
      ) : (
        <div className="programs-grid">
          {programas.map((prog) => (
            <div key={prog.id} className="program-card">
              <div className="program-header">
                <h2>{prog.sesiones}</h2>
                <span>Sesiones</span>
              </div>
              <div className="program-body">
                <h3>{prog.nombre}</h3>
                <ul className="program-features">
                  <li>Terapia personalizada</li>
                  <li>Asignación de horarios flexible</li>
                  <li>Máximo 2 sesiones por semana</li>
                  <li>Duración de 45 mins por sesión</li>
                </ul>
                <button className="buy-btn" onClick={() => handleComprar(prog)}>
                  Adquirir e Iniciar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProgramSelection;
