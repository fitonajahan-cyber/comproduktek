const multer = require('multer');
const path = require('path');
const fs = require('fs');

// PENTING: dokumen proker disimpan DI LUAR folder backend/uploads/ yang
// di-serve publik oleh express.static. Akses hanya lewat endpoint download
// yang dijaga otorisasi di controller.
const uploadDir = path.join(__dirname, '..', 'private-uploads', 'proker-documents');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    // Sisipkan nama asli (disanitasi) agar res.download menampilkan nama bermakna
    const safeOriginal = file.originalname
      .replace(/\.[^.]+$/, '') // buang extension asli
      .replace(/[^a-zA-Z0-9-_ ]/g, '') // buang karakter berbahaya untuk path
      .trim()
      .substring(0, 80);
    const original = safeOriginal ? `-${safeOriginal}` : '';
    cb(null, unique + original + path.extname(file.originalname).toLowerCase());
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /pdf|doc|docx/;
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  const ok =
    allowed.test(path.extname(file.originalname).toLowerCase()) &&
    allowedMimes.includes(file.mimetype);
  if (ok) return cb(null, true);
  cb(new Error('Hanya dokumen (pdf, doc, docx) yang diizinkan.'));
};

const uploadDocument = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = uploadDocument;
