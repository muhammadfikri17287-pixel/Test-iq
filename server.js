const express = require('express');
const crypto = require('crypto');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public')); // Melayani file web

// Database Sementara (Ganti ke MongoDB nanti kalau mau serius)
let dbScores = []; 
const ADMIN_PASS = "Lain2026"; // Password untuk masuk panel Admin

// Fungsi pembuat kode acak harian berdasarkan tanggal
function generateDailyCode() {
    const today = new Date().toISOString().slice(0, 10); // Format YYYY-MM-DD
    const hash = crypto.createHash('sha256').update(today + "secretSalt").digest('hex');
    return "ARCH-" + hash.slice(0, 5).toUpperCase();
}

// API: Verifikasi Login Siswa
app.post('/api/student-login', (req, res) => {
    const { name, code } = req.body;
    const dailyCode = generateDailyCode();
    
    if (code === dailyCode) {
        res.json({ success: true, message: "Akses Diberikan." });
    } else {
        res.json({ success: false, message: "Akses Ditolak. Kode salah atau kedaluwarsa." });
    }
});

// API: Simpan Skor Siswa
app.post('/api/submit-score', (req, res) => {
    const { name, score, totalQuestions } = req.body;
    dbScores.push({
        name: name,
        score: score,
        accuracy: Math.round((score / totalQuestions) * 100) + "%",
        time: new Date().toLocaleTimeString()
    });
    res.json({ success: true });
});

// API: Login Admin & Ambil Data
app.post('/api/admin', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASS) {
        res.json({ success: true, data: dbScores, dailyCode: generateDailyCode() });
    } else {
        res.json({ success: false, message: "Password Admin Salah!" });
    }
});

// TULISAN BARU (Pakai yang ini sekarang)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`[SYSTEM] Server aktif di port: ${PORT}`);
    console.log(`[KEY] Kode Siswa Hari Ini: ${generateDailyCode()}`);
});

