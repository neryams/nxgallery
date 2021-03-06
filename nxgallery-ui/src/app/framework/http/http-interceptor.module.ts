import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Injector, NgModule, PLATFORM_ID } from '@angular/core';
import { AuthService } from '@ngx-auth/core';

import { ApiInterceptor } from './api.interceptor';
import { BaseUrlInterceptor } from './base-url.interceptor';
import { UniversalInterceptor } from './universal.interceptor';

@NgModule({
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: UniversalInterceptor,
      deps: [Injector, PLATFORM_ID],
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: BaseUrlInterceptor,
      deps: [Injector, PLATFORM_ID],
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptor,
      deps: [AuthService],
      multi: true
    }
  ]
})
export class HttpInterceptorModule {}
