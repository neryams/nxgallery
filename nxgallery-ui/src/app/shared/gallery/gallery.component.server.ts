import { AfterViewInit, Component, DoCheck, ElementRef, EventEmitter, Input, Output, ViewChild  } from '@angular/core';

import { IImageDocument } from './../../../../../shared/interfaces/imageData';

export interface LoadingImage {
  uid: string;
  aspect: number;
  preview?: string;
}

export interface ImagePosition {
  _id: string,
  position: { x: number, y: number }
}

export interface GalleryItem {
  url?: string,
  id: string,
  aspect: number,
  newItem: boolean
}

@Component({
  selector: 'nxg-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['../../../assets/sass/gallery.scss', './gallery.component.scss']
})
export class GalleryComponent implements AfterViewInit, DoCheck {
  @Input() images: Array<IImageDocument>;
  @Input() progress: Array<LoadingImage>;
  @Input() trackBy: (input: IImageDocument) => any;
  @ViewChild('grid') gridElem: ElementRef;

  @Output() readonly updatedImages = new EventEmitter();
  updatedImagesCollection: Map<string, ImagePosition>;
  outputDebounce: any;

  progressLength: number;
  imagesLength: number;

  currentImages: Array<GalleryItem>;
  gridInst: any;

  constructor() {
    this.updatedImagesCollection = new Map();
  }

  ngDoCheck(): void {
    if(this.imagesLength !== this.images.length || this.progressLength !== this.progress.length) {
      this.currentImages = this.images.map((imageData: IImageDocument) => ({
        url: imageData.imageUrls['600'],
        id: imageData._id,
        aspect: imageData.info.aspect,
        newItem: false
      }));
  
      if(this.progress) {
        const currentProgress: Array<LoadingImage> = this.progress;
        this.currentImages.unshift(...currentProgress.map((imageData: LoadingImage) => ({
          id: imageData.uid,
          aspect: imageData.aspect,
          newItem: true
        })).reverse())
      }
    }
  }

  ngAfterViewInit(): void {
    this.gridInst = new Packery(this.gridElem.nativeElement, {
      gutter: 10
    });

    this.gridInst.on('layoutComplete', ( laidOutItems: Array<any> ) => {
      let itemsChanged = false;
      laidOutItems.forEach((item: { position: ImagePosition['position'], element: HTMLElement }) => {
        this.updatedImagesCollection.set(item.element.id, {
          _id: item.element.id,
          position: { x: item.position.x, y: item.position.y } // Have to clone to prevent references updating on their own
        });
        itemsChanged = true;
      });

      if (itemsChanged) {
        if (this.outputDebounce) {
          clearTimeout(this.outputDebounce);
        }
        this.outputDebounce = setTimeout(() => {
          this.updatedImages.emit( Array.from(this.updatedImagesCollection.values()) );
          this.updatedImagesCollection.clear();
        }, 500);
      }
    })
  }

}

class Packery {
  constructor(private element: HTMLElement, options: any) {

  }
}
