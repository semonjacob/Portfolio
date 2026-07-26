const fs = require('fs');
const path = require('path');

const stillsDir = path.join(__dirname, '..', 'assets', 'stills');
if (!fs.existsSync(stillsDir)) {
  fs.mkdirSync(stillsDir, { recursive: true });
}

const stillsPath = path.join(__dirname, '..', 'data', 'stills.json');
if (fs.existsSync(stillsPath)) {
  const stills = JSON.parse(fs.readFileSync(stillsPath, 'utf8'));
  const updatedStills = {};
  for (const [slotId, dataUrl] of Object.entries(stills)) {
    if (typeof dataUrl === 'string' && dataUrl.startsWith('data:image')) {
      const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
      if (matches) {
        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const fileName = `${slotId}.${ext}`;
        const filePath = path.join(stillsDir, fileName);
        fs.writeFileSync(filePath, buffer);
        console.log(`Saved ${fileName} (${buffer.length} bytes)`);
        updatedStills[slotId] = `/assets/stills/${fileName}`;
      } else {
        updatedStills[slotId] = dataUrl;
      }
    } else {
      updatedStills[slotId] = dataUrl;
    }
  }
  fs.writeFileSync(stillsPath, JSON.stringify(updatedStills, null, 2), 'utf8');
  console.log('Updated stills.json with file references.');
}
