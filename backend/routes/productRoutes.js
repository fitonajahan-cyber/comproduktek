const express = require('express');
const router = express.Router();
const crudFactory = require('../controllers/crudFactory');
const { Product } = require('../models');
const { requireAuth, isAdmin } = require('../middleware/auth');
const { productValidation } = require('../middleware/validation');
const upload = require('../middleware/upload');

const controller = crudFactory(Product, {
  searchFields: ['name', 'category', 'unit_pengampu'],
  attachAdmin: true,
  fileField: 'image',
});

router.get('/', controller.index);
router.get('/:id', controller.show);

// Admin (proteksi role admin)
router.post('/', requireAuth, isAdmin, upload.single('image'), productValidation, controller.create);
router.put('/:id', requireAuth, isAdmin, upload.single('image'), productValidation, controller.update);
router.delete('/:id', requireAuth, isAdmin, controller.remove);

module.exports = router;
