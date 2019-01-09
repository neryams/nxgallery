import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { IImageDocument, ImageData } from './../../../../../shared/interfaces/imageData';

@Injectable()
export class ImageService {
  constructor(private readonly http: HttpClient) {
  }

  getImages(page = 1): Observable<Array<IImageDocument>> {
    const perPage = 12;

    return this.http.get<{ images: Array<IImageDocument> }>(`/api/image/getBySort/${perPage},${page}`).pipe(
      map(value => value.images)
    );
  }

  getAllImages(): Observable<Array<IImageDocument>> {
    return this.http.get<{ images: Array<IImageDocument> }>(`/api/image/getAll`).pipe(
      map(value => value.images)
    );
  }

  saveImagePositions(data: Array<{ _id: string, position: { x: number, y: number } }>): Observable<boolean> {
    return this.http.post<boolean>(`/api/image/updatePositions`, data);
  }

  uploadImage(file: File): Observable<IImageDocument> {
    const apiUrl = '/api/image/upload';
    const formData = new FormData();
    formData.append('image', file, file.name);

    return this.http.post<IImageDocument>(apiUrl, formData).pipe(map(value => value));
  }

}