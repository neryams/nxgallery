import { ChangeDetectorRef, Component,OnInit } from '@angular/core';

import { ImageService } from '../framework/images/image.service';

const gridWidth = 340;

interface DisplayImage { id: string; url: string; position: { x: number; y: number } }

@Component({
  selector: 'nxg-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['../../assets/sass/gallery.scss', './landing.component.scss']
})
export class LandingComponent implements OnInit {
  images: Array<DisplayImage>;
  containerHeight: number;
  currPage: number;

  constructor(private readonly imageService: ImageService, private readonly ref: ChangeDetectorRef) {
    this.containerHeight = 0;
    this.currPage = 1;
    this.images = [];
  }

  ngOnInit(): void {
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
