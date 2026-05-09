const express = require('express');
const path = require('path');
const crypto = require('crypto');
const app = express();

app.use(express.json());

// 1. SETTING FOLDER STATIS (Agar gambar/css/js di folder public terbaca)
app.use(express.static(path.join(__dirname, 'public')));

// 2. PASSWORD ADMIN (Ganti sesuka lo)
const ADMIN_PASS = "Lain2026";

// 3. LOGIKA DAILY TOKEN (Otomatis ganti tiap jam 00:00)
function generateDailyCode() {
    const today = new Date().toISOString().slice(0, 10); 
    const hash = crypto.createHash('sha256').update(today + "secret-salt-iq").digest('hex');
    return "ARCH-" + hash.slice(0, 5).toUpperCase();
}

// Munculkan token di LOGS Vercel saat server nyala
const dailyCode = generateDailyCode();
console.log(`====================================`);
console.log(`[SYSTEM] Server Aktif`);
console.log(`[KEY] Kode Siswa Hari Ini: ${dailyCode}`);
console.log(`====================================`);

// 4. ROUTE HALAMAN UTAMA (Arahkan ke index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 5. API UNTUK LOGIN ADMIN
app.post('/api/admin', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASS) {
        res.json({ success: true, dailyCode: dailyCode });
    } else {
        res.status(401).json({ success: false, message: "Password Admin Salah!" });
    }
});

// 6. API UNTUK VALIDASI KODE SISWA
app.post('/api/validate', (req, res) => {
    const { code } = req.body;
    if (code === dailyCode) {
        res.json({ success: true, message: "Akses Diberikan!" });
    } else {
        res.status(403).json({ success: false, message: "Kode Akses Salah atau Kadaluwarsa!" });
    }
});

// 7. PORT (Otomatis menyesuaikan server Vercel)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app; // Penting untuk Vercel
