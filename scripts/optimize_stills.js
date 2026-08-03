const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const stillsDir = path.join(process.cwd(), 'assets', 'stills');

function getFiles(dir) {
  let results = [];
  fs.readdirSync(dir, { withFileTypes: true }).forEach(ent => {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      results = results.concat(getFiles(full));
    } else if (ent.isFile() && !ent.name.startsWith('.')) {
      results.push(full);
    }
  });
  return results;
}

const files = getFiles(stillsDir);
console.log(`Optimizing ${files.length} still images...`);

let origTotal = 0;
let optTotal = 0;

files.forEach((filePath, idx) => {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.webp') return; // already webp

  const dirName = path.dirname(filePath);
  const baseName = path.basename(filePath, ext);
  const webpPath = path.join(dirName, `${baseName}.webp`);

  const stat = fs.statSync(filePath);
  origTotal += stat.size;

  try {
    // Convert to webp max dimension 1200px, quality 85
    execSync(`convert "${filePath}" -resize "1200x1200>" -quality 85 "${webpPath}"`);
    const newStat = fs.statSync(webpPath);
    optTotal += newStat.size;

    console.log(`[${idx + 1}/${files.length}] ${baseName}: ${(stat.size / 1024 / 1024).toFixed(2)}MB -> ${(newStat.size / 1024).toFixed(1)}KB`);

    // Remove old file if it was .png / .jpg and webp creation succeeded
    if (fs.existsSync(webpPath) && newStat.size > 0 && filePath !== webpPath) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error(`Failed to convert ${filePath}:`, err.message);
  }
});

console.log(`\nOptimization Complete!`);
console.log(`Original total: ${(origTotal / 1024 / 1024).toFixed(2)} MB`);
console.log(`Optimized WebP total: ${(optTotal / 1024 / 1024).toFixed(2)} MB`);
console.log(`Saved: ${(((origTotal - optTotal) / origTotal) * 100).toFixed(1)}% network payload bandwidth!`);
