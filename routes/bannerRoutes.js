const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const { upload, compressImage } = require('../middleware/upload');

router.get('/', bannerController.getBanners);

// Admin Routes
router.get('/all', bannerController.getAllBanners);
router.post('/', upload.single('image'), compressImage, bannerController.createBanner);
router.put('/:id', upload.single('image'), compressImage, bannerController.updateBanner);
router.delete('/:id', bannerController.deleteBanner);

module.exports = router;
