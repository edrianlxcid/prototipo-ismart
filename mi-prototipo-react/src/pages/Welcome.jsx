import { useNavigate } from 'react-router-dom';
import chikyHappy from '../assets/CHIKY-HAPPY.png';
import './Welcome.css';

function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="welcome-page-container">
      <div className="welcome-content">
        <img src={chikyHappy} alt="Chiky Feliz" className="chiky-bounce" />
        <h1>¡Bienvenido a nuestro Centro iSMART!</h1>
        <p>Tu cronograma de citas ha sido asignado y guardado correctamente. ¡Estamos listos para verte triunfar!</p>
        
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          Volver al Portal
        </button>
      </div>
    </div>
  );
}

export default Welcome;
