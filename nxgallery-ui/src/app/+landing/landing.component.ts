import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, HostListener, Inject, OnInit, PLATFORM_ID, Renderer2, ViewChild } from '@angular/core';
import { appConfig } from '~/environments/environment';

import { ImageService } from '../framework/images/image.service';

const gridColumns = appConfig.gallery.columns;
const gridGutter = appConfig.gallery.gutter;

const breakpoints = [
  { pageWidth: 0, sideMargin: 0, topPadding: -15 },
  { pageWidth: 750, sideMargin: 50, topPadding: -15 },
  { pageWidth: 1000, sideMargin: 50, topPadding: -15 }
]

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

        if (this.currImageDetail) {
          this.currImageDetail.image.position = this.calculateDetailImagePosition();
          
          this.currImageDetail.originalPosition.left *= galleryWidth / this.galleryWidth;
          this.currImageDetail.originalPosition.top *= galleryWidth / this.galleryWidth;
          this.currImageDetail.originalPosition.width *= galleryWidth / this.galleryWidth;
          this.currImageDetail.originalPosition.height *= galleryWidth / this.galleryWidth;
        }

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
    const breakpointOptions = [...breakpoints];
    let breakpoint = breakpointOptions.pop();
    while (breakpoint.pageWidth > window.innerWidth && breakpointOptions.length > 0) {
      breakpoint = breakpointOptions.pop();
    }
    const margin = breakpoint.sideMargin;
    const topOffset = this.imageGrid.nativeElement.getBoundingClientRect().top + breakpoint.topPadding;

    return {
      left: margin - this.galleryPosition.x,
      top: margin - this.galleryPosition.y + topOffset,
      width: (margin === 0 ? undefined : window.innerWidth - margin * 2),
      height: window.innerHeight - margin * 2 - topOffset
    };
  }

  private getImages(page = 1): void {
    this.imageService.getImages(page).subscribe(images => {
      this.images.push(...images.map(image => {
        const column = Math.round(image.info.position.x * gridColumns);
        const gutterFix = appConfig.gallery.gutter * column / appConfig.gallery.columns;

        const imagePosition = {
          top: image.info.position.y * this.galleryWidth,
          left: image.info.position.x * this.galleryWidth +  gutterFix,
          width: this.galleryWidth / gridColumns - (gridGutter * (gridColumns - 1) / gridColumns),
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
