import { API_URL } from '../config/api';
import { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format, addDays, getDay, setHours, setMinutes, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import PaymentModal from '../components/PaymentModal';
import './ScheduleAppointments.css';

const DIAS_SEMANA = [
  { id: 1, label: 'Lunes' },
  { id: 2, label: 'Martes' },
  { id: 3, label: 'Miércoles' },
  { id: 4, label: 'Jueves' },
  { id: 5, label: 'Viernes' },
];

const HORARIOS = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

function ScheduleAppointments({ user }) {
  const { paqueteId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const sesionesTotales = location.state?.sesiones || 8; 
  const precioPaquete = location.state?.precio || 150.00;

  // Estados del paciente
  const [nombresBebe, setNombresBebe] = useState('');
  const [apellidosBebe, setApellidosBebe] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [telefono, setTelefono] = useState('');

  // Estados de agendamiento
  const [diasSeleccionados, setDiasSeleccionados] = useState([]);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState('');
  const [citasGeneradas, setCitasGeneradas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [transactionId, setTransactionId] = useState(null);

  const toggleDia = (id) => {
    if (diasSeleccionados.includes(id)) {
      setDiasSeleccionados(diasSeleccionados.filter(d => d !== id));
    } else {
      if (diasSeleccionados.length < 2) {
        setDiasSeleccionados([...diasSeleccionados, id]);
      } else {
        alert('Solo puedes seleccionar un máximo de 2 días por semana.');
      }
    }
  };

  const generarBloqueDeFechas = () => {
    const [hour, minute] = horarioSeleccionado.split(':');
    let fechas = [];
    let currentDate = new Date();
    
    while (fechas.length < sesionesTotales) {
      currentDate = addDays(currentDate, 1);
      const dayOfWeek = getDay(currentDate); 
      
      if (diasSeleccionados.includes(dayOfWeek)) {
        let fechaInicio = startOfDay(currentDate);
        fechaInicio = setHours(fechaInicio, parseInt(hour));
        fechaInicio = setMinutes(fechaInicio, parseInt(minute));
        
        let fechaFin = new Date(fechaInicio.getTime());
        fechaFin = setMinutes(fechaFin, fechaFin.getMinutes() + 60);

        fechas.push({
          fecha_hora_inicio: fechaInicio.toISOString(),
          fecha_hora_fin: fechaFin.toISOString(),
          mostrarInicio: format(fechaInicio, "dd/MM/yyyy HH:mm"),
          mostrarFin: format(fechaFin, "dd/MM/yyyy HH:mm")
        });
      }
    }

    return fechas;
  };

  const handleOpenPayment = () => {
    if (!nombresBebe || !apellidosBebe || !fechaNacimiento || !telefono) {
      alert('Por favor completa todos los datos del paciente (bebé) antes de proceder.');
      return;
    }
    if (diasSeleccionados.length === 0) {
      alert('Debes seleccionar al menos 1 día.');
      return;
    }
    if (!horarioSeleccionado) {
      alert('Debes seleccionar un horario fijo.');
      return;
    }
    setShowPayment(true);
  };

  const handlePaymentSuccess = async (txId) => {
    setShowPayment(false);
    setTransactionId(txId);
    
    const bloqueFechas = generarBloqueDeFechas();
    if (!bloqueFechas) return;

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/citas/generar-bloque`, {
        id_paquete: paqueteId,
        usuario: user, 
        datos_paciente: {
          nombres: nombresBebe,
          apellidos: apellidosBebe,
          fecha_nacimiento: fechaNacimiento,
          telefono_tutor: telefono
        },
        citas: bloqueFechas
      });
      
      const citasReales = res.data.citas.map((c, i) => ({
        ...bloqueFechas[i],
        id: c.id
      }));

      setCitasGeneradas(citasReales);
      setLoading(false);
    } catch (error) {
      console.error('Error al generar citas', error);
      alert('Error de Backend: ' + (error.response?.data?.error || error.message));
      setLoading(false);
    }
  };

  const descargarPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.setTextColor(11, 46, 89);
    doc.text("CENTRO iSMART", 105, 20, null, null, "center");
    
    doc.setFontSize(14);
    doc.setTextColor(0, 173, 239);
    doc.text("Reporte de Asignación de Citas", 105, 30, null, null, "center");

    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text(`Paciente: ${nombresBebe.toUpperCase()} ${apellidosBebe.toUpperCase()}`, 14, 45);
    doc.text(`Programa Adquirido: Terapia - ${sesionesTotales} sesiones`, 14, 52);
    doc.text(`Transacción ID: ${transactionId || 'N/A'}`, 14, 59);
    doc.text(`Días Seleccionados: ${diasSeleccionados.map(d => DIAS_SEMANA.find(ds => ds.id === d).label).join(' y ')}`, 14, 66);
    doc.text(`Horario Fijo: ${horarioSeleccionado}`, 14, 73);

    const tableColumn = ["# Sesión", "Fecha y Hora"];
    const tableRows = [];

    citasGeneradas.forEach((cita, index) => {
      const rowData = [
        `Sesión ${index + 1}`,
        format(new Date(cita.fecha_hora_inicio), "EEEE dd 'de' MMMM, yyyy - HH:mm", { locale: es })
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      startY: 80,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [0, 173, 239] }
    });

    doc.save(`citas_ismart_${paqueteId.substring(0,6)}.pdf`);
  };

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <h1>Asignación de Horarios y Paciente</h1>
        <p className="subtitle">Registra al niño y selecciona tus días fijos para tus {sesionesTotales} sesiones.</p>
      </div>

      <div className="schedule-card glass-panel">
        
        {/* ================= PASO 1: DATOS DEL PACIENTE ================= */}
        <div className="section">
          <div className="section-header">
            <span className="step-number">1</span>
            <h3>Datos del Paciente (Bebé/Niño)</h3>
          </div>
          <div className="patient-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
            <input 
              type="text" 
              placeholder="Nombres del Niño" 
              value={nombresBebe} 
              onChange={e => setNombresBebe(e.target.value)} 
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }}
            />
            <input 
              type="text" 
              placeholder="Apellidos del Niño" 
              value={apellidosBebe} 
              onChange={e => setApellidosBebe(e.target.value)} 
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '0.85rem', color: '#666', marginBottom: '4px' }}>Fecha de Nacimiento</label>
              <input 
                type="date" 
                value={fechaNacimiento} 
                onChange={e => setFechaNacimiento(e.target.value)} 
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none', fontFamily: 'inherit' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '0.85rem', color: '#666', marginBottom: '4px' }}>Teléfono del Tutor/Representante</label>
              <input 
                type="text" 
                placeholder="Ej. 0999999999" 
                value={telefono} 
                onChange={e => setTelefono(e.target.value)} 
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* ================= PASO 2: DÍAS ================= */}
        <div className="section">
          <div className="section-header">
            <span className="step-number">2</span>
            <h3>Selecciona 2 días a la semana</h3>
          </div>
          <div className="days-group">
            {DIAS_SEMANA.map(dia => (
              <button
                key={dia.id}
                className={`day-btn ${diasSeleccionados.includes(dia.id) ? 'selected' : ''}`}
                onClick={() => toggleDia(dia.id)}
              >
                {dia.label}
              </button>
            ))}
          </div>
        </div>

        {/* ================= PASO 3: HORARIOS ================= */}
        <div className="section">
          <div className="section-header">
            <span className="step-number">3</span>
            <h3>Selecciona un horario puntual</h3>
          </div>
          <p className="hint">La cita dura 45 min, pero se reserva 1 hora para preparación.</p>
          <div className="hours-group">
            {HORARIOS.map(hora => (
              <button
                key={hora}
                className={`hour-btn ${horarioSeleccionado === hora ? 'selected' : ''}`}
                onClick={() => setHorarioSeleccionado(hora)}
              >
                {hora}
              </button>
            ))}
          </div>
        </div>

        {citasGeneradas.length === 0 ? (
          <div className="action-section">
            <div className="price-summary">
              <span>Total a pagar hoy:</span>
              <h2>${precioPaquete.toFixed(2)}</h2>
            </div>
            <button 
              className="generate-btn pulse-anim" 
              onClick={handleOpenPayment}
              disabled={loading || diasSeleccionados.length === 0 || !horarioSeleccionado || !nombresBebe || !apellidosBebe || !fechaNacimiento || !telefono}
            >
              {loading ? 'Procesando...' : 'Pagar y Generar Cronograma'}
            </button>
          </div>
        ) : (
          <div className="results-section slide-up">
            <div className="success-banner">
              <span className="check-icon">✓</span>
              <div>
                <h3 className="success-text">¡Compra y Cronograma Generados Exitosamente!</h3>
                <p>TxID: {transactionId}</p>
              </div>
            </div>
            
            <p className="patient-name">
              Paciente: {nombresBebe.toUpperCase()} {apellidosBebe.toUpperCase()}
            </p>

            <div className="appointments-list">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Fecha de la Sesión</th>
                    <th>Horario</th>
                  </tr>
                </thead>
                <tbody>
                  {citasGeneradas.map((cita, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td className="capitalize">{format(new Date(cita.fecha_hora_inicio), "EEEE, dd/MM/yyyy", { locale: es })}</td>
                      <td>{format(new Date(cita.fecha_hora_inicio), "HH:mm")} - {format(new Date(cita.fecha_fin || cita.fecha_hora_fin), "HH:mm")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="action-buttons">
              <button className="pdf-btn" onClick={descargarPDF}>
                📄 Descargar PDF
              </button>
              <button className="confirm-btn" onClick={() => navigate('/dashboard')}>
                Ir a mi Dashboard
              </button>
            </div>
          </div>
        )}
      </div>

      {showPayment && (
        <PaymentModal 
          amount={precioPaquete} 
          onClose={() => setShowPayment(false)} 
          onSuccess={handlePaymentSuccess} 
        />
      )}
    </div>
  );
}

export default ScheduleAppointments;
