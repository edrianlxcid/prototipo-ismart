import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './pages/Dashboard';
import ProgramSelection from './pages/ProgramSelection';
import ScheduleAppointments from './pages/ScheduleAppointments';
import Welcome from './pages/Welcome';
import MedicalHistory from './pages/MedicalHistory';
import Layout from './components/Layout';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={!user ? <Login onLogin={setUser} /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <Register onLogin={setUser} /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={user ? <Layout user={user}><Dashboard user={user} /></Layout> : <Navigate to="/" />} />
        <Route path="/programas" element={user ? <Layout user={user}><ProgramSelection /></Layout> : <Navigate to="/" />} />
        <Route path="/agendar/:paqueteId" element={user ? <Layout user={user}><ScheduleAppointments user={user} /></Layout> : <Navigate to="/" />} />
        <Route path="/welcome" element={user ? <Layout user={user}><Welcome /></Layout> : <Navigate to="/" />} />
        <Route path="/historial-medico" element={user ? <Layout user={user}><MedicalHistory user={user} /></Layout> : <Navigate to="/" />} />
        {/* Ruta comodín de máxima seguridad: Si escribe /admin o cualquier URL no existente, lo expulsa al inicio */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;