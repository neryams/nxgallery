
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { SharedModule } from '../framework/core';
import { ImageFrameworkModule } from '../framework/images/image.module';
import { AlbumResolver, AllAlbumInfoResolver, RootAlbumResolver } from '../framework/images/image.resolvers';

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
      allAlbums: AllAlbumInfoResolver,
      viewingAlbum: RootAlbumResolver
    }
  },
  {
    path: 'album/:albumId',
    component: LandingComponent,
    data: {
      meta: {
        title: 'DEFAULT_TITLE',
        description: 'DEFAULT_META_DESCRIPTION'
      }
    },
    resolve: {
      allAlbums: AllAlbumInfoResolver,
      viewingAlbum: AlbumResolver
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
    InfiniteScrollModule,
    FontAwesomeModule
  ],
  providers: [
    AllAlbumInfoResolver,
    RootAlbumResolver,
    AlbumResolver
  ]
})
export class LandingModule { }
