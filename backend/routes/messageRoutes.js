const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const messageController = require('../controllers/messageController');
const { requireAuth, isAdmin } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

// Publik: submit form Kontak
router.post(
  '/',
  [
    body('sender_name').trim().notEmpty().withMessage('Nama wajib diisi.').isLength({ max: 100 }).withMessage('Nama maksimal 100 karakter.'),
    body('sender_email').isEmail().withMessage('Format email tidak valid.').isLength({ max: 255 }).withMessage('Email maksimal 255 karakter.'),
    body('subject').trim().notEmpty().withMessage('Subjek wajib diisi.').isLength({ max: 255 }).withMessage('Subjek maksimal 255 karakter.'),
    body('message').trim().notEmpty().withMessage('Pesan wajib diisi.').isLength({ max: 3000 }).withMessage('Pesan maksimal 3000 karakter.'),
  ],
  messageController.submit
);

// Admin: Kotak Masuk (proteksi role admin)
router.get('/', requireAuth, isAdmin, messageController.index);
router.get('/:id', requireAuth, isAdmin, messageController.show);
router.delete('/:id', requireAuth, isAdmin, messageController.remove);

module.exports = router;
