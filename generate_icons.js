const sharp = require('sharp');
const path = require('path');

const inputImagePath = 'C:\\Users\\Client\\.gemini\\antigravity\\brain\\9b65a529-0b7f-4be1-a989-abe9fb291d7a\\pwa_icon_1778882274156.png';
const outputDir = 'c:\\Rizwan project\\frontend\\public';

async function generateIcons() {
    try {
        await sharp(inputImagePath)
            .resize(192, 192)
            .toFile(path.join(outputDir, 'pwa-192x192.png'));
            
        await sharp(inputImagePath)
            .resize(512, 512)
            .toFile(path.join(outputDir, 'pwa-512x512.png'));
            
        console.log('PWA icons generated successfully');
    } catch (error) {
        console.error('Error generating icons:', error);
    }
}

generateIcons();
