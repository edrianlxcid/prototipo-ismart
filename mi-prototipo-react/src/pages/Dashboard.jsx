import { API_URL } from '../config/api';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard({ user }) {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        if (!user?.id) {
          console.warn("Usuario sin ID, asumiendo nuevo usuario");
          setDashboardData({ esNuevo: true });
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/api/usuarios/${user.id}/dashboard`);
        if (!response.ok) {
          throw new Error('Error al cargar la información del dashboard');
        }
        
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        console.error(err);
        setError('No pudimos cargar tu información en este momento.');
        setDashboardData({ esNuevo: true });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user]);

  if (loading) {
    return (
      <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2 style={{ color: '#0b2e59' }}>Cargando tu información...</h2>
      </div>
    );
  }

  const isNewUser = dashboardData?.esNuevo;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>¡Bienvenido, {user?.nombres || user?.email?.split('@')[0] || 'Usuario'}!</h1>
        <p>Aquí tienes un resumen de tu actividad en el Centro Terapéutico iSmart.</p>
      </div>

      {isNewUser ? (
        <div className="new-user-welcome" style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '20px', margin: '2rem 0', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👋</div>
          <h2 style={{ color: '#0b2e59', marginBottom: '1rem' }}>¡Qué alegría tenerte con nosotros!</h2>
          <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
            Aún no tienes ningún programa o paquete de terapias activo. Explora nuestros programas especializados y da el primer paso hacia el desarrollo de tu bebé.
          </p>
          <button 
            className="widget-btn" 
            style={{ padding: '15px 30px', fontSize: '1.2rem', backgroundColor: '#e86a33', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(232, 106, 51, 0.4)' }}
            onClick={() => navigate('/programas')}
          >
            Explorar y Adquirir Paquetes
          </button>
        </div>
      ) : (
        <div className="widgets-grid">
          <div className="widget-card appointment-widget">
            <div className="widget-icon">📅</div>
            <div className="widget-content">
              <h3>Próxima Cita</h3>
              {dashboardData?.proximaCita ? (
                <>
                  <p className="highlight-text capitalize">
                    {new Date(dashboardData.proximaCita.fecha_hora_inicio).toLocaleString('es-ES', { weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}
                  </p>
                  <p className="sub-text">Terapia Agendada</p>
                </>
              ) : (
                <>
                  <p className="highlight-text">Sin citas futuras</p>
                  <p className="sub-text">Recuerda agendar tus sesiones</p>
                </>
              )}
            </div>
            {dashboardData?.proximaCita && (
              <button className="widget-btn" onClick={() => setSelectedAppointment(dashboardData.proximaCita)}>Ver Detalles</button>
            )}
          </div>

          <div className="widget-card progress-widget">
            <div className="widget-icon">📈</div>
            <div className="widget-content">
              <h3>Tu Progreso</h3>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${dashboardData?.progreso?.porcentaje || 0}%` }}></div>
              </div>
              <p className="sub-text">Has completado {dashboardData?.progreso?.completadas || 0} de {dashboardData?.progreso?.total || 8} sesiones ({dashboardData?.progreso?.porcentaje || 0}%)</p>
            </div>
          </div>

          <div className="widget-card notice-widget">
            <div className="widget-icon">💡</div>
            <div className="widget-content">
              <h3>Aviso Importante</h3>
              <p className="notice-text">Recuerda traer tu traje de baño, toalla y gorro de piscina para tu próxima sesión.</p>
            </div>
          </div>
        </div>
      )}

      {!isNewUser && (
        <>
          <div className="dashboard-actions-title">
            <h2>Acciones Rápidas</h2>
            <div className="title-divider"></div>
          </div>

          <div className="dashboard-actions">
            <div className="action-card" onClick={() => navigate('/programas')}>
              <div className="action-icon">🛒</div>
              <h2>Adquirir Más Paquetes</h2>
              <p>Explora y compra nuevos programas de terapia adaptados a tus necesidades.</p>
            </div>

            <div className="action-card secondary" onClick={() => navigate('/historial-medico')}>
              <div className="action-icon">📋</div>
              <h2>Historial Médico</h2>
              <p>Revisa tus registros, notas de evolución y planes de tratamiento anteriores.</p>
            </div>
          </div>
        </>
      )}

      {/* MODAL DE DETALLES DE CITA */}
      {selectedAppointment && (
        <div className="modal-overlay" onClick={() => setSelectedAppointment(null)}>
          <div className="modal-content appointment-modal animation-slide-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header-modern">
              <div className="modal-icon-bg">
                <span className="modal-icon-large">🏊‍♂️</span>
              </div>
              <button className="close-modern-btn" onClick={() => setSelectedAppointment(null)}>✕</button>
            </div>
            
            <div className="modal-body-modern">
              <h2 className="modal-title">{selectedAppointment.programa_nombre || 'Terapia Asignada'}</h2>
              <p className="modal-subtitle">Paciente: {selectedAppointment.paciente_nombres} {selectedAppointment.paciente_apellidos}</p>
              
              <div className="info-cards-grid">
                <div className="info-card-modern">
                  <span className="info-icon">🕒</span>
                  <div className="info-text">
                    <h4>Fecha y Hora</h4>
                    <p className="capitalize">{new Date(selectedAppointment.fecha_hora_inicio).toLocaleString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
                    <p className="highlight-time">
                      {new Date(selectedAppointment.fecha_hora_inicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute:'2-digit' })} - 
                      {new Date(selectedAppointment.fecha_hora_fin || new Date(new Date(selectedAppointment.fecha_hora_inicio).getTime() + 60*60*1000)).toLocaleTimeString('es-ES', { hour: '2-digit', minute:'2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="info-card-modern">
                  <span className="info-icon">📍</span>
                  <div className="info-text">
                    <h4>Ubicación</h4>
                    <p>Centro Terapéutico iSmart</p>
                    <p className="sub-location">Piscina Principal</p>
                  </div>
                </div>
              </div>

              <div className="recommendations-box">
                <div className="rec-header">
                  <span className="rec-icon">💡</span>
                  <h4>Recomendaciones</h4>
                </div>
                <ul className="rec-list">
                  <li>Llegar 15 minutos antes para el cambio de ropa.</li>
                  <li>Traer toalla, gorro de piscina y traje de baño.</li>
                  <li>No ingerir alimentos pesados 2 horas antes de la sesión.</li>
                </ul>
              </div>

              <div className="modal-actions-modern">
                <button className="primary-action-btn" onClick={() => alert('¡Se ha descargado el archivo para agregar a tu Calendario!')}>
                  Agregar a mi Calendario
                </button>
                <button className="secondary-action-btn" onClick={() => alert('Abriendo WhatsApp para contactar a Soporte y solicitar reprogramación...')}>
                  Solicitar Reprogramación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
