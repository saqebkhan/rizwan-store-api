const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiryController');

router.post('/', inquiryController.createInquiry);

// Admin Routes
router.get('/', inquiryController.getAllInquiries);
router.get('/stats', inquiryController.getDashboardStats);
router.patch('/:id/status', inquiryController.updateInquiryStatus);

module.exports = router;
