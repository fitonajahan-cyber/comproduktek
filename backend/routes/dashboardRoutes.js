const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { requireAuth, isAdmin } = require('../middleware/auth');

router.get('/summary', requireAuth, isAdmin, dashboardController.summary);

module.exports = router;
