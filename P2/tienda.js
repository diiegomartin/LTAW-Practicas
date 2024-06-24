const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9090;

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.jpg': 'image/jpeg',
  '.png': 'image/png'
};

http.createServer((req, res) => {
  let filePath = '.' + req.url;
  if (filePath == './') {
    filePath = './index.html';
  }

  if (req.method === 'POST' && req.url === '/login') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const { nombre } = JSON.parse(body);
      fs.readFile('tienda.json', (err, data) => {
        if (err) throw err;
        const usuarios = JSON.parse(data).usuarios;
        const usuario = usuarios.find(user => user.nombre === nombre);
        if (usuario) {
          res.writeHead(200, { 'Content-Type': 'json' });
          res.end(JSON.stringify({ success: true, usuario }));
        } else {
          res.writeHead(401, { 'Content-Type': 'json' });
          res.end(JSON.stringify({ success: false, message: 'Usuario no encontrado' }));
        }
      });
    });
  } else {
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'octet-stream';

    fs.readFile(filePath, (error, content) => {
      if (error) {
        if (error.code == 'ENOENT') {
          fs.readFile('./error.html', (err, errorContent) => {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(errorContent, 'utf-8');
          });
        } else {
          res.writeHead(500);
          res.end(`Sorry, check with the site admin for error: ${error.code} ..\n`);
        }
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  }
}).listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
