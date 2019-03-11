import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MATERIAL_SANITY_CHECKS } from '@angular/material';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { SharedModule } from '~/app/framework/core';
import { MaterialModule } from '~/app/framework/material';
import { environmentConfig } from '~/environments/environment';

import { ImageFrameworkModule } from '../framework/images/image.module';
import { RootAlbumAllResolver } from '../framework/images/image.resolvers';
import { SettingsService } from '../framework/settings/settings.service';
import { LayoutModule } from '../layout/layout.module';
import { GalleryModule } from '../shared/gallery/gallery.module';
import { InputFileModule } from '../shared/image-upload/input-file.module';
import { InputFileConfig } from '../shared/image-upload/interfaces/input-file-config';

import { ConfigMenuDialogComponent } from './config-menu/config-menu.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { ManageComponent } from './manage.component';
import { routes } from './manage.routes';

const config: InputFileConfig = {
  fileLimit: environmentConfig.MAX_UPLOAD_SIZE
};

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    SharedModule,
    MaterialModule,
    MatButtonModule,
    MatDialogModule,
    MatExpansionModule,
    MatIconModule,
    LayoutModule,
    InputFileModule.forRoot(config),
    GalleryModule,
    ImageFrameworkModule
  ],
  declarations: [
    LoginComponent,
    DashboardComponent,
    ManageComponent,
    ConfigMenuDialogComponent
  ],
  providers: [
    SettingsService,
    MatIconRegistry,
    RootAlbumAllResolver,
    {
      provide: MATERIAL_SANITY_CHECKS,
      useValue: false
    }
  ],
  entryComponents: [
    ConfigMenuDialogComponent
  ]
})
export class ManageModule {
  constructor(public matIconRegistry: MatIconRegistry) {
    matIconRegistry.registerFontClassAlias('fontawesome', 'fas');
  }
}
