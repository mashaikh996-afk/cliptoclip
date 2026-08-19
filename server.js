// ASJADSCLIP
// Save this file as server.js
// Run with: node server.js
// Open on phone: http://localhost:3000
// Open from another device on the same Wi-Fi using your computer's IP address.

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = Number(process.env.PORT || 3000);
const clips = new Map();

const allowedExpirations = ['never', '10m', '1h', '24h', '7d', 'once'];
const nameRegex = /^[A-Za-z0-9._-]{1,80}$/;

function retentionSettings(expiration) {
  if (expiration === 'once') {
    return { expiresAt: null, burnAfterRead: true };
  }

  const durations = {
    '10m': 10 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
  };

  return {
    expiresAt: durations[expiration]
      ? new Date(Date.now() + durations[expiration]).toISOString()
      : null,
    burnAfterRead: false,
  };
}

function removeExpiredClips() {
  const now = Date.now();
  for (const [name, clip] of clips.entries()) {
    if (clip.expiresAt && new Date(clip.expiresAt).getTime() <= now) {
      clips.delete(name);
      console.log('expired:', name);
    }
  }
}

// Background cleanup every 60 seconds to avoid iterating on every request
setInterval(removeExpiredClips, 60 * 1000);

function securityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Content-Security-Policy': "default-src 'self' 'unsafe-inline' data:;",
  };
}

function sendJson(response, status, data) {
  const headers = Object.assign(
    {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
    },
    securityHeaders()
  );
  response.writeHead(status, headers);
  response.end(JSON.stringify(data));
}

function sendHtml(response, html) {
  const headers = Object.assign(
    {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
    securityHeaders()
  );
  response.writeHead(200, headers);
  response.end(html);
}

function sendStaticFile(response, filePath) {
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      sendJson(response, 404, { error: 'Not found.' });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const map = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.txt': 'text/plain; charset=utf-8',
    };

    const headers = Object.assign({ 'Cache-Control': 'no-store' }, securityHeaders());
    if (map[ext]) headers['Content-Type'] = map[ext];

    response.writeHead(200, headers);
    const stream = fs.createReadStream(filePath);
    stream.pipe(response);
    stream.on('error', () => sendJson(response, 500, { error: 'Internal server error.' }));
  });
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 120000) {
        reject(new Error('Request body is too large.'));
        request.destroy();
      }
    });
    request.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch {
        reject(new Error('Invalid JSON.'));
      }
    });
    request.on('error', reject);
  });
}

const PUBLIC_DIR = path.join(__dirname, 'public');
const INDEX_HTML = fs.readFileSync(path.join(PUBLIC_DIR, 'index.html'), 'utf8');

const server = http.createServer(async (request, response) => {
  try {
    // Quick inline expiration cleanup to keep memory use bounded between intervals
    removeExpiredClips();

    const requestUrl = new URL(request.url || '/', 'http://' + (request.headers.host || 'localhost'));
    const pathname = requestUrl.pathname;

    if (request.method === 'OPTIONS') {
      response.writeHead(204, Object.assign({ 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }, securityHeaders()));
      response.end();
      return;
    }

    // Serve static files (anything not under /api)
    if (request.method === 'GET' && !pathname.startsWith('/api')) {
      const relPath = pathname === '/' ? 'index.html' : decodeURIComponent(pathname.slice(1));
      const filePath = path.join(PUBLIC_DIR, relPath);
      // Prevent path traversal
      if (!filePath.startsWith(PUBLIC_DIR)) {
        sendJson(response, 400, { error: 'Bad request.' });
        return;
      }
      sendStaticFile(response, filePath);
      return;
    }

    if (request.method === 'POST' && pathname === '/api/clips') {
      let body;
      try {
        body = await readJson(request);
      } catch (error) {
        sendJson(response, 400, { error: error.message });
        return;
      }

      const name = typeof body.name === 'string' ? body.name.trim() : '';
      const code = typeof body.code === 'string' ? body.code : '';
      const language = typeof body.language === 'string' && body.language.trim() ? body.language.trim() : null;
      const expiration = typeof body.expiration === 'string' ? body.expiration : 'never';

      if (!name) {
        sendJson(response, 400, { error: 'Clip name is required.' });
        return;
      }

      if (!nameRegex.test(name)) {
        sendJson(response, 400, { error: 'Invalid clip name. Allowed: A-Z a-z 0-9 . _ - (1-80 chars).' });
        return;
      }

      if (name.length > 80) {
        sendJson(response, 400, { error: 'Clip name must be 80 characters or fewer.' });
        return;
      }

      if (!code || !code.trim()) {
        sendJson(response, 400, { error: 'Code is required.' });
        return;
      }

      if (code.length > 100000) {
        sendJson(response, 400, { error: 'Code must be 100,000 characters or fewer.' });
        return;
      }

      if (!allowedExpirations.includes(expiration)) {
        sendJson(response, 400, { error: 'Invalid expiration option.' });
        return;
      }

      const retention = retentionSettings(expiration);
      const now = new Date().toISOString();
      const clip = { id: String(Date.now()), name, code, language, expiresAt: retention.expiresAt, burnAfterRead: retention.burnAfterRead, createdAt: now, updatedAt: now };

      clips.set(name, clip);
      console.log('saved clip:', name);
      sendJson(response, 201, clip);
      return;
    }

    if (request.method === 'GET' && pathname.startsWith('/api/clips/')) {
      const encodedName = pathname.slice('/api/clips/'.length);
      const name = decodeURIComponent(encodedName);

      const clip = clips.get(name);
      if (!clip) {
        sendJson(response, 404, { error: 'No clip found with that name.' });
        return;
      }

      if (clip.expiresAt && new Date(clip.expiresAt).getTime() <= Date.now()) {
        clips.delete(name);
        sendJson(response, 404, { error: 'This clip has expired.' });
        return;
      }

      const responseClip = Object.assign({}, clip);
      if (clip.burnAfterRead) {
        clips.delete(name);
        console.log('burned after read:', name);
      }

      sendJson(response, 200, responseClip);
      return;
    }

    sendJson(response, 404, { error: 'Not found.' });
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { error: 'Internal server error.' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('cliptoclip running on port ' + PORT);
});
