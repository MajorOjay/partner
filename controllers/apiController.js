const mysql = require('mysql');
const {connection, pool} = require('../config/config');
const {loggedIn, logger} = require('../config/customFunction');
const qr = require('qr-image');

module.exports = {

    


    middleware_createStore: (req, res) => {
        const form = {
            merchant: "Walmart",
            merchant_id: 12,
            address: "45 lacre, 1st shoindede",
            date: Date.now(),
            total: 240,
            base: 2360,
            tax: 4,
            receipt_id: "#2112240",
            items: {
                1: {
                    prod: "bag",
                    unit: 2,
                    unit_price: "$22",
                    total_price: "$44",
                },
                2: {
                    prod: "shoe",
                    unit: 1,
                    unit_price: "$12",
                    total_price: "$24",
                },

            },
            scanned: "No"
        }

            const query = 'INSERT INTO orders (merchant, merchant_id, address, items, scanned) VALUES (?, ?, ?, ?, ?)';
            const values = [form.merchant, form.merchant_id, form.address, JSON.stringify(form.items), form.scanned, form.total, form.base, form.tax, form.date, form.receipt_id];

            connection.query(query, values, (err, result) => {
            if (err) {
                console.error('Error saving form input:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            const recordId = result.insertId;
            const recordUrl = `http://localhost:7000/qr/${recordId}`;
            const updateQuery = 'UPDATE orders SET url = ? WHERE id = ?';
            connection.query(updateQuery, [recordUrl, recordId], (updateErr) => {
            if (updateErr) {
                console.error('Error updating record URL:', updateErr);
                return res.status(500).json({ error: 'Internal server error' });
            }
            })    


            // Generate QR code
            const qrCode = qr.imageSync(recordUrl, { type: 'svg' });

            return res.send({ qrCode });
            });

            },



}