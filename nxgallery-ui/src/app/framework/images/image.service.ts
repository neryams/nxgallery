import { HttpClient, HttpEventType, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { IImageDocument, ImageData } from './../../../../../shared/interfaces/imageData';

@Injectable()
export class ImageService {
  constructor(private readonly http: HttpClient) {}

  getImages(page = 1): Observable<Array<IImageDocument>> {
    const perPage = 12;

    return this.http.get<{ images: Array<IImageDocument> }>(`/api/image/getBySort/${perPage},${page}`).pipe(map(value => value.images));
  }

  getAllImages(): Observable<Array<IImageDocument>> {
    return this.http.get<{ images: Array<IImageDocument> }>(`/api/image/getAll`).pipe(map(value => value.images));
  }

  saveImagePositions(data: Array<{ _id: string; position: { x: number; y: number } }>): Observable<boolean> {
    return this.http.put<boolean>(`/api/image/positions`, data);
  }

  saveImageInfo(id: string, data: { caption: string }): Observable<boolean> {
    return this.http.put<boolean>(`/api/image/${id}/info`, data);
  }

  /**
   * Uploads the given image file to the server and keeps track of the upload progress
   * @return Returns either the progress as a whole number between 0-100, or the saved image document on success
   * @method uploadImage
   */
  uploadImage(image: File): Observable<number | IImageDocument> {
    const apiUrl = '/api/image/upload';
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
