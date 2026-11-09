require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');

const { sequelize } = require('./models');
const upload = require('./middleware/upload');

const authRoutes = require('./routes/authRoutes');
const newsRoutes = require('./routes/newsRoutes');
const productRoutes = require('./routes/productRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const messageRoutes = require('./routes/messageRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const orgStructureRoutes = require('./routes/orgStructureRoutes');
const soldierRoutes = require('./routes/soldierRoutes');
const programKerjaRoutes = require('./routes/programKerjaRoutes');
const absensiRoutes = require('./routes/absensiRoutes');
const laporanRoutes = require('./routes/laporanRoutes');
const jadwalPiketRoutes = require('./routes/jadwalPiketRoutes');

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin" },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    frameguard: {
      action: "sameorigin",
    },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:", "http:", "https:"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:5173'],
      },
    },
  })
);
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));

// Parsing body request standar (JSON dan URL-Encoded). 
// File upload multipart ditangani secara terisolasi pada route masing-masing yang terotentikasi.
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());


const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 1000, // Batasi setiap IP hingga 1000 permintaan per jendela waktu
  standardHeaders: true,
  legacyHeaders: false,
});

// File upload statis (thumbnail berita, gambar produk, foto galeri) dengan caching 7 hari
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '7d',
  immutable: true,
}));

// URL admin API di-noindex secara konsep (tidak ditautkan di navigasi publik)
app.use('/api/auth', authRoutes);
app.use('/api/news', apiLimiter, newsRoutes);
app.use('/api/products', apiLimiter, productRoutes);
app.use('/api/galleries', apiLimiter, galleryRoutes);
app.use('/api/messages', apiLimiter, messageRoutes);
app.use('/api/dashboard', apiLimiter, dashboardRoutes);
app.use('/api/org-structures', apiLimiter, orgStructureRoutes);
app.use('/api/soldiers', apiLimiter, soldierRoutes);
app.use('/api/program-kerja', apiLimiter, programKerjaRoutes);
app.use('/api/absensi', apiLimiter, absensiRoutes);
app.use('/api/laporan-harian', apiLimiter, laporanRoutes);
app.use('/api/jadwal-piket', apiLimiter, jadwalPiketRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Error handler global
app.use((err, req, res, next) => {
  // Tangani error dari Multer secara spesifik
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'Ukuran file terlalu besar. Maksimal 5MB.' });
  }
  if (err.code && err.code.startsWith('LIMIT_')) {
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  // Jangan log error "Unexpected end of form" ke konsol (noise dari klien)
  if (err.message && err.message.toLowerCase().includes('unexpected end of form')) {
    return res.status(400).json({ message: 'Form tidak lengkap atau koneksi terputus saat upload.' });
  }
  console.error(err);
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Terjadi kesalahan pada server.'
    : err.message;
  res.status(status).json({ message });
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Koneksi database berhasil.');
    await sequelize.sync(); // gunakan migration terpisah untuk production
    app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));
  } catch (err) {
    console.error('Gagal terhubung ke database:', err.message);
    process.exit(1);
  }
}

start();
