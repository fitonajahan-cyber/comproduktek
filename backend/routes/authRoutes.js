const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 10, // Batasi setiap IP hingga 10 percobaan login per jendela waktu
  message: 'Terlalu banyak percobaan login dari IP ini, silakan coba lagi setelah 15 menit.',
  standardHeaders: true,
  legacyHeaders: false, 
});

router.post('/login', authLimiter, authController.login);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.me);

module.exports = router;
