import { AfterViewInit, Component, DoCheck, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import * as Packery from 'packery';
import { Observable, Subject } from 'rxjs';
import { debounceTime, map, tap } from 'rxjs/operators';

import { IImageDocument } from './../../../../../shared/interfaces/imageData';

export interface LoadingImage {
  uid: string;
  aspect: number;
  progress: Observable<number>;
  preview?: string;
}

export interface ImagePosition {
  _id: string;
  sortOrder: number;
  position: { x: number; y: number };
}

export interface GalleryItem {
  url?: string;
  id: string;
  aspect: number;
  newItem: boolean;
  progress?: Observable<number>;
}

// The packery types definition is messed up (types for old version) so we just define the real properties we use here
interface PackeryItemMock {
  position: ImagePosition['position'];
  element: HTMLElement;
}

@Component({
  selector: 'nxg-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements AfterViewInit, DoCheck {
  @Input() images: Array<IImageDocument>;
  @Input() progress: Array<LoadingImage>;
  @Input() trackBy: (input: IImageDocument) => any;
  @ViewChild('grid') gridElem: ElementRef;

  @Output() readonly updatedImages = new EventEmitter();
  updatedImagesCollection: Map<string, ImagePosition>;
  imagesChangedSubject = new Subject<Array<ImagePosition>>();

  progressLength: number;
  imagesLength: number;
  currentImages: Array<GalleryItem>;
  gridInst: any;

  constructor() {
    this.updatedImagesCollection = new Map();

    this.imagesChangedSubject
      .pipe(
        tap(imagePositions => imagePositions.forEach(imagePosition => this.updatedImagesCollection.set(imagePosition._id, imagePosition))),
        debounceTime(1000),
        map(imagePositions => {
          const result = Array.from(this.updatedImagesCollection.values());

          result.forEach(
            item =>
              (item.sortOrder =
                result.length -
                this.gridInst.items.findIndex(
                  (gridItem: PackeryItemMock) => gridItem.position.x === item.position.x && gridItem.position.y === item.position.y
                ) -
                1)
          );

          return result.sort((a, b) => b.sortOrder - a.sortOrder);
        })
      )
      .subscribe(imagePositions => {
        this.updatedImages.emit(imagePositions);
        this.updatedImagesCollection.clear();
      });
  }

  ngDoCheck(): void {
    if (this.imagesLength !== this.images.length || this.progressLength !== this.progress.length) {
      this.currentImages = this.images.map((imageData: IImageDocument) => ({
        url: imageData.imageUrls['600'],
        id: imageData._id,
        aspect: imageData.info.aspect,
        newItem: false
      }));

      if (this.progress) {
        const currentProgress: Array<LoadingImage> = this.progress;
        this.currentImages.unshift(
          ...currentProgress
            .map((imageData: LoadingImage) => ({
              id: imageData.uid,
              aspect: imageData.aspect,
              newItem: true,
              progress: imageData.progress
            }))
            .reverse()
        );
      }
    }
  }

  ngAfterViewInit(): void {
    const gridElement: HTMLElement = this.gridElem.nativeElement;
    const gridItemElements = gridElement.querySelectorAll('.grid-item');

    this.gridInst = new Packery(this.gridElem.nativeElement, {
      gutter: 10
    });

    this.gridInst.on('layoutComplete', (laidOutItems: Array<PackeryItemMock>) => {
      this.imagesChangedSubject.next(laidOutItems.map(item => this.packeryItemToImagePosition(item)));
    });

    this.gridInst.on('dragItemPositioned', (item: PackeryItemMock) => {
      this.imagesChangedSubject.next([this.packeryItemToImagePosition(item)]);
    });
  }

  private packeryItemToImagePosition(item: PackeryItemMock): ImagePosition {
    return {
      _id: item.element.id,
      sortOrder: 0,
      position: { ...item.position } // Have to clone to prevent references updating on their own
    };
  }
}
