import { isPlatformServer } from '@angular/common';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CLIENT_PORT } from './../../../../../config/env';
import { getCurrentToken, LOGIN_URL } from './../auth/auth.factory';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  constructor(@Inject(PLATFORM_ID) private readonly platformId: any) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url === LOGIN_URL && req.method === 'POST') {
      const updatedRequest = req.clone({
        setHeaders: {
          'Content-Type': 'application/json'
        }
      });

      return next.handle(updatedRequest).pipe(
        map(event => {
          if (event instanceof HttpResponse) {
            return event.clone({ body: event.body });
          }
        })
      ) as any;
    } else if (req.url.startsWith('/api')) {
      const token = getCurrentToken();
      const updatedRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      return next.handle(updatedRequest);
    } else {
      return next.handle(req);
    }
  }
}
