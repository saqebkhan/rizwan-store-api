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
        const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        const outputPath = path.join(__dirname, '../uploads', filename);

        // Compress to <100kb
        // We use quality adjustment and resizing to achieve this
        let quality = 80;
        let buffer = await sharp(file.buffer)
            .jpeg({ quality: quality })
            .toBuffer();

        // If still > 100kb, reduce quality further
        while (buffer.length > 100 * 1024 && quality > 10) {
            quality -= 10;
            buffer = await sharp(file.buffer)
                .jpeg({ quality: quality })
                .toBuffer();
        }

        fs.writeFileSync(outputPath, buffer);
        return filename;
    };

    try {
        if (req.file) {
            req.file.filename = await processFile(req.file);
        } else if (req.files) {
            // Handle multiple files (e.g., product images)
            if (Array.isArray(req.files)) {
                for (let file of req.files) {
                    file.filename = await processFile(file);
                }
            } else {
                // Handle fields (e.g., thumbnail and images)
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
