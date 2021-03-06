import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { AuthLoader, AuthModule, AuthStaticLoader } from '@ngx-auth/core';

import { authFactory } from '../auth.factory';

import { MockBackendInterceptor } from './mocks/backend-interceptor.mock';
import { MockJwtInterceptor } from './mocks/jwt-interceptor.mock';
import { MOCK_AUTH_PATH } from './tokens';

@NgModule({
  imports: [HttpClientModule],
  exports: [AuthModule],
  providers: [
    {
      provide: MOCK_AUTH_PATH,
      useValue: '/api/users/authenticate'
    },
    {
      provide: AuthLoader,
      useFactory: authFactory
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MockBackendInterceptor,
      deps: [MOCK_AUTH_PATH],
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MockJwtInterceptor,
      deps: [AuthLoader],
      multi: true
    }
  ]
})
export class AuthTestingModule {
  static withParams(
    configuredProvider = {
      provide: AuthLoader,
      useFactory: authFactory
    },
    path: string
  ): ModuleWithProviders {
    return {
      ngModule: AuthTestingModule,
      providers: [
        configuredProvider,
        {
          provide: MOCK_AUTH_PATH,
          useValue: path
        }
      ]
    };
  }
}
