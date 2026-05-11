const express = require('express');
const path = require('path');
const crypto = require('crypto');
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

const ADMIN_USER = "Architect";
const ADMIN_PASS = "Lain2026";
let dataSkor = []; // Penampung hasil tes siswa

function generateDailyCode() {
    const today = new Date().toISOString().slice(0, 10); 
    const hash = crypto.createHash('sha256').update(today + "secret-iq").digest('hex');
    return "IQ-" + hash.slice(0, 5).toUpperCase();
}

const dailyCode = generateDailyCode();

// API: Login Admin & Liat Skor
app.post('/api/admin', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        res.json({ success: true, dailyCode, dataSkor });
    } else {
        res.status(401).json({ success: false, message: "Akses Ditolak!" });
    }
});

// API: Simpan Hasil Tes
app.post('/api/submit', (req, res) => {
    const { nama, skor } = req.body;
    dataSkor.push({ nama, skor, waktu: new Date().toLocaleString('id-ID') });
    res.json({ success: true });
});

app.post('/api/validate', (req, res) => {
    const { code } = req.body;
    if (code === dailyCode) res.json({ success: true });
    else res.status(403).json({ success: false, message: "Kode Salah!" });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server Ready`));
module.exports = app;
