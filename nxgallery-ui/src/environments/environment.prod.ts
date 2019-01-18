// tslint:disable-next-line
import { defaultConfig, prodConfig } from '../../../config';

import { appConfig } from './environment.default';

const environmentConfig = { ...defaultConfig, ...prodConfig };

appConfig.backend.baseServerUrl = `http://localhost:${environmentConfig.CLIENT_PORT}`;
appConfig.backend.baseBrowserUrl = '.';

export const environment = {
  production: true,
  hmr: false,
  hasStoreDevTools: false
};

export { appConfig, environmentConfig };
