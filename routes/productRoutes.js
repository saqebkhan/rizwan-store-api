const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { upload, compressImage } = require('../middleware/upload');

const productUploads = upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 2 }
]);

router.get('/', productController.getAllProducts);
router.get('/suggestions', productController.getSuggestions);
router.get('/:slug', productController.getProductBySlug);

// Admin Routes
router.post('/', productUploads, compressImage, productController.createProduct);
router.put('/:id', productUploads, compressImage, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
