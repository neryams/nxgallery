import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';

import { GalleryItemsDirective } from './gallery-items.directive';
import { GalleryComponent } from './gallery.component';

@NgModule({
  declarations: [GalleryComponent, GalleryItemsDirective],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule
  ],
  exports: [GalleryComponent, GalleryItemsDirective]
})
export class GalleryModule {}
