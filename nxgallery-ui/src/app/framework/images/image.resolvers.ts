import { Injectable } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { from, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AlbumInfoOnly, IAlbumDocument } from '~/../../shared';

import { ImageService } from './image.service';

@Injectable()
export class RootAlbumResolver implements Resolve<Observable<IAlbumDocument>> {
  constructor(private readonly imageService: ImageService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IAlbumDocument> {
    return this.imageService.getRootAlbum();
  }
}

@Injectable()
export class RootAlbumAllResolver implements Resolve<Observable<IAlbumDocument>> {
  constructor(private readonly imageService: ImageService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IAlbumDocument> {
    return this.imageService.getRootAlbumAll();
  }
}

@Injectable()
export class AlbumResolver implements Resolve<Observable<IAlbumDocument>> {
  constructor(private readonly imageService: ImageService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IAlbumDocument> {
    const albumId = route.paramMap.get('albumId');

    return this.imageService.getAlbum(albumId);
  }
}

@Injectable()
export class AlbumAllResolver implements Resolve<Observable<IAlbumDocument>> {
  constructor(private readonly imageService: ImageService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IAlbumDocument> {
    const albumId = route.paramMap.get('albumId');

    return this.imageService.getAlbumAll(albumId);
  }
}

@Injectable()
export class AllAlbumInfoResolver implements Resolve<Observable<Map<string, AlbumInfoOnly>>> {
  constructor(private readonly imageService: ImageService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<Map<string, AlbumInfoOnly>> {
    return this.imageService.getAllAlbumInfo();
  }
}
