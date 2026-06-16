import { API_URL } from '../config/api';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';
import chikyHappy from '../assets/CHIKY-HAPPY.png';
import chikyAgua from '../assets/CHIKY-AGUA.png';
import logoImage from '../assets/Ismart full color.png';

function Register({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    email_tutor: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombres || !formData.apellidos || !formData.email_tutor || !formData.password || !formData.confirmPassword) {
      setError('Completa todos los campos.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/usuarios/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar usuario');
      }

      onLogin({
        id: data.usuarioId,
        email: formData.email_tutor,
        nombres: formData.nombres,
        apellidos: formData.apellidos
      });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <div className="login-left-content">
          <h1 className="welcome-title">ÚNETE A<br />iSMART</h1>
          <p className="welcome-subtitle">EMPIEZA EL DESARROLLO<br />DE TU BEBÉ HOY MISMO.</p>
          <div className="chiky-img-container">
            <img src={chikyHappy} alt="Mascota iSmart" className="chiky-img chiky-fade" />
          </div>
          <p className="welcome-footer">Terapia Acuática<br />Especializada</p>
        </div>
      </div>

      <div className="login-right register-right">
        <div className="login-form-container register-form-container">
          <div className="ribbon-container">
            <img src={logoImage} alt="iSMART Logo" className="ribbon-logo" />
          </div>

          <div className="register-header">
            <h2>Crear Cuenta de Representante</h2>
            <p style={{color: '#666', marginTop: '-10px', fontSize: '0.9rem'}}>Registra tu usuario. Podrás agregar a tu niño al adquirir un paquete.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            
            <div className="form-step">
              <div className="form-row">
                <div className="form-group">
                  <label>NOMBRES</label>
                  <input type="text" name="nombres" placeholder="Juan Carlos" value={formData.nombres} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>APELLIDOS</label>
                  <input type="text" name="apellidos" placeholder="Pérez López" value={formData.apellidos} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>CORREO ELECTRÓNICO (USUARIO)</label>
                <input type="email" name="email_tutor" placeholder="ejemplo@correo.com" value={formData.email_tutor} onChange={handleChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>CONTRASEÑA</label>
                  <input type="password" name="password" placeholder="********" value={formData.password} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>CONFIRMAR CONTRASEÑA</label>
                  <input type="password" name="confirmPassword" placeholder="********" value={formData.confirmPassword} onChange={handleChange} required />
                </div>
              </div>
              {error && <p className="error-msg">{error}</p>}
              <button type="submit" className="submit-btn final-btn" disabled={loading}>
                {loading ? 'CREANDO CUENTA...' : 'REGISTRARSE'}
              </button>
            </div>



            <div className="register-link">
              <span>¿Ya tienes cuenta? </span>
              <Link to="/">INICIA SESIÓN AQUÍ</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
