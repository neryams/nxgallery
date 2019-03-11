import { Observable, of } from 'rxjs';
import { IAlbumDocument, IImageDocument } from '~/../../shared/interfaces/imageData';

export const MOCK_ALBUM = {
  _id: 'mock',
  name: 'Mock Album',
  user: 'mock_user',
  images: [
    {
      info: {
        aspect: 0.666666666666667,
        position: {
          x: 0,
          y: 0
        }
      },
      tags: [],
      _id: '5c7c4fb7f7dab61a3b41d94c',
      title: '77461ccd66650a5e7f459c01fe6f1c5e.jpg',
      imageUrls: {
        '300': '',
        '600': '',
        '1200': ''
      },
      uploaded: 123,
      created: undefined,
      sortOrder: 5
    }
  ] as Array<IImageDocument>,
  settings: {
    theme: ''
  }
};

export class MockSettingsService {
  updateAlbumSettings(album: Partial<IAlbumDocument>): Observable<IAlbumDocument> {
    const result = { ...MOCK_ALBUM, ...album };

    return of(result);
  }

  uploadTheme(theme: File): Observable<number | IAlbumDocument> {
    const result = { ...MOCK_ALBUM };
    result.settings.theme = theme.name;

    return of(result);
  }
}
