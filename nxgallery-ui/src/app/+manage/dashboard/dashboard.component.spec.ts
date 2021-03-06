
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthTestingModule } from '~/app/framework/auth/testing/auth-testing.module';
import { CoreTestingModule } from '~/app/framework/core/testing/core-testing.module';
import { I18NTestingModule } from '~/app/framework/i18n/testing';
import { ImageFrameworkTestingModule } from '~/app/framework/images/testing/image-testing.module';
import { MaterialModule } from '~/app/framework/material/material.module';
import { NgrxTestingModule } from '~/app/framework/ngrx/testing';
import { MockComponent, t, TestingModule } from '~/app/framework/testing';
import { HeaderComponent } from '~/app/layout/header.component';
import { GalleryModule } from '~/app/shared/gallery/gallery.module';
import { InputFileModule } from '~/app/shared/image-upload/input-file.module';

import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        NgrxTestingModule,
        InputFileModule,
        GalleryModule,
        ImageFrameworkTestingModule,
        FormsModule,
        RouterTestingModule.withRoutes([]),
        CoreTestingModule,
        AuthTestingModule,
        I18NTestingModule,
        NgrxTestingModule,
        TestingModule,
        MaterialModule
      ],
      providers: [
        { provide: 'config', useValue: {} }
      ],
      declarations: [ HeaderComponent, DashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
