import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import * as uuidV4 from 'uuid/v4';
import { ImagePosition, LoadingImage } from '~/app/shared/gallery/gallery.component';

import { ImageService } from '../../framework/images/image.service';
import { InputFile } from '../../shared/image-upload/interfaces/input-file';

import { IImageDocument } from './../../../../../shared/interfaces/imageData';

export interface UploadProgress extends LoadingImage {
  inputFile: InputFile;
  newPosition?: { x: number, y: number };
}

@Component({
  selector: 'nxg-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  uploadsInProgress: Array<UploadProgress>;
  images: Array<IImageDocument & { dbId?: string }>;
  checkChangesTimeout: number;

  constructor(private readonly imageService: ImageService, private readonly ref: ChangeDetectorRef) {
    this.uploadsInProgress = [];
    this.images = [];
  }

  ngOnInit(): void {
    this.imageService.getAllImages().subscribe(images => {
      this.images = images;
      this.ref.detectChanges();
    })
  }

  upload(inputFile: InputFile): void {
    const fr = new FileReader;

    // fr.onload = () => { // file is loaded
    //   Jimp.read(fr.result as Buffer).then((preview: Jimp) => {
    //     if(this.uploadsInProgress.length === 0) {
    //       this.executeNextUpload();
    //     }
    //     const aspect = preview.bitmap.width / preview.bitmap.height;
    //     this.uploadsInProgress.push({
    //       aspect,
    //       inputFile,
    //       // preview: previewResult
    //     });
    //     // preview.resize(300, Jimp.AUTO);
    //     // preview.getBase64Async(Jimp.MIME_JPEG).then((previewResult) => {
    //     //   this.uploadsInProgress.push({
    //     //     aspect,
    //     //     inputFile,
    //     //     preview: previewResult
    //     //   });
    //     // });
    //   });
    // };

    fr.onload = () => { // file is loaded
        const img = new Image;
        img.onload = () => {
          const aspect = img.width / img.height;
          this.uploadsInProgress = this.uploadsInProgress.concat([{
            uid: uuidV4(),
            aspect,
            inputFile
          }]);

          if(this.uploadsInProgress.length === 1) {
            this.executeNextUpload();
          }

          this.ref.detectChanges();
        };
        img.src = fr.result as string; // is the data URL because called with readAsDataURL
    };

    fr.readAsDataURL(inputFile.file);
  }

  saveImagePositions(imagePositions: Array<ImagePosition>): void {
    // Collect all the updated images and save the new positions to the databse
    const payload = imagePositions
      .map(newImageInfo => {
        let imagePayload: ImagePosition;
        const savedImage = this.images.find(image => image._id === newImageInfo._id);
        if (savedImage && 
          (!savedImage.info.position || savedImage.info.position.x !== newImageInfo.position.x ||
          savedImage.info.position.y !== newImageInfo.position.y)
        ) {
          imagePayload = {
            _id: savedImage.dbId || savedImage._id,
            position: newImageInfo.position
          };

          // Also update the saved image position so we don't re-update
          savedImage.info.position = newImageInfo.position;
        } else {
          return undefined;
        }

        return imagePayload;
      })
      .filter(image => image !== undefined);

    if (payload.length > 0) {
      this.imageService.saveImagePositions(payload).subscribe((result: boolean) => {
        // do nothing
      });
    }

    // Collect all the updated images that are *not* in the database yet
    // and set them aside so we can update them after the images are saved.
    imagePositions
      .forEach(newImageInfo => {
        const unsavedImage = this.uploadsInProgress.find(image => image.uid === newImageInfo._id)
        if(unsavedImage) {
          unsavedImage.newPosition = newImageInfo.position;
        }
      })
  }

  private executeNextUpload(): void {
    this.imageService.uploadImage(this.uploadsInProgress[0].inputFile.file).subscribe((result) => {
      const loader = this.uploadsInProgress.shift();
      const dbId = result._id;
      this.images.unshift(result);
      this.images[0].dbId = dbId; 
      this.images[0]._id = loader.uid; // Maintain position of loaded image, just swap the info
      if (loader.newPosition !== undefined) {
        this.imageService.saveImagePositions([{
          _id: dbId,
          position: loader.newPosition
        }]).subscribe();
      }

      this.ref.detectChanges();

      if(this.uploadsInProgress.length > 0) {
        this.executeNextUpload();
      }
    });
  }

}
