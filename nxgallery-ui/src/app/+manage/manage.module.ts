
import { NgModule } from '@angular/core';
import { MATERIAL_SANITY_CHECKS } from '@angular/material';
import { RouterModule } from '@angular/router';
import { SharedModule } from '~/app/framework/core';
import { MaterialModule } from '~/app/framework/material';
import { environmentConfig } from '~/environments/environment';

import { ImageFrameworkModule } from '../framework/images/image.module';
import { RootAlbumAllResolver } from '../framework/images/image.resolvers';
import { LayoutModule } from '../layout/layout.module';
import { GalleryModule } from '../shared/gallery/gallery.module';
import { InputFileModule } from '../shared/image-upload/input-file.module';
import { InputFileConfig } from '../shared/image-upload/interfaces/input-file-config';

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
    SharedModule,
    MaterialModule,
    LayoutModule,
    InputFileModule.forRoot(config),
    GalleryModule,
    ImageFrameworkModule
  ],
  declarations: [
    LoginComponent,
    DashboardComponent,
    ManageComponent
  ],
  providers: [
    RootAlbumAllResolver,
    {
      provide: MATERIAL_SANITY_CHECKS,
      useValue: false
    }
  ]
})
export class ManageModule {}
