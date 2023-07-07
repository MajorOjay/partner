// API route to save form input
app.post('/api/data', (req, res) => {
  const form = req.body.form;

  const query = 'INSERT INTO records (merchant, merchant_id, address, items, scanned) VALUES (?, ?, ?, ?, ?)';
  const values = [form.merchant, form.merchant_id, form.address, JSON.stringify(form.items), form.scanned];

  connection.query(query, values, (err, result) => {
    if (err) {
      console.error('Error saving form input:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    const recordId = result.insertId;
    const recordUrl = `https://example.com/record/${recordId}`;

    // Generate QR code
    const qrCode = qr.imageSync(recordUrl, { type: 'svg' });

    return res.json({ url: recordUrl, qrCode });
  });
});