import { API_URL } from '../config/api';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MedicalHistory.css';

function MedicalHistory({ user }) {
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        if (!user?.id) {
          setError('Usuario no identificado');
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/api/usuarios/${user.id}/historial-medico`);
        if (!response.ok) {
          throw new Error('Error al cargar el historial médico');
        }
        
        const data = await response.json();
        setHistoryData(data);
      } catch (err) {
        console.error(err);
        setError('No pudimos cargar tu historial médico en este momento.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  if (loading) {
    return (
      <div className="history-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2 style={{ color: '#0b2e59' }}>Cargando notas de evolución...</h2>
      </div>
    );
  }

  if (error || !historyData) {
    return (
      <div className="history-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2 style={{ color: '#ea7818', marginBottom: '20px' }}>Oops...</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>{error || 'No se encontró el paciente'}</p>
        <button className="primary-action-btn" onClick={() => navigate('/dashboard')}>Volver al Dashboard</button>
      </div>
    );
  }

  const { paciente, historial } = historyData;

  return (
    <div className="history-container">
      <div className="history-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Volver
        </button>
        <div className="header-titles">
          <h1>Historial Clínico y Evolución</h1>
          <p>Paciente: <span className="highlight-patient">{paciente.nombres} {paciente.apellidos}</span></p>
        </div>
      </div>

      {historial.length === 0 ? (
        <div className="empty-history">
          <div className="empty-icon">📝</div>
          <h2>Aún no hay registros de evolución</h2>
          <p>Los terapeutas añadirán sus notas y observaciones aquí una vez que tu bebé asista a sus primeras sesiones. ¡Nos vemos pronto en la piscina!</p>
        </div>
      ) : (
        <div className="timeline-wrapper">
          <div className="timeline-line"></div>
          
          {historial.map((sesion, index) => (
            <div className="timeline-node animation-fade-in" style={{ animationDelay: `${index * 0.1}s` }} key={sesion.cita_id || index}>
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <div className="timeline-date-box">
                  <span className="date-day">{new Date(sesion.fecha_hora_inicio).getDate()}</span>
                  <span className="date-month">{new Date(sesion.fecha_hora_inicio).toLocaleString('es-ES', { month: 'short' })}</span>
                  <span className="date-year">{new Date(sesion.fecha_hora_inicio).getFullYear()}</span>
                </div>
                
                <div className="timeline-card">
                  <div className="card-header">
                    <h3>{sesion.programa_nombre || 'Terapia iSmart'}</h3>
                    <span className="status-badge status-completed">
                      {sesion.estado === 'ASISTIO' ? 'Completada' : 'Finalizada'}
                    </span>
                  </div>
                  
                  <div className="card-body">
                    <div className="notes-section">
                      <h4 className="section-title"><span className="icon">📋</span> Actividades Realizadas</h4>
                      <p className="notes-text">{sesion.actividades_realizadas || 'El paciente completó la sesión satisfactoriamente según el plan establecido.'}</p>
                    </div>

                    <div className="notes-section">
                      <h4 className="section-title"><span className="icon">💡</span> Observaciones del Terapeuta</h4>
                      <div className="observation-box">
                        <p>{sesion.observaciones || 'No hay observaciones adicionales para esta sesión.'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MedicalHistory;
