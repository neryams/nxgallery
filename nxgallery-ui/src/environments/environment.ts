// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
import { defaultsDeep } from 'lodash/fp';

import { baseAppConfig } from './app.config.base';

export const environment = {
  production: false,
  hmr: false,
  hasStoreDevTools: false
};

export const appConfig: typeof baseAppConfig = defaultsDeep(baseAppConfig, {});

/**
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
