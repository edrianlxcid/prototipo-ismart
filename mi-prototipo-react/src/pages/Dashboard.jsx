import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard({ user }) {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Bienvenido al Portal, {user}</h1>
        <p>Selecciona una opción para continuar</p>
      </header>
      <div className="dashboard-actions">
        <button className="action-card" onClick={() => navigate('/programas')}>
          <h2>Comprar Programa</h2>
          <p>Adquiere paquetes de terapia acuática para asignar tus citas.</p>
        </button>
        <button className="action-card secondary">
          <h2>Mis Citas</h2>
          <p>Revisa tu historial y citas programadas.</p>
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
