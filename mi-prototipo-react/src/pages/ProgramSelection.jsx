import { API_URL } from '../config/api';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProgramSelection.css';

function ProgramSelection({ user }) {
  const [programas, setProgramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch programs from backend
    axios.get(`${API_URL}/api/programas`)
      .then(res => {
        setProgramas(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching programas', err);
        setLoading(false);
      });
  }, []);

  const handleSelectProgram = (prog) => {
    navigate(`/agendar/${prog.id}`, { 
      state: { 
        sesiones: prog.sesiones
      } 
    });
  };

  return (
    <div className="programs-container">
      <h1>Selecciona un Programa de Terapia</h1>
      <p className="subtitle">Elige el paquete que mejor se adapte a tus necesidades. Registrarás los datos del paciente y el horario en el siguiente paso.</p>
      
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
                <button className="buy-btn" onClick={() => handleSelectProgram(prog)}>
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
