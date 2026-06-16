import { API_URL } from '../config/api';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import './PaymentModal.css';

function PaymentModal({ amount, onClose, onSuccess }) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/pagos/simular`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardNumber,
          cardName,
          expiry,
          cvc,
          amount
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error procesando el pago');
      }

      onSuccess(data.transactionId);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <button className="close-btn" onClick={onClose} disabled={loading}>&times;</button>
        
        <h2>Detalles de Pago</h2>
        <p className="payment-subtitle">Ingresa tu tarjeta para confirmar la compra</p>

        <div className="payment-amount">
          <span>Total a pagar:</span>
          <strong>${amount.toFixed(2)} USD</strong>
        </div>

        {error && <div className="payment-error">{error}</div>}

        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-group">
            <label>Nombre en la tarjeta</label>
            <input 
              type="text" 
              placeholder="Juan Pérez" 
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Número de Tarjeta</label>
            <input 
              type="text" 
              placeholder="0000 0000 0000 0000" 
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              required
              disabled={loading}
              maxLength="19"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Vencimiento</label>
              <input 
                type="text" 
                placeholder="MM/AA" 
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                required
                disabled={loading}
                maxLength="5"
              />
            </div>
            <div className="form-group">
              <label>CVC</label>
              <input 
                type="text" 
                placeholder="123" 
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                required
                disabled={loading}
                maxLength="4"
              />
            </div>
          </div>

          <button type="submit" className={`pay-submit-btn ${loading ? 'loading' : ''}`} disabled={loading}>
            {loading ? 'Procesando...' : `Pagar $${amount.toFixed(2)}`}
          </button>
        </form>
        <p className="secure-text">🔒 Pago seguro procesado (Simulación)</p>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default PaymentModal;
