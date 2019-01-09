import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { GalleryItemsDirective } from './gallery-items.directive';
import { GalleryComponent } from './gallery.component';

@NgModule({
  declarations: [GalleryComponent, GalleryItemsDirective],
  imports: [
    CommonModule
  ],
  exports: [GalleryComponent, GalleryItemsDirective]
})
export class GalleryModule { }
