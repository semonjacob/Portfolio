const fs = require('fs');
const path = require('path');

const htmlPath = path.join(process.cwd(), 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const stillsDir = path.join(process.cwd(), 'assets', 'stills');
const stills = {};

const scanDir = (dir, relPath = '') => {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach(entry => {
    if (entry.isDirectory()) {
      scanDir(path.join(dir, entry.name), path.join(relPath, entry.name));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext.toLowerCase())) {
        const baseName = path.basename(entry.name, ext);
        let slotId = baseName;
        if (relPath) {
          const folderName = relPath.replace(/\\/g, '/');
          if (!baseName.startsWith(folderName)) {
            slotId = `${folderName}_${baseName}`;
          }
        }
        const fileRelUrl = `assets/stills/${relPath ? relPath + '/' : ''}${entry.name}`.replace(/\\/g, '/');
        stills[slotId] = fileRelUrl;
      }
    }
  });
};
scanDir(stillsDir);

console.log('Found stills mapping:', stills);

let count = 0;
for (const [slotId, fileUrl] of Object.entries(stills)) {
  const targetId = `id="img_${slotId}"`;
  const pos = html.indexOf(targetId);
  if (pos !== -1) {
    const stylePos = html.indexOf('style="background-image:', pos);
    const endStylePos = html.indexOf(';"', stylePos);
    if (stylePos !== -1 && endStylePos !== -1 && stylePos - pos < 150) {
      const newStyle = `style="background-image: url('${fileUrl}');"`;
      html = html.substring(0, stylePos) + newStyle + html.substring(endStylePos + 2);
      count++;
      console.log(`Updated img_${slotId} -> ${fileUrl}`);
    }
  }
}

fs.writeFileSync(htmlPath, html, 'utf8');
console.log(`Updated ${count} elements in index.html`);
