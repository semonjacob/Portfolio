const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
const upload = multer();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dynamic API for Tools/Skills Rack (reads data/tools.json or data/tools.txt)
app.get('/api/tools', (req, res) => {
  try {
    const jsonPath = path.join(__dirname, 'data', 'tools.json');
    const txtPath = path.join(__dirname, 'data', 'tools.txt');

    if (fs.existsSync(jsonPath)) {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      return res.json({ success: true, source: 'json', tools: data });
    } else if (fs.existsSync(txtPath)) {
      const lines = fs.readFileSync(txtPath, 'utf8').split('\n');
      const tools = [];
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const parts = trimmed.split('|').map(p => p.trim());
          if (parts.length >= 1) {
            tools.push({
              name: parts[0],
              icon: parts[1] || parts[0].substring(0, 2),
              color: parts[2] || '#222222',
              url: parts[3] || '#'
            });
          }
        }
      });
      return res.json({ success: true, source: 'txt', tools });
    }
    return res.json({ success: true, tools: [] });
  } catch (err) {
    console.error('Error loading tools:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Dynamic API for Projects & Organizations Folder Scanner
function parseYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2] && match[2].length === 11) ? match[2] : null;
}

app.get('/api/projects', (req, res) => {
  try {
    let projects = [];
    const jsonPath = path.join(__dirname, 'data', 'projects.json');

    // 1. Read structured JSON projects if present
    if (fs.existsSync(jsonPath)) {
      projects = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    }

    // 2. Scan assets/projects/ filesystem folders dynamically
    const projectsDir = path.join(__dirname, 'assets', 'projects');
    if (fs.existsSync(projectsDir)) {
      const orgFolders = fs.readdirSync(projectsDir);
      orgFolders.forEach(orgFolder => {
        const orgPath = path.join(projectsDir, orgFolder);
        if (fs.statSync(orgPath).isDirectory()) {
          const trackFolders = fs.readdirSync(orgPath);
          trackFolders.forEach(trackFolder => {
            const trackPath = path.join(orgPath, trackFolder);
            if (fs.statSync(trackPath).isDirectory()) {
              const files = fs.readdirSync(trackPath);
              files.forEach(file => {
                if (file.toLowerCase() !== 'readme.txt' && !file.startsWith('.')) {
                  const ext = path.extname(file).toLowerCase();
                  const relPath = path.join('assets', 'projects', orgFolder, trackFolder, file);
                  
                  // Normalize track category name
                  let trackName = trackFolder;
                  if (trackFolder.toLowerCase().includes('video')) trackName = 'Video Cuts';
                  else if (trackFolder.toLowerCase().includes('ai')) trackName = 'AI Generated';
                  else if (trackFolder.toLowerCase().includes('graphic') || trackFolder.toLowerCase().includes('photo')) trackName = 'Graphic / Photo';

                  // 2A. If file is a text file with links/videos (.txt, .links, .urls)
                  if (['.txt', '.links', '.urls'].includes(ext)) {
                    try {
                      const fileContent = fs.readFileSync(path.join(trackPath, file), 'utf8');
                      const lines = fileContent.split('\n');
                      lines.forEach((line, lineIdx) => {
                        const trimmed = line.trim();
                        if (trimmed && !trimmed.startsWith('#')) {
                          const parts = trimmed.split('|').map(p => p.trim());
                          let title = '';
                          let linkUrl = '';
                          let desc = '';
                          let thumb = '';

                          if (parts.length >= 2) {
                            title = parts[0];
                            linkUrl = parts[1];
                            desc = parts[2] || `Project link from ${file} inside /assets/projects/${orgFolder}/${trackFolder}/`;
                            thumb = parts[3] || '';
                          } else if (parts[0].startsWith('http://') || parts[0].startsWith('https://')) {
                            linkUrl = parts[0];
                            title = `${orgFolder} Project Link #${lineIdx + 1}`;
                            desc = `Imported link from ${file}`;
                          }

                          if (linkUrl) {
                            const ytId = parseYouTubeId(linkUrl);
                            let finalVideoUrl = '';
                            let finalExternalUrl = linkUrl;
                            let finalThumb = thumb;

                            if (ytId) {
                              finalVideoUrl = `https://www.youtube.com/embed/${ytId}`;
                              if (!finalThumb) {
                                finalThumb = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
                              }
                            } else {
                              finalVideoUrl = linkUrl;
                              if (!finalThumb) {
                                finalThumb = 'assets/images/portfolio1.jpg.jpg';
                              }
                            }

                            // Check duplicate in projects array
                            const existingIndex = projects.findIndex(p => p.videoUrl === finalVideoUrl || (p.title === title && p.organization === orgFolder));
                            if (existingIndex === -1) {
                              projects.push({
                                id: `txt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                                organization: orgFolder,
                                track: trackName,
                                title: title || 'Project Link',
                                client: orgFolder,
                                description: desc,
                                thumbnail: finalThumb,
                                videoUrl: finalVideoUrl,
                                externalUrl: finalExternalUrl
                              });
                            }
                          }
                        }
                      });
                    } catch (txtErr) {
                      console.error(`Error reading text link file ${file}:`, txtErr);
                    }
                  } else {
                    // 2B. Standard media asset file (.jpg, .png, .mp4, etc.)
                    const existingIndex = projects.findIndex(p => p.thumbnail === relPath || p.videoUrl === relPath);
                    if (existingIndex === -1) {
                      const isVideo = ['.mp4', '.webm', '.mov', '.m4v'].includes(ext);
                      projects.push({
                        id: `fs-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                        organization: orgFolder,
                        track: trackName,
                        title: path.basename(file, ext).replace(/[-_]/g, ' '),
                        client: orgFolder,
                        description: `Dynamically loaded media asset from /assets/projects/${orgFolder}/${trackFolder}/`,
                        thumbnail: isVideo ? 'assets/images/portfolio1.jpg.jpg' : relPath,
                        videoUrl: isVideo ? relPath : '',
                        externalUrl: '#'
                      });
                    }
                  }
                }
              });
            }
          });
        }
      });
    }

    return res.json({ success: true, count: projects.length, projects });
  } catch (err) {
    console.error('Error scanning projects:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Contact endpoint simulation matching contact.php behavior
app.get('/contact.php', (req, res) => {
  res.json({ success: true, message: 'Contact endpoint is working' });
});

app.post('/contact.php', upload.none(), (req, res) => {
  const name = (req.body.name || '').trim();
  const email = (req.body.email || '').trim();
  const message = (req.body.message || '').trim();

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: 'Invalid email address.' });
  }

  console.log(`[Contact Form Submission] Name: ${name}, Email: ${email}, Message: ${message}`);

  return res.json({ success: true, message: 'Message sent successfully!' });
});

// Serve static assets from project root
app.use(express.static(__dirname));

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
