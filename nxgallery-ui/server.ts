// tslint:disable
import 'reflect-metadata';
import 'zone.js/dist/zone-node';

import { enableProdMode } from '@angular/core';
import { ngExpressEngine } from '@nguniversal/express-engine';
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';
import * as compression from 'compression';
import * as express from 'express';
import * as http from 'http';
import { join } from 'path';

import { CLIENT_PORT, API_PORT } from './../config/env';

enableProdMode();

const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('./server/main');

const server = express();
server.use(compression());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || CLIENT_PORT || 4000;
const DIST_FOLDER = join(__dirname, '..');

server.engine(
  'html',
  ngExpressEngine({
    bootstrap: AppServerModuleNgFactory,
    providers: [provideModuleMap(LAZY_MODULE_MAP)]
  })
);

server.set('view engine', 'html');
server.set('views', join(DIST_FOLDER, 'browser'));

server.use('/api/', (req, res) => {
  const options = {
    port: API_PORT,
    path: '/api' + req.url,
    method: req.method,
    headers: req.headers
  };

  const proxyReq = http.request(options, function(resp) {
    // set encoding and header
    resp.setEncoding('utf8');
    res.writeHead(resp.statusCode);

    // wait for data
    resp.on('data', function(chunk) {
      res.write(chunk);
    });

    resp.on('close', function() {
      res.end();
    });

    resp.on('end', function() {
      res.end();
    });
  });

  proxyReq.on('error', function(e) {
    console.log(e.message);
    res.writeHead(500);
    res.end();
  });

  if (options.method === 'POST') {
    proxyReq.write(JSON.stringify(req.body));
  }
  proxyReq.end();
});

server.use('/', express.static(join(DIST_FOLDER, 'browser'), { index: false }));

server.get('*', (req, res) => {
  res.render(join(DIST_FOLDER, 'browser', 'index.html'), {
    req,
    res
  });
});

server.set('port', PORT);

server.listen(server.get('port'), () => {
  // tslint:disable-next-line
  console.log(`Express server listening on PORT:${PORT}`);
});
