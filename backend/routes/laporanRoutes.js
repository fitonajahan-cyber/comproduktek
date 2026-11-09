const express = require('express');
const router = express.Router();
const c = require('../controllers/laporanController');
const { requireAuth, requireRole } = require('../middleware/auth');

// ── Soldier routes ─────────────────────────────────────────────────────────
// Get own laporan history
router.get('/mine', requireAuth, requireRole('soldier'), c.getMyLaporan);

// Create new laporan (with sesi array)
router.post('/', requireAuth, requireRole('soldier'), c.createLaporan);

// Add a sesi to existing laporan
router.post('/sesi', requireAuth, requireRole('soldier'), c.addSesi);

// Edit a sesi
router.put('/sesi/:id', requireAuth, requireRole('soldier'), c.updateSesi);

// Delete a sesi
router.delete('/sesi/:id', requireAuth, requireRole('soldier'), c.deleteSesi);

// ── Admin routes ───────────────────────────────────────────────────────────
// Get all laporan (with filters)
router.get('/', requireAuth, requireRole('admin'), c.getAllLaporan);

// Delete entire laporan header (cascades to sesi)
router.delete('/:id', requireAuth, requireRole('admin'), c.deleteLaporan);

module.exports = router;
