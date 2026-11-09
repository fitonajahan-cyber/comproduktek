const express = require('express');
const router = express.Router();
const crudFactory = require('../controllers/crudFactory');
const orgStructureController = require('../controllers/orgStructureController');
const { OrgStructure } = require('../models');
const { requireAuth, isAdmin } = require('../middleware/auth');
const { orgStructureValidation } = require('../middleware/validation');
const upload = require('../middleware/upload');

const controller = crudFactory(OrgStructure, {
  searchFields: ['name', 'position', 'rank'],
  defaultOrder: [['display_order', 'ASC']],
  attachAdmin: true,
  fileField: 'photo',
});

router.get('/', controller.index);

// PENTING: route statis '/reorder' harus didefinisikan SEBELUM '/:id'.
router.put('/reorder', requireAuth, isAdmin, orgStructureController.reorder);

router.get('/:id', controller.show);

// Admin (proteksi role admin)
router.post('/', requireAuth, isAdmin, upload.single('photo'), orgStructureValidation, controller.create);
router.put('/:id', requireAuth, isAdmin, upload.single('photo'), orgStructureValidation, controller.update);
router.put('/:id/empty', requireAuth, isAdmin, orgStructureController.emptyPosition);
router.delete('/:id', requireAuth, isAdmin, orgStructureController.remove);

module.exports = router;
