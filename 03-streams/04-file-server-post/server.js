const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

const MAX_FILE_SIZE = 1048576;

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'POST':
      if (pathname.includes('/')) {
        res.statusCode = 400;
        res.end('Bad request');
        break;
      }

      if (fs.existsSync(filepath)) {
        res.statusCode = 409;
        res.end('File already exists');
        break;
      }
      const limitSizeStreamTransform = new LimitSizeStream({limit: MAX_FILE_SIZE});
      const fileWriteStream = fs.createWriteStream(filepath);

      req.pipe(limitSizeStreamTransform).pipe(fileWriteStream);

      req.on('aborted', () => {
        fileWriteStream.destroy();
        fs.rmSync(filepath);
      });

      limitSizeStreamTransform.on('error', () => {
        fileWriteStream.destroy();
        fs.rmSync(filepath);
        res.statusCode = 413;
        res.end('File size too large');
      });

      fileWriteStream
          .on('error', () => {
            fileWriteStream.destroy();
            res.statusCode = 500;
            res.end('Internal server error');
          })
          .on('finish', () => {
            res.statusCode = 201;
            res.end('Created');
          });

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
