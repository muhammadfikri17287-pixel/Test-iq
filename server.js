const express = require('express');
const path = require('path');
const crypto = require('crypto');
const app = express();

app.use(express.json());

// 1. KARENA FILE LO DI LUAR (ROOT), GUNAKAN INI:
app.use(express.static(__dirname));

// 2. SETTING PASSWORD ADMIN & LOGIKA TOKEN
const ADMIN_PASS = "Lain2026";

function generateDailyCode() {
    const today = new Date().toISOString().slice(0, 10); 
    const hash = crypto.createHash('sha256').update(today + "secret-salt-iq").digest('hex');
    return "ARCH-" + hash.slice(0, 5).toUpperCase();
}

const dailyCode = generateDailyCode();

// Info ini akan muncul di tab "Logs" di Vercel lo
console.log(`====================================`);
console.log(`[SYSTEM] Server Vercel Aktif`);
console.log(`[KEY] Kode Siswa Hari Ini: ${dailyCode}`);
console.log(`====================================`);

// 3. ROUTE HALAMAN UTAMA (Langsung panggil index.html di root)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 4. API UNTUK LOGIN ADMIN
app.post('/api/admin', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASS) {
        res.json({ success: true, dailyCode: dailyCode });
    } else {
        res.status(401).json({ success: false, message: "Password Admin Salah!" });
    }
});

// 5. API UNTUK VALIDASI KODE SISWA
app.post('/api/validate', (req, res) => {
    const { code } = req.body;
    if (code === dailyCode) {
        res.json({ success: true, message: "Akses Diberikan!" });
    } else {
        res.status(403).json({ success: false, message: "Kode Akses Salah atau Kadaluwarsa!" });
    }
});

// 6. SETTING PORT UNTUK VERCEL
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
