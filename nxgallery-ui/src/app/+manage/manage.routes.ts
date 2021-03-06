import { AuthGuard } from '@ngx-auth/core';

import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { ManageComponent } from './manage.component';

export const routes = [
  {
    path: '',
    component: ManageComponent,
    children: [
      {
        path: 'login',
        component: LoginComponent,
        data: {
          meta: {
            title: 'PUBLIC.LOGIN.NOTE',
            description: 'PUBLIC.SECURE.META_DESCRIPTION'
          }
        }
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard],
        data: {
          meta: {
            title: 'PUBLIC.SECURE.PAGE_TITLE',
            description: 'PUBLIC.SECURE.META_DESCRIPTION'
          }
        }
      }
    ]
  }
];
