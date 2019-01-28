import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ConfigService } from '@ngx-config/core';
import { configureTestSuite } from 'ng-bullet';
import { AuthTestingModule } from '~/app/framework/auth/testing';
import { CoreTestingModule } from '~/app/framework/core/testing';
import { t } from '~/app/framework/testing';

import { RouterTestingModule } from './../router/testing/router-testing.module';
import { ApiInterceptor } from './api.interceptor';
import { MockService } from './testing';

configureTestSuite(() => {
  TestBed.configureTestingModule({
    imports: [HttpClientTestingModule, CoreTestingModule.withOptions(), RouterTestingModule.withRoutes([]), AuthTestingModule],
    providers: [
      {
        provide: MockService,
        useFactory: (config: ConfigService, http: HttpClient) => new MockService(config, http, 'backend.test.remote'),
        deps: [ConfigService, HttpClient]
      },
      ApiInterceptor,
      {
        provide: HTTP_INTERCEPTORS,
        useClass: ApiInterceptor,
        multi: true
      }
    ]
  });
});

t.describe('ApiInterceptor', () => {
  t.it(
    'should build without a problem',
    t.inject([ApiInterceptor], (interceptor: ApiInterceptor) => {
      t.e(interceptor).toBeTruthy();
    })
  );
});
