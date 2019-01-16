// tslint:disable-next-line
import environmentConfig from '../../../config/default';

import { appConfig } from './environment.default';

export const environment = {
  production: false,
  hmr: true,
  hasStoreDevTools: false
};

export { appConfig, environmentConfig };
