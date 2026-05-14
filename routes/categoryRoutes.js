const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { upload, compressImage } = require('../middleware/upload');

router.get('/', categoryController.getAllCategories);
router.get('/:slug', categoryController.getCategoryBySlug);

// Admin Routes (Protect these if needed later)
router.post('/', upload.single('image'), compressImage, categoryController.createCategory);
router.put('/:id', upload.single('image'), compressImage, categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
