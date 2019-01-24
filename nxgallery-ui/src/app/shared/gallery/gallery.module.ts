import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { GalleryItemsDirective } from './gallery-items.directive';
import { GalleryComponent } from './gallery.component';

@NgModule({
  declarations: [GalleryComponent, GalleryItemsDirective],
  imports: [CommonModule, MatProgressBarModule],
  exports: [GalleryComponent, GalleryItemsDirective]
})
export class GalleryModule {}
