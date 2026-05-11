
const express = require('express');
const path = require('path');
const crypto = require('crypto');
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

// --- KONFIGURASI ADMIN ---
const ADMIN_USER = "Architect";
const ADMIN_PASS = "Lain2026";

// DATA PENYIMPANAN SEMENTARA (Akan reset jika server restart/idle di Vercel)
let dataSkor = []; 

// --- FUNGSI KODE HARIAN (Sama di setiap refresh, berubah setiap ganti tanggal) ---
function getDailyCode() {
    // Gunakan tanggal YYYY-MM-DD sebagai basis agar kode tetap sama seharian
    const today = new Date().toISOString().slice(0, 10); 
    const secretSalt = "IQ-PORTAL-KEY-2026"; 
    const hash = crypto.createHash('sha256').update(today + secretSalt).digest('hex');
    // Ambil 5 karakter pertama agar simpel
    return "IQ-" + hash.slice(0, 5).toUpperCase();
}

// API: VALIDASI KODE AKSES SISWA
app.post('/api/validate', (req, res) => {
    const { code } = req.body;
    const currentCode = getDailyCode();
    if (code === currentCode) {
        res.json({ success: true });
    } else {
        res.status(403).json({ success: false, message: "Kode akses salah! Cek token terbaru." });
    }
});

// API: LOGIN ADMIN & LIHAT DATABASE SKOR
app.post('/api/admin', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        res.json({ 
            success: true, 
            dailyCode: getDailyCode(), 
            dataSkor: dataSkor 
        });
    } else {
        res.status(401).json({ success: false, message: "Username/Password Salah!" });
    }
});

// API: SIMPAN HASIL TES SISWA
app.post('/api/submit', (req, res) => {
    const { nama, benar, total, iq } = req.body;
    dataSkor.push({ 
        nama, 
        benar, 
        total, 
        iq, 
        waktu: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) 
    });
    res.json({ success: true });
});

// ROUTING HALAMAN UTAMA
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
