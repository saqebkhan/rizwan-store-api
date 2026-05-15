const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Memory storage to process with sharp before saving
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only images.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

const compressImage = async (req, res, next) => {
    if (!req.file && !req.files) return next();

    const processFile = async (file) => {
        // Convert all images to webp for maximum compression/performance
        const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;
        const outputPath = path.join(__dirname, '../uploads', filename);

        await sharp(file.buffer)
            .resize(1200, null, { // Resize to max 1200px width, maintain aspect ratio
                withoutEnlargement: true,
                fit: 'inside'
            })
            .webp({ quality: 75 }) // High compression with great quality
            .toFile(outputPath);

        return filename;
    };

    try {
        if (req.file) {
            req.file.filename = await processFile(req.file);
        } else if (req.files) {
            if (Array.isArray(req.files)) {
                for (let file of req.files) {
                    file.filename = await processFile(file);
                }
            } else {
                for (let key in req.files) {
                    for (let file of req.files[key]) {
                        file.filename = await processFile(file);
                    }
                }
            }
        }
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = { upload, compressImage };
