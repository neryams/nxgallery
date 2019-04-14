import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import * as uuidV4 from 'uuid/v4';
import { AlbumInfoOnly, IAlbumDocument, IImageDocument } from '~/../../shared';
import { ImagePosition, LoadingImage } from '~/app/shared/gallery/gallery.component';
import { InputFile } from '~/app/shared/image-upload/interfaces/input-file';
import { appConfig, environmentConfig } from '~/environments/environment';

import { ImageService } from '../../framework/images/image.service';
import { ConfigMenuDialogComponent, ConfigMenuResult } from '../config-menu/config-menu.component';


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
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('imageGrid') imageGrid: ElementRef;

  themeCss: string;
  allAlbums: Map<string, AlbumInfoOnly>;
  rootAlbum: AlbumInfoOnly;
  breadcrumb: Array<AlbumInfoOnly>;
  viewingAlbum: IAlbumDocument;

  uploadsInProgress: Array<UploadingImage>;
  images: Array<UploadedOrExistingImage>;
  checkChangesTimeout: number;

  domReady = false;

  constructor(
    public sanitizer: DomSanitizer,
    private readonly route: ActivatedRoute,
    private readonly imageService: ImageService, 
    private readonly ref: ChangeDetectorRef,
    private readonly dialog: MatDialog
  ) {
    this.uploadsInProgress = [];
    this.images = [];
  }

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      if (data.allAlbums !== undefined) {
        this.allAlbums = data.allAlbums;
        this.allAlbums.forEach(album => {
          if (typeof album.parent === 'undefined') {
            this.rootAlbum = album;
          }
        });
        
        if (!this.rootAlbum) {
          throw(new Error('root album not found'));
        }
  
        if (this.rootAlbum.settings.theme) {
          this.setTheme(this.rootAlbum.settings.theme);
        }
      }
  
      this.viewingAlbum = data.viewingAlbum || this.rootAlbum;
      
      this.breadcrumb = [this.viewingAlbum]; 
      // Iterate through the album tree until we reach the root album
      while (true) {
        const parentAlbum = this.allAlbums.get(this.breadcrumb[this.breadcrumb.length - 1].parent);
        if (!parentAlbum) {
          break;
        }
        this.breadcrumb.push(parentAlbum);
      }
      this.breadcrumb.reverse();

      if (this.domReady) {
        setTimeout(() => {
          this.images = this.viewingAlbum.images;
          this.ref.detectChanges();
        })
      }
    });
  }

  // Need to initialize images for packery after the dom is created to prevent craziness
  ngAfterViewInit(): void {
    this.domReady = true;
    this.images = this.viewingAlbum.images;
    this.ref.detectChanges();
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

        // We want to save the images without a gutter for consistency
        const column = Math.floor(newImageInfo.position.x / containerBoundingBox.width * appConfig.gallery.columns);
        const gutterFix = appConfig.gallery.gutter * column / appConfig.gallery.columns;

        const newImagePosition = {
          x: (newImageInfo.position.x - gutterFix) / containerBoundingBox.width,
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
      this.imageService.saveImagePositions(this.viewingAlbum._id, payload).subscribe((result: boolean) => {
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
  
  createAlbum(): void {
    this.imageService.createAlbum(this.viewingAlbum._id).subscribe((albumEntry) => {
      const fakeProgress = {
        uid: albumEntry._id,
        aspect: albumEntry.info.aspect,
        progress: new BehaviorSubject<number>(100),
        inputFile: undefined as InputFile
      };

      this.uploadsInProgress = [ ...this.uploadsInProgress, fakeProgress];
      setTimeout(() => {
        this.uploadsInProgress.splice(this.uploadsInProgress.findIndex(progress => progress === fakeProgress), 1);
        this.images.unshift(albumEntry);
        this.ref.detectChanges();
      }, 500);
      this.ref.detectChanges();
    });
  }

  saveImageInfo(image: UploadedOrExistingImage): void {
    this.imageService.saveImageInfo(this.viewingAlbum._id, image.dbId || image._id, {
      caption: image.info.caption
    }).subscribe(() => {
      // do nothing on success, no need
    }, (err) => {
      console.error(err);
    });
  }

  setImageAsPrimary(imageToRemove: UploadedOrExistingImage): void {
    this.imageService.setImageAsPrimary(this.viewingAlbum._id, imageToRemove.dbId || imageToRemove._id).subscribe(() => {
      // do nothing on success, no need
    }, (err) => {
      console.error(err);
    });
  }

  removeImage(imageToRemove: UploadedOrExistingImage): void {
    this.imageService.deleteImage(this.viewingAlbum._id, imageToRemove.dbId || imageToRemove._id).subscribe(() => {
      const i = this.images.findIndex(image => image._id === imageToRemove._id);
      this.images.splice(i, 1);
    }, (err) => {
      console.error(err);
    });
  }

  openAlbumConfigDialog(): void {
    const dialogRef = this.dialog.open<ConfigMenuDialogComponent, ConfigMenuResult, IAlbumDocument>(ConfigMenuDialogComponent, {
      data: {
        albumId: this.viewingAlbum._id,
        albumName: this.viewingAlbum.name,
        themeEnabled: false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        Object.assign(this.viewingAlbum, result);
        this.ref.detectChanges();
      }
    });
  }

  openConfigDialog(): void {
    const dialogRef = this.dialog.open<ConfigMenuDialogComponent, ConfigMenuResult, IAlbumDocument>(ConfigMenuDialogComponent, {
      data: {
        albumId: this.rootAlbum._id,
        albumName: this.rootAlbum.name,
        themeEnabled: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.rootAlbum = result;
        if (result.settings.theme) {
          this.setTheme(result.settings.theme);
        }
        this.ref.detectChanges();
      }
    });
  }

  private setTheme(themePath: string): void {
    this.themeCss = `${themePath}/${environmentConfig.THEME_STRUCTURE.MAIN_CSS}`;
  }

  private executeNextUpload(): void {
    const loader = this.uploadsInProgress[0];

    this.imageService.uploadImage(this.viewingAlbum._id, this.uploadsInProgress[0].inputFile.file).subscribe((result) => {
      if (typeof result === 'number') {
        loader.progress.next(result);
      } else {
        this.uploadsInProgress.shift();
        const dbId = result._id;
        this.images.unshift(result);
        this.images[0].dbId = dbId; 
        this.images[0]._id = loader.uid; // Maintain position of loaded image, just swap the info
        if (loader.newPosition !== undefined) {
          this.imageService.saveImagePositions(this.viewingAlbum._id, [{
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
