import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, HostListener, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';

import { ImageService } from '../framework/images/image.service';

const gridWidth = 340;

interface DisplayImage { id: string; url: string; position: { x: number; y: number } }

@Component({
  selector: 'nxg-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  @ViewChild('imageGrid') imageGrid: ElementRef;

  images: Array<DisplayImage>;
  containerHeight: number;
  currPage: number;
  galleryWidth: number;

  // tslint:disable-next-line
  @HostListener('window:resize', ['$event'])
  @HostListener('window:orientationchange', ['$event']) onResize(event: Event): void {
    if (isPlatformBrowser(this.platformId)) {
      const galleryWidth = this.imageGrid.nativeElement.getBoundingClientRect().width;
      if (galleryWidth !== this.galleryWidth) {
        this.images.forEach(image => {
          image.position.x *= galleryWidth / this.galleryWidth;
          image.position.y *= galleryWidth / this.galleryWidth;
        });

        this.galleryWidth = galleryWidth;
      }
    }
  }

  constructor(
    private readonly imageService: ImageService, 
    private readonly ref: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.containerHeight = 0;
    this.currPage = 1;
    this.images = [];
    this.galleryWidth = 800;
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.galleryWidth = this.imageGrid.nativeElement.getBoundingClientRect().width;
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

  private getImages(page = 1): void {
    this.imageService.getImages(page).subscribe(images => {
      this.images.push(...images.map(image => {
        image.info.position.x *= this.galleryWidth;
        image.info.position.y *= this.galleryWidth;

        const imageAbsBottom = image.info.position.y + gridWidth / image.info.aspect;
        if(this.containerHeight < imageAbsBottom) {
          this.containerHeight = imageAbsBottom;
        }

        return {
          id: image._id,
          url: image.imageUrls['600'],
          position: image.info.position
        }
      }));
      
      this.ref.detectChanges();
    })
  }
}
