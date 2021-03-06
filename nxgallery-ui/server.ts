// tslint:disable
import 'reflect-metadata';
import 'zone.js/dist/zone-node';

import { enableProdMode } from '@angular/core';
import { ngExpressEngine } from '@nguniversal/express-engine';
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';
import * as compression from 'compression';
import * as express from 'express';
import * as proxy from 'http-proxy-middleware';
import { join } from 'path';

import { environmentConfig } from './src/environments/environment';

enableProdMode();

const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('./server/main');

const server = express();
server.use(compression());

const PORT = process.env.PORT || environmentConfig.CLIENT_PORT || 4000;
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

server.use('/images', proxy({ target: `http://localhost:${environmentConfig.API_PORT}` }));
server.use('/api', proxy({ target: `http://localhost:${environmentConfig.API_PORT}` }));

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
