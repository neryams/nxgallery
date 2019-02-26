import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { SharedModule } from '../framework/core';
import { ImageFrameworkModule } from '../framework/images/image.module';
import { RootAlbumResolver } from '../framework/images/image.resolvers';

import { LandingComponent } from './landing.component';

const routes = [
  {
    path: '',
    component: LandingComponent,
    data: {
      meta: {
        title: 'DEFAULT_TITLE',
        description: 'DEFAULT_META_DESCRIPTION'
      }
    },
    resolve: {
      rootAlbum: RootAlbumResolver
    }
  }
];

@NgModule({
  declarations: [LandingComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    ImageFrameworkModule,
    InfiniteScrollModule
  ],
  providers: [
    RootAlbumResolver
  ]
})
export class LandingModule { }
