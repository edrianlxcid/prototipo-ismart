import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import ProgramSelection from './pages/ProgramSelection';
import ScheduleAppointments from './pages/ScheduleAppointments';
import Welcome from './pages/Welcome';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={!user ? <Login onLogin={setUser} /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/" />} />
        <Route path="/programas" element={user ? <ProgramSelection /> : <Navigate to="/" />} />
        <Route path="/agendar/:paqueteId" element={user ? <ScheduleAppointments /> : <Navigate to="/" />} />
        <Route path="/welcome" element={user ? <Welcome /> : <Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;