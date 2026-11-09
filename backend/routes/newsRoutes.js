const express = require('express');
const router = express.Router();
const crudFactory = require('../controllers/crudFactory');
const { News } = require('../models');
const { requireAuth, isAdmin } = require('../middleware/auth');
const { newsValidation } = require('../middleware/validation');
const upload = require('../middleware/upload');

const controller = crudFactory(News, {
  searchFields: ['title', 'content', 'category'],
  defaultOrder: [
    ['news_date', 'DESC'],
    ['category', 'ASC']
  ],
  attachAdmin: true,
  fileField: 'thumbnail',
});

// Publik
router.get('/', controller.index);
router.get('/:id', controller.show);

// Admin (proteksi role admin)
router.post('/', requireAuth, isAdmin, upload.single('thumbnail'), newsValidation, controller.create);
router.put('/:id', requireAuth, isAdmin, upload.single('thumbnail'), newsValidation, controller.update);
router.delete('/:id', requireAuth, isAdmin, controller.remove);

module.exports = router;