import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar({ user }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Para recargar y botar al usuario al login
    window.location.href = '/'; 
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-logo">
          <span className="logo-i">i</span>Smart
        </Link>
        <div className="navbar-user">
          <div className="user-info">
            <span className="user-name">{user?.nombres || user?.email?.split('@')[0] || 'Usuario'}</span>
            <span className="user-role">Paciente</span>
          </div>
          <div className="user-avatar">
            {user ? (user.nombres ? user.nombres.charAt(0) : user.email?.charAt(0) || 'U').toUpperCase() : 'U'}
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Cerrar Sesión">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
