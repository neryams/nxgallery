import { AfterViewInit, Component, DoCheck, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';

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

@Component({
  selector: 'nxg-gallery',
  template: '',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent {
  @Input() images: Array<IImageDocument>;
  @Input() progress: Array<LoadingImage>;
  @Input() trackBy: (input: IImageDocument) => any;
  @ViewChild('grid') gridElem: ElementRef;

  @Output() readonly updatedImages = new EventEmitter();
}
