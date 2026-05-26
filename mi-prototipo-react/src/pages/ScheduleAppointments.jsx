import { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format, addDays, getDay, setHours, setMinutes, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './ScheduleAppointments.css';

const DIAS_SEMANA = [
  { id: 1, label: 'Lunes' },
  { id: 2, label: 'Martes' },
  { id: 3, label: 'Miércoles' },
  { id: 4, label: 'Jueves' },
  { id: 5, label: 'Viernes' },
];

const HORARIOS = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

function ScheduleAppointments() {
  const { paqueteId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const sesionesTotales = location.state?.sesiones || 8; // fallback

  const [diasSeleccionados, setDiasSeleccionados] = useState([]);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState('');
  const [citasGeneradas, setCitasGeneradas] = useState([]);
  const [loading, setLoading] = useState(false);

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
    if (diasSeleccionados.length === 0) {
      alert('Debes seleccionar al menos 1 día.');
      return;
    }
    if (!horarioSeleccionado) {
      alert('Debes seleccionar un horario fijo.');
      return;
    }

    const [hour, minute] = horarioSeleccionado.split(':');
    let fechas = [];
    let currentDate = new Date();
    
    while (fechas.length < sesionesTotales) {
      currentDate = addDays(currentDate, 1);
      const dayOfWeek = getDay(currentDate); // 0 = Domingo, 1 = Lunes
      
      if (diasSeleccionados.includes(dayOfWeek)) {
        let fechaInicio = startOfDay(currentDate);
        fechaInicio = setHours(fechaInicio, parseInt(hour));
        fechaInicio = setMinutes(fechaInicio, parseInt(minute));
        
        // 45 min terapia + 15 min ordenamiento = bloque 1 hora
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

  const handleGenerarCitas = async () => {
    const bloqueFechas = generarBloqueDeFechas();
    if (!bloqueFechas) return;

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3000/api/citas/generar-bloque', {
        id_paquete: paqueteId,
        id_paciente: null, // Asumido por el backend
        citas: bloqueFechas
      });
      
      // Merge ID from backend for reference if needed
      const citasReales = res.data.citas.map((c, i) => ({
        ...bloqueFechas[i],
        id: c.id
      }));

      setCitasGeneradas(citasReales);
      setLoading(false);
    } catch (error) {
      console.error('Error al generar citas', error);
      alert('Error al generar citas');
      setLoading(false);
    }
  };

  const descargarPDF = () => {
    const doc = new jsPDF();
    
    // Logo / Cabecera (simulado con texto)
    doc.setFontSize(22);
    doc.setTextColor(11, 46, 89);
    doc.text("CENTRO iSMART", 105, 20, null, null, "center");
    
    doc.setFontSize(14);
    doc.setTextColor(0, 173, 239);
    doc.text("Reporte de Asignación de Citas", 105, 30, null, null, "center");

    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text(`Programa Adquirido: Terapia Acuática - ${sesionesTotales} sesiones`, 14, 45);
    doc.text(`Días Seleccionados: ${diasSeleccionados.map(d => DIAS_SEMANA.find(ds => ds.id === d).label).join(' y ')}`, 14, 52);
    doc.text(`Horario Fijo: ${horarioSeleccionado}`, 14, 59);

    const tableColumn = ["# Sesión", "Fecha y Hora"];
    const tableRows = [];

    citasGeneradas.forEach((cita, index) => {
      const rowData = [
        `Sesión ${index + 1}`,
        format(new Date(cita.fecha_hora_inicio), "EEEE dd 'de' MMMM, yyyy - HH:mm", { locale: es })
      ];
      tableRows.push(rowData);
    });

    doc.autoTable({
      startY: 65,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [0, 173, 239] }
    });

    doc.save(`citas_ismart_${paqueteId.substring(0,6)}.pdf`);
  };

  return (
    <div className="schedule-container">
      <h1>Asignación de Horarios</h1>
      <p className="subtitle">Selecciona tus días y el horario fijo para tus {sesionesTotales} sesiones.</p>

      <div className="schedule-card">
        <div className="section">
          <h3>1. Selecciona 2 días a la semana</h3>
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

        <div className="section">
          <h3>2. Selecciona un horario puntual</h3>
          <p className="hint">La cita dura 45 min, pero se reserva 1 hora (15 min de preparación para el profesional).</p>
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
          <button 
            className="generate-btn" 
            onClick={handleGenerarCitas}
            disabled={loading || diasSeleccionados.length === 0 || !horarioSeleccionado}
          >
            {loading ? 'Generando...' : 'Generar Cronograma de Citas'}
          </button>
        ) : (
          <div className="results-section">
            <h3 className="success-text">¡Cronograma Generado Exitosamente!</h3>
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
              <button className="confirm-btn" onClick={() => navigate('/welcome')}>
                Confirmar y Finalizar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScheduleAppointments;
