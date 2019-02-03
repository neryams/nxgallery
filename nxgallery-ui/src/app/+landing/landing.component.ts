import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, HostListener, Inject, OnInit, PLATFORM_ID, Renderer2, ViewChild } from '@angular/core';

import { ImageService } from '../framework/images/image.service';

const gridColumns = 3;
const gridGutter = 10;

interface DisplayImage { 
  id: string;
  url: string;
  largeFileUrl: string;
  caption: string;
  position: { left: number; top: number, width?: number, height?: number }
  displayDetail: boolean
}

@Component({
  selector: 'nxg-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  @ViewChild('imageGrid') imageGrid: ElementRef;
  @ViewChild('overlay') overlay: ElementRef;

  galleryWidth: number;
  galleryPosition: { x: number, y: number }

  images: Array<DisplayImage>;
  containerHeight: number;
  currPage: number;
  currImageDetail: {
    image: DisplayImage;
    originalPosition: DisplayImage['position'];
  };

  // tslint:disable-next-line
  @HostListener('window:resize', ['$event'])
  @HostListener('window:orientationchange', ['$event']) onResize(event: Event): void {
    if (isPlatformBrowser(this.platformId)) {
      const gridBoundingClientRect = (this.imageGrid.nativeElement as HTMLElement).getBoundingClientRect();
      const galleryWidth = gridBoundingClientRect.width;
      if (galleryWidth !== this.galleryWidth) {
        this.images.forEach(image => {
          image.position.left *= galleryWidth / this.galleryWidth;
          image.position.top *= galleryWidth / this.galleryWidth;
          image.position.width *= galleryWidth / this.galleryWidth;
          image.position.height *= galleryWidth / this.galleryWidth;
        });

        this.galleryWidth = galleryWidth;
      }
      this.galleryPosition = {
        x: gridBoundingClientRect.left,
        y: gridBoundingClientRect.top
      }
    }
  }

  constructor(
    private readonly imageService: ImageService, 
    private readonly ref: ChangeDetectorRef,
    private readonly renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.containerHeight = 0;
    this.currPage = 1;
    this.images = [];
    this.galleryPosition = {
      x: 0,
      y: 0
    };
    this.galleryWidth = 800;
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const gridBoundingClientRect = (this.imageGrid.nativeElement as HTMLElement).getBoundingClientRect();
      this.galleryPosition = {
        x: gridBoundingClientRect.left,
        y: gridBoundingClientRect.top
      }
      this.galleryWidth = gridBoundingClientRect.width;
    }
    this.getImages(this.currPage);
  }

  onScroll(): void {
    this.currPage++;
    this.getImages(this.currPage);
  }

  imageUUID(image: DisplayImage): string {
    return image.id;
  }

  openImageDetails(image: DisplayImage): void {
    if (typeof this.currImageDetail !== 'undefined') {
      return;
    }

    this.currImageDetail = {
      image,
      originalPosition: { ...image.position }
    }

    this.renderer.addClass(this.overlay.nativeElement, 'display');
    image.position = this.calculateDetailImagePosition();
    image.displayDetail = true;
    
    this.ref.detectChanges();
  }

  closeImageDetails():void {
    if (typeof this.currImageDetail !== 'undefined') {
      this.renderer.removeClass(this.overlay.nativeElement, 'display');
      this.currImageDetail.image.displayDetail = false;
      this.currImageDetail.image.position = this.currImageDetail.originalPosition;
      delete this.currImageDetail;
      this.ref.detectChanges();
    }
  }

  private calculateDetailImagePosition(): { left: number, top: number, width: number, height: number } {
    const margin = 100;
    const scrollOffset = this.imageGrid.nativeElement.getBoundingClientRect().top * -1 + 100;

    return {
      left: margin - this.galleryPosition.x,
      top: margin - this.galleryPosition.y + scrollOffset,
      width: window.innerWidth - margin * 2,
      height: window.innerHeight - margin * 2
    };
  }

  private getImages(page = 1): void {
    this.imageService.getImages(page).subscribe(images => {
      this.images.push(...images.map(image => {
        const imagePosition = {
          top: image.info.position.y * this.galleryWidth,
          left: image.info.position.x * this.galleryWidth,
          width: this.galleryWidth / gridColumns - gridGutter,
          height: (this.galleryWidth / gridColumns - gridGutter) / image.info.aspect
        };

        const imageAbsBottom = imagePosition.top + imagePosition.height;
        if(this.containerHeight < imageAbsBottom) {
          this.containerHeight = imageAbsBottom;
        }

        return {
          id: image._id,
          url: image.imageUrls['600'],
          largeFileUrl: image.imageUrls['1200'],
          caption: image.info.caption,
          position: imagePosition,
          displayDetail: false
        }
      }));
      
      this.ref.detectChanges();
    })
  }
}
