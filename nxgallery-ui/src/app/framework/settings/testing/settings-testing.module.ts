import { NgModule } from '@angular/core';

import { SettingsService } from '../settings.service';

import { MockSettingsService } from './mocks/settings-service.mock';

@NgModule({
  providers: [
    {
      provide: SettingsService,
      useClass: MockSettingsService
    }
  ]
})
export class SettingsFrameworkTestingModule {}
