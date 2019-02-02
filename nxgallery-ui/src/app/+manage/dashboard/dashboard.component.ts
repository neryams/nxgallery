import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as uuidV4 from 'uuid/v4';
import { ImagePosition, LoadingImage } from '~/app/shared/gallery/gallery.component';

import { ImageService } from '../../framework/images/image.service';
import { InputFile } from '../../shared/image-upload/interfaces/input-file';

import { IImageDocument } from './../../../../../shared/interfaces/imageData';

export interface UploadingImage extends LoadingImage {
  inputFile: InputFile;
  progress: BehaviorSubject<number>;
  newPosition?: { x: number, y: number };
}

interface UploadedOrExistingImage extends IImageDocument {
  dbId?: string
}

@Component({
  selector: 'nxg-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  @ViewChild('imageGrid') imageGrid: ElementRef;

  uploadsInProgress: Array<UploadingImage>;
  images: Array<UploadedOrExistingImage>;
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

    fr.onload = () => { // file is loaded
        const img = new Image;
        img.onload = () => {
          const aspect = img.width / img.height;
          const progress = new BehaviorSubject<number>(-1);
          this.uploadsInProgress = [ ...this.uploadsInProgress, {
            uid: uuidV4(),
            aspect,
            progress,
            inputFile
          }];

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
    const containerBoundingBox = this.imageGrid.nativeElement.getBoundingClientRect();
    // Collect all the updated images and save the new positions to the databse
    const payload = imagePositions
      .map<ImagePosition>((newImageInfo: ImagePosition) => {
        const savedImage = this.images.find(image => image._id === newImageInfo._id);
        // Store x/y position as ratio of width so we can scale the image positions programattically
        // and responsively for smaller screens
        const newImagePosition = {
          x: newImageInfo.position.x / containerBoundingBox.width,
          y: newImageInfo.position.y / containerBoundingBox.width
        }
        
        if (savedImage &&
          (!savedImage.info.position ||
            savedImage.sortOrder !== newImageInfo.sortOrder ||
            savedImage.info.position.x !== newImagePosition.x ||
            savedImage.info.position.y !== newImagePosition.y
          )
        ) {
          // Also update the saved image position so we don't re-update
          savedImage.info.position = newImagePosition;

          return {
            _id: savedImage.dbId || savedImage._id,
            sortOrder: newImageInfo.sortOrder,
            position: newImagePosition
          };
        } else {
          return undefined;
        }
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

  saveImageInfo(image: UploadedOrExistingImage): void {
    this.imageService.saveImageInfo(image.dbId || image._id, {
      caption: image.info.caption
    }).subscribe(() => {
      // do nothing on success, no need
    }, (err) => {
      console.error(err);
    });
  }

  private executeNextUpload(): void {
    const loader = this.uploadsInProgress[0];

    this.imageService.uploadImage(this.uploadsInProgress[0].inputFile.file).subscribe((result) => {
      if (typeof result === 'number') {
        loader.progress.next(result);
      } else {
        this.uploadsInProgress.shift();
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
      }
    });
  }

}
