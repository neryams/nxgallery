import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  DoCheck,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Renderer2,
  ViewChild
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import * as Packery from 'packery';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { debounceTime, map, tap } from 'rxjs/operators';
import { appConfig } from '~/environments/environment';

import { IImageDocument } from './../../../../../shared/interfaces/imageData';

export interface LoadingImage {
  uid: string;
  aspect: number;
  progress: BehaviorSubject<number>;
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
  title: string;
  progress?: BehaviorSubject<number>;
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
export class GalleryComponent implements OnInit, AfterViewInit, DoCheck {
  @Input() images: Array<IImageDocument>;
  @Input() progress: Array<LoadingImage>;
  @Input() isAlbumRoot: boolean;
  @Input() trackBy: (input: IImageDocument) => any;
  @ViewChild('grid') gridElem: ElementRef;
  @ViewChild('overlay') overlay: ElementRef;

  @Output() readonly movedImages = new EventEmitter();
  @Output() readonly updatedImage = new EventEmitter();
  @Output() readonly setImageAsPrimary = new EventEmitter();
  @Output() readonly removeImage = new EventEmitter();
  movedImagesCollection: Map<string, ImagePosition>;
  imagesChangedSubject = new Subject<Array<ImagePosition>>();

  progressLength: number;
  lastImagesLength: number;
  lastImages: Array<IImageDocument>;
  currentImages: Array<GalleryItem>;
  gridInst: any;

  imageSettingsForm = new FormGroup({
    title: new FormControl(''),
    caption: new FormControl('')
  });

  currentEditing: {
    originalTop: string;
    galleryItem: GalleryItem;
    itemElement: HTMLElement;
  };

  constructor(private readonly renderer: Renderer2, private readonly ref: ChangeDetectorRef, element: ElementRef) {
    this.movedImagesCollection = new Map();

    this.imagesChangedSubject
      .pipe(
        tap(imagePositions => imagePositions.forEach(imagePosition => this.movedImagesCollection.set(imagePosition._id, imagePosition))),
        debounceTime(1000),
        map(imagePositions => {
          const result = Array.from(this.movedImagesCollection.values());

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
        this.movedImages.emit(imagePositions);
        this.movedImagesCollection.clear();
      });
  }

  ngOnInit(): void {
    this.gridElem.nativeElement.style.setProperty('--gutter', `${appConfig.gallery.gutter}px`);
    console.log(this.isAlbumRoot);
  }

  ngDoCheck(): void {
    if (this.lastImages !== this.images || this.lastImagesLength !== this.images.length || this.progressLength !== this.progress.length) {
      this.currentImages = this.images.map((imageData: IImageDocument) => ({
        url: imageData.imageUrls['600'],
        id: imageData._id,
        childAlbumId: imageData.childAlbumId,
        aspect: imageData.info.aspect,
        title: imageData.title,
        newItem: false
      }));

      if (this.progress && this.progress.length > 0) {
        const currentProgress: Array<LoadingImage> = this.progress;
        this.currentImages.unshift(
          ...currentProgress
            .map((imageData: LoadingImage) => ({
              id: imageData.uid,
              aspect: imageData.aspect,
              newItem: true,
              title: '',
              progress: imageData.progress
            }))
            .reverse()
        );
      }
      this.lastImages = this.images;
      this.lastImagesLength = this.images.length;
      this.progressLength = this.progress.length;
    }
  }

  ngAfterViewInit(): void {
    const gridElement: HTMLElement = this.gridElem.nativeElement;

    if (gridElement) {
      this.gridInst = new Packery(gridElement, {
        columnWidth: '.grid-sizer',
        gutter: '.gutter-sizer',
        // do not use .grid-sizer in layout
        itemSelector: '.grid-item',
        percentPosition: true
      });

      this.gridInst.on('layoutComplete', (laidOutItems: Array<PackeryItemMock>) => {
        this.imagesChangedSubject.next(laidOutItems.map(item => this.packeryItemToImagePosition(item)));
      });

      this.gridInst.on('dragItemPositioned', (item: PackeryItemMock) => {
        this.imagesChangedSubject.next([this.packeryItemToImagePosition(item)]);
      });
    }
  }

  setAsPrimary(galleryItem: GalleryItem): void {
    const imageToBePrimary = this.images.find(inputImage => inputImage._id === galleryItem.id);
    this.setImageAsPrimary.emit(imageToBePrimary);
  }

  deleteImage(galleryItem: GalleryItem): void {
    const imageToDelete = this.images.find(inputImage => inputImage._id === galleryItem.id);
    this.removeImage.emit(imageToDelete);
  }

  editImageDetails(galleryItem: GalleryItem, imageElement: HTMLElement): void {
    if (this.currentEditing) {
      return;
    }

    this.renderer.addClass(this.overlay.nativeElement, 'display');
    this.renderer.addClass(imageElement, 'grid-item--detail');
    const originalTop = imageElement.style.top;

    this.renderer.setStyle(imageElement, 'top', `${window.scrollY}px`);
    this.currentEditing = {
      galleryItem,
      originalTop,
      itemElement: imageElement
    };
    const currentEditingImage = this.images.find(inputImage => inputImage._id === galleryItem.id);
    this.imageSettingsForm.get('title').setValue(currentEditingImage.title || '');
    this.imageSettingsForm.get('caption').setValue(currentEditingImage.info.caption || '');

    this.ref.detectChanges();
  }

  saveImageDetails(updatedGalleryItem: GalleryItem): void {
    const updatedImage = JSON.parse(JSON.stringify(this.images.find(inputImage => inputImage._id === updatedGalleryItem.id)));
    updatedImage.title = this.imageSettingsForm.get('title').value;
    updatedImage.info.caption = this.imageSettingsForm.get('caption').value;

    this.updatedImage.emit(updatedImage);
    this.closeImageDetails();
  }

  closeImageDetails(): void {
    if (this.currentEditing) {
      const image = this.currentEditing.itemElement;
      this.renderer.removeClass(this.overlay.nativeElement, 'display');
      this.renderer.removeClass(image, 'grid-item--detail');
      this.renderer.setStyle(image, 'top', this.currentEditing.originalTop);

      delete this.currentEditing;
    }
  }

  private packeryItemToImagePosition(item: PackeryItemMock): ImagePosition {
    return {
      _id: item.element.id,
      sortOrder: 0,
      position: { ...item.position } // Have to clone to prevent references updating on their own
    };
  }
}
