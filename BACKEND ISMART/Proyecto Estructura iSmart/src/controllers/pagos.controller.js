const simularPago = async (req, res) => {
  const { cardNumber, cardName, expiry, cvc, amount } = req.body;

  // Validación básica falsa
  if (!cardNumber || !cardName || !expiry || !cvc) {
    return res.status(400).json({ error: 'Todos los campos de la tarjeta son obligatorios.' });
  }

  // Simulación del tiempo de procesamiento en el banco (2 segundos)
  setTimeout(() => {
    // Para propósitos de demostración, cualquier tarjeta es válida
    // Podrías poner una lógica que rechace ciertas tarjetas si quisieras,
    // por ejemplo, si empieza con "0000"
    
    if (cardNumber.startsWith('0000')) {
      return res.status(402).json({ error: 'Pago rechazado por el banco (Fondos Insuficientes).' });
    }

    res.status(200).json({
      success: true,
      transactionId: `tx_${Math.random().toString(36).substring(2, 15)}`,
      message: 'Pago procesado exitosamente.',
      amountProcessed: amount || 0
    });
  }, 2000); // 2 seconds delay
};

module.exports = {
  simularPago
};
