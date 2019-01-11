import { NgModule } from '@angular/core';

import { ImageService } from '../image.service';

import { MockImageService } from './mocks/image-service.mock';

@NgModule({
  providers: [
    {
      provide: ImageService,
      useClass: MockImageService
    }
  ]
})
export class ImageFrameworkTestingModule {}
