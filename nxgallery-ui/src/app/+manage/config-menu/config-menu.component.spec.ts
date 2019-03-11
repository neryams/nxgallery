
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { CoreTestingModule } from '~/app/framework/core/testing/core-testing.module';
import { I18NTestingModule } from '~/app/framework/i18n/testing';
import { MaterialModule } from '~/app/framework/material/material.module';
import { NgrxTestingModule } from '~/app/framework/ngrx/testing';
import { SettingsFrameworkTestingModule } from '~/app/framework/settings/testing/settings-testing.module';
import { TestingModule } from '~/app/framework/testing';
import { InputFileModule } from '~/app/shared/image-upload/input-file.module';

import { ConfigMenuDialogComponent } from './config-menu.component';

describe('ConfigMenuDialogComponent', () => {
  let component: ConfigMenuDialogComponent;
  let fixture: ComponentFixture<ConfigMenuDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  const mockSettingsService = {
    close: jasmine.createSpy('close')
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgrxTestingModule,
        InputFileModule,
        ReactiveFormsModule,
        CoreTestingModule,
        I18NTestingModule,
        NgrxTestingModule,
        SettingsFrameworkTestingModule,
        TestingModule,
        MaterialModule
      ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            rootAlbumId: 'mock',
            galleryName: 'Mock Album',
            theme: ''
          }
        },
        { provide: 'config', useValue: {} }
      ],
      declarations: [ ConfigMenuDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigMenuDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
