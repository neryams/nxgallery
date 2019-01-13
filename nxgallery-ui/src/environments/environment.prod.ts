import { defaultsDeep } from 'lodash/fp';

import { baseAppConfig } from './app.config.base';

export const environment = {
  production: true,
  hmr: false,
  hasStoreDevTools: false
};

export const appConfig: typeof baseAppConfig = defaultsDeep(baseAppConfig, {
  backend: {
    baseBrowserUrl: '.'
  }
});
