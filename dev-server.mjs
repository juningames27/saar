// Servidor local de desenvolvimento do SAAR
// Como usar:  node dev-server.mjs   (depois abra http://localhost:5500/Login.html)
//
// O que ele faz:
// - Serve a pasta Front
// - Faz proxy de /api e /ping para o backend no Render
// => o navegador só fala com localhost (mesma origem) => sem erro de CORS
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ    = path.dirname(fileURLToPath(import.meta.url));
const FRONT   = path.join(RAIZ, 'Front');
const BACKEND = 'https://saar-ryqd.onrender.com';
const PORT    = 5500;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.json': 'application/json',
  '.ico':  'image/x-icon',
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = decodeURIComponent(url.pathname);

  // 1) Proxy das chamadas de API para o Render (lado servidor => sem CORS)
  if (pathname.startsWith('/api/') || pathname === '/ping') {
    try {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const body = Buffer.concat(chunks);

      const headers = {};
      if (req.headers['content-type'])  headers['content-type']  = req.headers['content-type'];
      if (req.headers['authorization']) headers['authorization'] = req.headers['authorization'];

      const upstream = await fetch(BACKEND + pathname + url.search, {
        method: req.method,
        headers,
        body: ['GET', 'HEAD'].includes(req.method) ? undefined : body,
      });

      const buf = Buffer.from(await upstream.arrayBuffer());
      res.writeHead(upstream.status, {
        'content-type': upstream.headers.get('content-type') || 'application/json',
      });
      res.end(buf);
    } catch (e) {
      res.writeHead(502, { 'content-type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ erro: 'Proxy falhou: ' + e.message }));
    }
    return;
  }

  // 2) config.js: força a API a ser a própria origem local (localhost:PORT).
  //    Não pode ser "" porque string vazia é "falsy" e o api.js cairia no
  //    fallback http://localhost:3000. Usar a origem atual mantém same-origin.
  if (pathname === '/config.js') {
    res.writeHead(200, { 'content-type': MIME['.js'] });
    res.end(`window.SAAR_API = "http://localhost:${PORT}";`);
    return;
  }

  // 3) Arquivos estáticos da pasta Front
  if (pathname === '/') pathname = '/Login.html';
  const filePath = path.join(FRONT, pathname);
  if (!filePath.startsWith(path.resolve(FRONT))) {
    res.writeHead(403); res.end('Proibido'); return;
  }
  try {
    const data = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'content-type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Nao encontrado: ' + pathname);
  }
});

server.listen(PORT, () => {
  console.log(`\n  SAAR local rodando em:  http://localhost:${PORT}/Login.html`);
  console.log(`  Proxy de /api  ->  ${BACKEND}`);
  console.log(`  (Para parar: Ctrl + C)\n`);
});
