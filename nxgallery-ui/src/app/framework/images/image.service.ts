import { HttpClient, HttpEventType, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Album, IImageDocument, ImageData } from './../../../../../shared';

@Injectable()
export class ImageService {
  constructor(private readonly http: HttpClient) {}

  getRootAlbum(perPage = 18): Observable<Album> {
    return this.http.get<Album>(`/api/image/root/${perPage}`);
  }

  getAlbum(albumId: string, perPage = 18): Observable<Album> {
    return this.http.get<Album>(`/api/image/album/${albumId}/${perPage}`);
  }

  getImages(albumId: string, page = 1, perPage = 18): Observable<Array<IImageDocument>> {
    return this.http
      .get<{ images: Array<IImageDocument> }>(`/api/image/album/${albumId}/${perPage},${page}`)
      .pipe(map(value => value.images));
  }

  getRootAlbumAll(): Observable<Album> {
    return this.http.get<Album>(`/api/image/manage/root`);
  }

  getAlbumAll(albumId: string): Observable<Album> {
    return this.http.get<Album>(`/api/image/manage/${albumId}`);
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
