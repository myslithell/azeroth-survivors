// Azeroth Survivors for macOS: the browser build of the game (wasm + WebGPU) in its own Electron
// app, so it runs on Chromium's WebGPU (fast, Metal underneath) with its own Dock icon and no
// installed browser. The game is served from the bundle (Contents/Resources/www) on
// http://127.0.0.1:47615, offline; rogue.js accepts 127.0.0.1 as the game's own page. The port is
// fixed because the saves live in that origin's localStorage (in ~/Library/Application Support/
// Azeroth Survivors).

const { app, BrowserWindow, dialog } = require('electron');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = 47615;
const WWW = path.join(process.resourcesPath, 'www');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.wasm': 'application/wasm',
};

// GET and HEAD of files under WWW. Game data never changes under one name (the page and the
// client are pinned by `?v=`), and boot.js relies on the HTTP cache: its prefetch warms the
// reads the client then makes.
const server = http.createServer((req, res) => {
  let name = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
  if (name === '/') name = '/index.html';
  const file = path.join(WWW, name);
  if (!file.startsWith(WWW + path.sep)) return res.writeHead(404).end();
  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) return res.writeHead(404).end();
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Content-Length': stat.size,
      'Cache-Control': name.startsWith('/data/') && name !== '/data/__index'
        ? 'max-age=31536000, immutable' : 'no-cache',
    });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  });
});

if (!app.requestSingleInstanceLock()) app.quit();

app.on('second-instance', () => {
  const win = BrowserWindow.getAllWindows()[0];
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on('window-all-closed', () => app.quit());

app.whenReady().then(() => {
  server.on('error', (err) => {
    dialog.showErrorBox('Azeroth Survivors', `Could not open 127.0.0.1:${PORT}: ${err.message}`);
    app.quit();
  });
  server.listen(PORT, '127.0.0.1', () => {
    const win = new BrowserWindow({
      width: 1600,
      height: 900,
      title: 'Azeroth Survivors',
      backgroundColor: '#000000',
    });
    win.loadURL(`http://127.0.0.1:${PORT}/`);
  });
});
