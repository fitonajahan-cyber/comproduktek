const express = require('express');
const router = express.Router();
const absensiController = require('../controllers/absensiController');
const { requireAuth, requireRole } = require('../middleware/auth');

// Get all attendance for a date (lazy-generates if not exist). Admin sees all, Soldier sees own.
router.get('/', requireAuth, requireRole('admin', 'soldier'), absensiController.getAbsensiList);

// Soldier: get own attendance for a full month (lazy-generates 'belum_diisi' for self only)
router.get('/monthly', requireAuth, requireRole('soldier'), absensiController.getAbsensiMonthly);

// Get attendance stats for dashboard
router.get('/stats/:soldierId?', requireAuth, requireRole('admin', 'soldier'), absensiController.getAbsensiStats);

// Soldier submits an appeal
router.put('/:id/sanggahan', requireAuth, requireRole('soldier'), absensiController.ajukanSanggahan);

// Admin reviews an appeal (approve/reject)
router.put('/:id/review', requireAuth, requireRole('admin'), absensiController.reviewSanggahan);

// Admin directly updates attendance status/keterangan
router.put('/:id', requireAuth, requireRole('admin'), absensiController.updateAbsensi);

module.exports = router;
