import { Injectable } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { from, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Album } from '~/../../shared';

import { ImageService } from './image.service';

@Injectable()
export class RootAlbumResolver implements Resolve<Observable<Album>> {
  constructor(private readonly imageService: ImageService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<Album> {
    return this.imageService.getRootAlbum();
  }
}

@Injectable()
export class RootAlbumAllResolver implements Resolve<Observable<Album>> {
  constructor(private readonly imageService: ImageService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<Album> {
    return this.imageService.getRootAlbumAll();
  }
}
