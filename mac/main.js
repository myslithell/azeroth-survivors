// Azeroth Survivors for macOS: the browser build of the game (wasm + WebGPU) in its own Electron
// app, so it runs on Chromium's WebGPU (fast, Metal underneath) with its own Dock icon and no
// installed browser. The game is served from the bundle (Contents/Resources/www) on
// http://127.0.0.1:47615, offline; rogue.js accepts 127.0.0.1 as the game's own page. The port is
// fixed because the saves live in that origin's localStorage (in ~/Library/Application Support/
// Azeroth Survivors).
//
// Updates: on launch the app asks wow.aethus.pl for its build stamp (index.html's `?v=`). A new
// build is downloaded in the background into userData/updates: the page files into
// updates/<stamp>/, the data files the app does not have yet into updates/shared/data/ (a data
// file never changes under one name, so only new names are fetched). When it is complete,
// updates/current names it and the player is asked to restart. The bundled build stays the
// fallback: no network, a site change or a failed download leave the game as it is.

const { app, BrowserWindow, dialog, net } = require('electron');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = 47615;
const HOME = 'https://wow.aethus.pl/';
const BUNDLE = path.join(process.resourcesPath, 'www');
const UPDATES = path.join(app.getPath('userData'), 'updates');
const SHARED = path.join(UPDATES, 'shared');
const CURRENT = path.join(UPDATES, 'current');
const LOG = path.join(app.getPath('userData'), 'update.log');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.wasm': 'application/wasm',
};

function log(...parts) {
  fs.mkdirSync(path.dirname(LOG), { recursive: true });
  fs.appendFileSync(LOG, `${new Date().toISOString()} ${parts.join(' ')}\n`);
}

/// The build stamp of an index.html (`rogue.js?v=<stamp>`), or null.
function stampOf(html) {
  return html.match(/\?v=([0-9a-f]+)/)?.[1] ?? null;
}

/// The installed update's page folder, or the bundle when there is none (or it is incomplete).
function activePageDir() {
  const stamp = fs.existsSync(CURRENT) ? fs.readFileSync(CURRENT, 'utf8').trim() : '';
  const dir = path.join(UPDATES, stamp);
  return stamp && fs.existsSync(path.join(dir, 'index.html')) ? dir : BUNDLE;
}

const PAGE = activePageDir();
// A file is looked up in the active page folder, then the downloaded data, then the bundle.
const ROOTS = PAGE === BUNDLE ? [BUNDLE] : [PAGE, SHARED, BUNDLE];

// GET and HEAD of files under ROOTS. Game data never changes under one name (the page and the
// client are pinned by `?v=`), and boot.js relies on the HTTP cache: its prefetch warms the
// reads the client then makes.
const server = http.createServer((req, res) => {
  let name = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
  if (name === '/') name = '/index.html';
  const file = ROOTS.map((root) => path.join(root, name))
    .find((f, i) => f.startsWith(ROOTS[i] + path.sep) && fs.statSync(f, { throwIfNoEntry: false })?.isFile());
  if (!file) return res.writeHead(404).end();
  res.writeHead(200, {
    'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
    'Content-Length': fs.statSync(file).size,
    'Cache-Control': name.startsWith('/data/') && name !== '/data/__index'
      ? 'max-age=31536000, immutable' : 'no-cache',
  });
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(file).pipe(res);
});

/// The site's bytes for a path under HOME, or null on 404. Any other failure throws.
async function download(rel, stamp) {
  const res = await net.fetch(`${HOME}${rel}?v=${stamp}`, { signal: AbortSignal.timeout(600000) });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${rel}: HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/// Write `body` to `file` inside `root`, through a temporary name so a cut download leaves nothing.
function save(root, rel, body) {
  const file = path.join(root, rel);
  if (!file.startsWith(root + path.sep)) throw new Error(`refusing path outside ${root}: ${rel}`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file + '.part', body);
  fs.renameSync(file + '.part', file);
}

/// Download the build `stamp` into updates/<stamp>; true when it is complete.
async function fetchBuild(stamp, html) {
  const staging = path.join(UPDATES, `${stamp}.partial`);
  fs.rmSync(staging, { recursive: true, force: true });
  // Cloudflare injects its analytics beacon into the page for a browser: the app stays offline.
  save(staging, 'index.html', Buffer.from(html.replace(/<script[^>]*\ssrc="https?:\/\/[^>]*><\/script>\s*/g, '')));

  // The page files: everything index.html and the scripts it loads name as ./<file>.
  const queue = ['index.html'];
  const seen = new Set(queue);
  while (queue.length) {
    const text = fs.readFileSync(path.join(staging, queue.shift()), 'utf8');
    for (const [, rel] of text.matchAll(/\.\/([\w\-/.]+\.(?:json|js|css|wasm))(?![\w])/g)) {
      if (seen.has(rel)) continue;
      seen.add(rel);
      const body = await download(rel, stamp);
      // wenilla.js names its wasm-bindgen import namespace "./wenilla_bg.js", which is no file.
      if (!body) {
        log('not on the site, skipped:', rel);
        continue;
      }
      save(staging, rel, body);
      if (/\.(js|css|html)$/.test(rel)) queue.push(rel);
    }
  }
  if (!fs.existsSync(path.join(staging, 'wenilla_bg.wasm'))) throw new Error('the build has no wenilla_bg.wasm');

  // The data: only names neither the bundle nor an earlier update has.
  const indexBody = await download('data/__index', stamp);
  if (!indexBody) throw new Error('the build has no data/__index');
  save(staging, 'data/__index', indexBody);
  const missing = JSON.parse(indexBody.toString('utf8'))
    .map((name) => 'data/' + name.toLowerCase().split(/[\\/]/).filter(Boolean).join('/'))
    .filter((rel) => ![SHARED, BUNDLE].some((root) => fs.existsSync(path.join(root, rel))));
  log(`build ${stamp}: ${seen.size} page files, ${missing.length} new data files`);
  const workers = Array.from({ length: 6 }, async () => {
    for (let rel; (rel = missing.shift()) !== undefined;) {
      const url = rel.split('/').map(encodeURIComponent).join('/');
      const body = await download(url, stamp);
      if (body) save(SHARED, rel, body);
      else log('data file not on the site, skipped:', rel);
    }
  });
  await Promise.all(workers);

  const final = path.join(UPDATES, stamp);
  fs.rmSync(final, { recursive: true, force: true });
  fs.renameSync(staging, final);
  fs.writeFileSync(CURRENT, stamp);
  return true;
}

/// Check the site for a newer build; download it and offer a restart. Never stops the game.
async function checkForUpdate(win) {
  // Page folders other than the active one are old builds or interrupted downloads.
  for (const entry of fs.existsSync(UPDATES) ? fs.readdirSync(UPDATES) : []) {
    const dir = path.join(UPDATES, entry);
    if (entry !== 'shared' && dir !== PAGE && fs.statSync(dir).isDirectory()) fs.rmSync(dir, { recursive: true, force: true });
  }
  const running = stampOf(fs.readFileSync(path.join(PAGE, 'index.html'), 'utf8'));
  const res = await net.fetch(HOME, { cache: 'no-store', signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`${HOME}: HTTP ${res.status}`);
  const html = await res.text();
  const stamp = stampOf(html);
  if (!stamp) throw new Error(`${HOME} has no build stamp; the site changed`);
  if (stamp === running) return log(`up to date (${running})`);
  log(`update ${running} -> ${stamp}: downloading`);
  await fetchBuild(stamp, html);
  log(`update ${stamp}: ready`);
  if (win.isDestroyed()) return;
  const ru = app.getLocale().startsWith('ru');
  const { response } = await dialog.showMessageBox(win, {
    type: 'info',
    message: ru ? 'Загружена новая версия Azeroth Survivors' : 'A new version of Azeroth Survivors is ready',
    detail: ru ? 'Перезапустить игру сейчас? Если нет, новая версия включится при следующем запуске.'
      : 'Restart the game now? Otherwise the new version starts next time.',
    buttons: ru ? ['Перезапустить', 'Позже'] : ['Restart', 'Later'],
    defaultId: 0,
    cancelId: 1,
  });
  if (response === 0) {
    app.relaunch();
    app.exit(0);
  }
}

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
    log(`start: serving ${PAGE === BUNDLE ? 'the bundled build' : PAGE}`);
    checkForUpdate(win).catch((err) => log('update failed:', err.stack || err));
  });
});
