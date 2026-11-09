const express = require('express');
const router = express.Router();
const crudFactory = require('../controllers/crudFactory');
const { Gallery } = require('../models');
const { requireAuth, isAdmin } = require('../middleware/auth');
const { galleryValidation } = require('../middleware/validation');
const upload = require('../middleware/upload');

const controller = crudFactory(Gallery, {
  searchFields: ['description'],
  defaultOrder: [['gallery_date', 'DESC']],
  attachAdmin: true,
  fileField: 'image',
});

router.get('/', controller.index);
router.get('/:id', controller.show);

// Admin (proteksi role admin)
router.post('/', requireAuth, isAdmin, upload.single('image'), galleryValidation, controller.create);
router.put('/:id', requireAuth, isAdmin, upload.single('image'), galleryValidation, controller.update);
router.delete('/:id', requireAuth, isAdmin, controller.remove);

module.exports = router;
