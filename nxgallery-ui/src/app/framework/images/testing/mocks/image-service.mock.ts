import { Observable, of } from 'rxjs';
import { IImageDocument } from '~/../../shared/interfaces/imageData';

export class MockImageService {
  getImages(page = 1): Observable<Array<IImageDocument>> {
    return of([{
      _id: 'abcd1234',
      title: 'Mock Image',
      imageUrls: { '600': 'mock_url.jpg' },
      sortOrder: 0,
      uploaded: 67890,
      created: 12345,
      info: {
        aspect: 1.33333333,
        position: { x: 0, y: 0 }
      }
    }]);
  }

  getAllImages(): Observable<Array<IImageDocument>> {
    return this.getImages();
  }
  
  saveImagePositions(): void {
    return;
  }
  
  uploadImage(): void {
    return;
  }
}
