const express = require('express');
const router = express.Router();
const programKerjaController = require('../controllers/programKerjaController');
const { requireAuth, requireRole, isSoldier } = require('../middleware/auth');
const { programKerjaValidation } = require('../middleware/validation');
const uploadDocument = require('../middleware/uploadDocument');

// All endpoints require authentication
router.use(requireAuth);

// GET accessible by admin and soldier (scoping is done in controller)
router.get('/', programKerjaController.index);
router.get('/:id', programKerjaController.show);

// POST, PUT, DELETE only for admin
// Multer (uploadDocument) harus jalan SEBELUM validation membaca req.body
// karena multipart/form-data.
router.post(
  '/',
  requireRole('admin'),
  uploadDocument.fields([{ name: 'file_perencanaan', maxCount: 1 }]),
  programKerjaValidation,
  programKerjaController.create,
);
router.put(
  '/:id',
  requireRole('admin'),
  uploadDocument.fields([{ name: 'file_perencanaan', maxCount: 1 }]),
  programKerjaValidation,
  programKerjaController.update,
);
router.delete('/:id', requireRole('admin'), programKerjaController.remove);

// Izinkan soldier melakukan update proker miliknya sendiri (misal: tandai selesai)
router.put('/:id/soldier-update', requireAuth, isSoldier, programKerjaController.soldierUpdate);

// Hapus dokumen perencanaan (admin only)
router.delete('/:id/file-perencanaan', requireRole('admin'), programKerjaController.removeFilePerencanaan);

// Upload dokumen hasil (khusus soldier: PJ atau anggota tim, dicek di controller)
router.put(
  '/:id/hasil',
  requireAuth,
  isSoldier,
  uploadDocument.single('file_hasil'),
  programKerjaController.uploadHasil,
);

// Hapus dokumen hasil (admin atau soldier PJ/tim)
router.delete('/:id/file-hasil', requireAuth, programKerjaController.removeFileHasil);

// Download aman — requireAuth SAJA di level route, karena pengecekan
// role admin/PJ/tim dilakukan MANUAL di dalam controller (aturan conditional).
router.get('/:id/download/perencanaan', requireAuth, programKerjaController.downloadPerencanaan);
router.get('/:id/download/hasil', requireAuth, programKerjaController.downloadHasil);

module.exports = router;
