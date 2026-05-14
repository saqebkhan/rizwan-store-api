const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

router.post('/start', sessionController.startSession);
router.post('/update', sessionController.updateSession);
router.post('/end', sessionController.endSession);

// Admin Routes
router.get('/history', sessionController.getSessionHistory);

module.exports = router;
