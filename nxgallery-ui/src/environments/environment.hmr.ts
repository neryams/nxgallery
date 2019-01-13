import { defaultsDeep } from 'lodash/fp';

import { baseAppConfig } from './app.config.base';

export const environment = {
  production: false,
  hmr: true,
  hasStoreDevTools: false
};

export const appConfig: typeof baseAppConfig = defaultsDeep(baseAppConfig, {});
