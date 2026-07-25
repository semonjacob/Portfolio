const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, 'assets/images');
const outputDir = path.join(__dirname, 'assets/images/compressed');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

fs.readdir(inputDir, (err, files) => {
  if (err) throw err;

  files.forEach(file => {
    const inputFile = path.join(inputDir, file);
    const outputFile = path.join(outputDir, file);

    sharp(inputFile)
      .resize(800) // Resize to a max width of 800px
      .toFormat('jpeg', { quality: 80 }) // Compress to 80% quality
      .toFile(outputFile, (err) => {
        if (err) {
          console.error(`Error compressing ${file}:`, err);
        } else {
          console.log(`${file} compressed successfully.`);
        }
      });
  });
});