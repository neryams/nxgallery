import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { InputFileComponent } from './components/input-file/input-file.component';
import { DropZoneDirective } from './directives/drop-zone/drop-zone.directive';
import { InputFileConfig } from './interfaces/input-file-config';
import { InputFileService } from './services/input-file.service';

@NgModule({
  declarations: [DropZoneDirective, InputFileComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  exports: [InputFileComponent],
  providers: [InputFileService],
  entryComponents: [InputFileComponent]
})
export class InputFileModule {
  static forRoot(config: InputFileConfig): ModuleWithProviders {
    return {
      ngModule: InputFileModule,
      providers: [InputFileService, { provide: 'config', useValue: config }]
    };
  }
}
