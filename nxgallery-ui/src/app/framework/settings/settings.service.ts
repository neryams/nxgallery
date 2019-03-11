import { HttpClient, HttpEventType, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { IAlbumDocument } from './../../../../../shared';

@Injectable()
export class SettingsService {
  constructor(private readonly http: HttpClient) {}
  /**
   * Uploads the given image file to the server and keeps track of the upload progress
   * @return Returns either the progress as a whole number between 0-100, or the saved image document on success
   * @method uploadImage
   */
  updateAlbumSettings(album: Partial<IAlbumDocument>): Observable<IAlbumDocument> {
    return this.http.put<IAlbumDocument>(`/api/image/manage/${album._id}/info`, album);
  }

  uploadTheme(theme: File): Observable<number | IAlbumDocument> {
    const apiUrl = `/api/users/uploadTheme`;
    const formData = new FormData();
    formData.append('theme', theme, theme.name);

    const req = new HttpRequest('POST', apiUrl, formData, {
      reportProgress: true
    });

    return this.http.request<IAlbumDocument>(req).pipe(
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
