import { HttpClient, HttpEventType, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { AlbumInfoOnly, IAlbumDocument, IImageDocument } from './../../../../../shared';

@Injectable()
export class ImageService {
  albumCache: Map<string, AlbumInfoOnly>;
  constructor(private readonly http: HttpClient) {}

  getRootAlbum(perPage = 18): Observable<IAlbumDocument> {
    return this.http.get<IAlbumDocument>(`/api/image/root/${perPage}`);
  }

  getAllAlbumInfo(): Observable<Map<string, AlbumInfoOnly>> {
    if (this.albumCache) {
      return of(this.albumCache);
    }

    return this.http.get<Array<AlbumInfoOnly>>(`/api/image/albums`).pipe(
      map(result => {
        this.albumCache = new Map();
        result.forEach(album => this.albumCache.set(album._id, album));

        return this.albumCache;
      })
    );
  }

  getAlbum(albumId: string, perPage = 18): Observable<IAlbumDocument> {
    return this.http.get<IAlbumDocument>(`/api/image/album/${albumId}/${perPage}`);
  }

  // Returns the image document on the parent album so we can update the page
  createAlbum(parentAlbumId: string): Observable<IImageDocument> {
    return this.http.post<IImageDocument>(`/api/image/manage/newAlbum/${parentAlbumId}`, {});
  }

  getImages(albumId: string, page = 1, perPage = 18): Observable<Array<IImageDocument>> {
    return this.http
      .get<{ images: Array<IImageDocument> }>(`/api/image/album/${albumId}/${perPage},${page}`)
      .pipe(map(value => value.images));
  }

  getRootAlbumAll(): Observable<IAlbumDocument> {
    return this.http.get<IAlbumDocument>(`/api/image/manage/root`);
  }

  getAlbumAll(albumId: string): Observable<IAlbumDocument> {
    return this.http.get<IAlbumDocument>(`/api/image/manage/${albumId}`);
  }

  setImageAsPrimary(albumId: string, id: string): Observable<boolean> {
    return this.http.put<boolean>(`/api/image/manage/${albumId}/primary`, { imageId: id });
  }

  saveImagePositions(albumId: string, data: Array<{ _id: string; position: { x: number; y: number } }>): Observable<boolean> {
    return this.http.put<boolean>(`/api/image/manage/${albumId}/positions`, data);
  }

  saveImageInfo(albumId: string, id: string, data: { caption: string }): Observable<boolean> {
    return this.http.put<boolean>(`/api/image/manage/${albumId}/${id}/info`, data);
  }

  deleteImage(albumId: string, id: string): Observable<boolean> {
    return this.http.delete<boolean>(`/api/image/manage/${albumId}/${id}`);
  }

  /**
   * Uploads the given image file to the server and keeps track of the upload progress
   * @return Returns either the progress as a whole number between 0-100, or the saved image document on success
   * @method uploadImage
   */
  uploadImage(albumId: string, image: File): Observable<number | IImageDocument> {
    const apiUrl = `/api/image/manage/${albumId}/upload`;
    const formData = new FormData();
    formData.append('image', image, image.name);

    const req = new HttpRequest('POST', apiUrl, formData, {
      reportProgress: true
    });

    return this.http.request<IImageDocument>(req).pipe(
      map(event => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            // Compute and show the % done:
            return Math.round((event.loaded / event.total) * 100);

          case HttpEventType.Response:
            return event.body;

          default:
            return 0;
        }
      })
    );
  }
}
