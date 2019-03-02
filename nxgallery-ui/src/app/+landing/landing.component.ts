
import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, HostListener, Inject, OnInit, PLATFORM_ID, Renderer2, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { IAlbumDocument, IImageDocument } from '~/../../shared';
import { appConfig, environmentConfig } from '~/environments/environment';

import { ImageService } from '../framework/images/image.service';

const gridColumns = appConfig.gallery.columns;
const gridGutter = appConfig.gallery.gutter;

const breakpoints = [
  { minPageWidth: 0, sideMargin: 0, topMargin: 50, fillHeight: false },
  { minPageWidth: 800, sideMargin: 50, topMargin: 50, fillHeight: true },
  { minPageWidth: 1200, sideMargin: 150, topMargin: 150, fillHeight: true }
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
  themeCss: string;
  galleryWidth: number;
  galleryPosition: { x: number, y: number }

  album: IAlbumDocument;
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
      this.galleryPosition.x = gridBoundingClientRect.left;
      
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
    }
  }

  constructor(
    public sanitizer: DomSanitizer,
    private readonly route: ActivatedRoute,
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
    if (this.route.snapshot.data.rootAlbum !== undefined) {
      this.album = this.route.snapshot.data.rootAlbum;
      if (this.album.settings.theme) {
        this.themeCss = `${this.album.settings.theme}/${environmentConfig.THEME_STRUCTURE.MAIN_CSS}`;
      }
      this.processImages(this.album.images);
    }
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
    const screenWidth = document.documentElement.clientWidth;
    const screenHeight = document.documentElement.clientHeight;
    const breakpointOptions = [...breakpoints];
    let breakpoint = breakpointOptions.pop();
    while (breakpoint.minPageWidth > screenWidth && breakpointOptions.length > 0) {
      breakpoint = breakpointOptions.pop();
    }
    const sideMargin = breakpoint.sideMargin;
    const topMargin = breakpoint.topMargin;
    // const topOffset = breakpoint.topPadding + window.scrollY;
    const topOffset = window.scrollY;

    return {
      left: sideMargin - this.galleryPosition.x,
      top: topMargin - this.galleryPosition.y + topOffset,
      width: (sideMargin === 0 ? undefined : screenWidth - sideMargin * 2), // Fall back to the css which is width: 100% if no margin
      height: breakpoint.fillHeight ? screenHeight - topMargin * 2 : undefined
    };
  }

  private getImages(page = 1): void {
    this.imageService.getImages(this.album._id, page).subscribe(images => {
      this.processImages(images);
    })
  }

  private processImages(images: Array<IImageDocument>): void {
    this.images.push(...images.map(image => {
      if (image.info.position === undefined) {
        image.info.position = { x: 0, y: 0 };
      }
      const column = Math.round(image.info.position.x * gridColumns);
      const gutterFix = appConfig.gallery.gutter * column / appConfig.gallery.columns;

      const imagePosition = {
        top: image.info.position.y * this.galleryWidth,
        left: image.info.position.x * this.galleryWidth +  gutterFix,
        width: this.galleryWidth / gridColumns - (gridGutter * (gridColumns - 1) / gridColumns),
        height: (this.galleryWidth / gridColumns - gridGutter) / image.info.aspect
      };

      const imageAbsBottom = imagePosition.top + imagePosition.height + 10;
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
  }
}
