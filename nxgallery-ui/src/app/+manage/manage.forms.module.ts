import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '~/app/framework/material/material.module';

import { ImageSettingsFormComponent } from './image-settings-form/image-settings-form.component';

@NgModule({
  imports: [
    ReactiveFormsModule,
    MaterialModule
  ],
  declarations: [
    ImageSettingsFormComponent
  ],
  exports: [
    ImageSettingsFormComponent
  ]
})
export class ManageFormsModule {}
