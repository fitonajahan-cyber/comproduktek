const express = require('express');
const router = express.Router();
const jadwalPiketController = require('../controllers/jadwalPiketController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);

router.get('/calendar', requireRole('admin', 'soldier'), jadwalPiketController.calendar);
router.post('/generate', requireRole('admin'), jadwalPiketController.generate);
router.delete('/reset', requireRole('admin'), jadwalPiketController.reset);
router.get('/', requireRole('admin'), jadwalPiketController.index);
router.get('/tanggal/:date', requireRole('admin'), jadwalPiketController.showByDate);
router.get('/my-swaps', requireRole('soldier'), jadwalPiketController.mySwaps);
router.get('/:id', requireRole('admin'), jadwalPiketController.show);
router.get('/:id/swap-targets', requireRole('soldier'), jadwalPiketController.suggestSwapTargets);
router.put('/:id/usulan', requireRole('soldier'), jadwalPiketController.ajukanUsulanStatus);
router.put('/:id/usulan-tukar', requireRole('soldier'), jadwalPiketController.ajukanUsulanTukar);
router.put('/:id/review-usulan', requireRole('admin'), jadwalPiketController.reviewUsulanStatus);
router.put('/:id/review-tukar', requireRole('admin'), jadwalPiketController.reviewUsulanTukar);
router.put('/:id', requireRole('admin'), jadwalPiketController.update);
router.delete('/:id', requireRole('admin'), jadwalPiketController.remove);

module.exports = router;
