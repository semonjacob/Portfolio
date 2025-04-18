const CleanCSS = require('clean-css');
const Terser = require('terser');
const fs = require('fs');
const path = require('path');

const cssDir = path.join(__dirname, 'assets/styles');
const jsDir = path.join(__dirname, 'assets/scripts');

// Minify CSS files
fs.readdir(cssDir, (err, files) => {
  if (err) throw err;

  files.filter(file => file.endsWith('.css')).forEach(file => {
    const filePath = path.join(cssDir, file);
    const css = fs.readFileSync(filePath, 'utf8');
    const output = new CleanCSS().minify(css);

    if (output.styles) {
      fs.writeFileSync(filePath.replace('.css', '.min.css'), output.styles);
      console.log(`${file} minified successfully.`);
    } else {
      console.error(`Error minifying ${file}:`, output.errors);
    }
  });
});

// Minify JS files
fs.readdir(jsDir, (err, files) => {
  if (err) throw err;

  files.filter(file => file.endsWith('.js')).forEach(file => {
    const filePath = path.join(jsDir, file);
    const js = fs.readFileSync(filePath, 'utf8');
    const output = Terser.minify(js);

    if (output.code) {
      fs.writeFileSync(filePath.replace('.js', '.min.js'), output.code);
      console.log(`${file} minified successfully.`);
    } else {
      console.error(`Error minifying ${file}:`, output.error);
    }
  });
});