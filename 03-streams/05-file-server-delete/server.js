const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'DELETE':
      if (pathname.includes('/')) {
        res.statusCode = 400;
        res.end('Bad request');
        break;
      }

      try {
        fs.rmSync(filepath);
        res.statusCode = 200;
        res.end();
      } catch (error) {
        if (error && error.code === 'ENOENT') {
          res.statusCode = 404;
          res.end('File not found');
        }
      }

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
