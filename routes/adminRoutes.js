const express = require('express');
const adminController = require('../controller/adminController');
const router = express.Router();

router.get('/graphs', adminController.renderGraphsPage);

module.exports = router;
