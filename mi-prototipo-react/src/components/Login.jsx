import { useState, useEffect } from 'react';
import './Login.css';
import chikyHappy from '../assets/CHIKY-HAPPY.png';
import chikyAgua from '../assets/CHIKY-AGUA.png';
import chikyRegalo from '../assets/CHIKY-REGALO.png';
import chikySkate from '../assets/CHIKY-SKATE.png';
import chikySuperheroe from '../assets/CHIKY-SUPERHEROE.png';
import logoImage from '../assets/Ismart full color.png';

const chikyImages = [chikyHappy, chikySuperheroe, chikySkate, chikyAgua, chikyRegalo];

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [currentChikyIndex, setCurrentChikyIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentChikyIndex((prevIndex) => (prevIndex + 1) % chikyImages.length);
    }, 4000); // Cambia cada 4 segundos
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      onLogin(email);
      setError('');
    } else {
      setError('Por favor, ingresa tus datos.');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <div className="login-left-content">
          <h1 className="welcome-title">¡BIENVENIDO <br /> A iSMART!</h1>
          <p className="welcome-subtitle">PREMIA TU ESFUERZO.<br />ACCEDE A NUESTRO PORTAL.</p>

          <div className="chiky-img-container">
            <img
              key={currentChikyIndex}
              src={chikyImages[currentChikyIndex]}
              alt="Mascota iSmart"
              className="chiky-img chiky-fade"
            />
          </div>

          <p className="welcome-footer">Sigue viviendo el<br />cambio en familia.</p>
        </div>

        <div className="social-footer">
          <div className="social-icons">
            {/* Facebook */}
            <a href="#" className="social-icon" aria-label="Facebook">
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7.5v4H10V22h4v-8.5z" />
              </svg>
            </a>
            {/* Instagram */}
            <a href="#" className="social-icon" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            {/* TikTok */}
            <a href="#" className="social-icon" aria-label="TikTok">
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.04-.1z" />
              </svg>
            </a>
          </div>
          <a href="https://www.grupoismartec.com" target="_blank" rel="noreferrer" className="website-link">www.grupoismartec.com</a>
          <span className="version-number">N° 0301</span>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-container">
          <div className="ribbon-container">
            <img src={logoImage} alt="iSMART Logo" className="ribbon-logo" />
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>CORREO ELECTRÓNICO / USUARIO</label>
              <input
                type="text"
                placeholder="ejemplo@ismartec.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>CONTRASEÑA</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="forgot-password">
              <a href="#">¿Olvidé mi contraseña?</a>
            </div>

            <button type="submit" className="submit-btn">INICIAR SESIÓN</button>

            <div className="register-link">
              <span>¿Aún no tienes cuenta? </span>
              <a href="#">REGÍSTRATE</a>
            </div>
          </form>
          {error && <p className="error-msg">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default Login;