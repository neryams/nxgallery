
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockImageService } from '~/app/framework/images/testing/mocks/image-service.mock';
import { t } from '~/app/framework/testing';

import { GalleryItemsDirective } from './gallery-items.directive';
import { GalleryComponent } from './gallery.component';

describe('GalleryComponent', () => {
  let component: GalleryComponent;
  let fixture: ComponentFixture<GalleryComponent>;

  let viewInitSpy: jasmine.Spy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GalleryItemsDirective, GalleryComponent ]
    })
    .compileComponents();
  }));

  beforeEach((next) => {
    fixture = TestBed.createComponent(GalleryComponent);
    component = fixture.componentInstance;
    const imageService = new MockImageService();

    imageService.getAllImages().subscribe((images) => {
      component.images = images;
      component.progress = [];
      // Squash the ngAfterViewInit because Packery won't work correctly. Just check the current images instead (TODO add more tests)
      viewInitSpy = t.spyOn(component, 'ngAfterViewInit');
      fixture.detectChanges();
      fixture.whenRenderingDone().then(() => {
        next();
      })
    });
  });

  it('should create', () => {
    expect(viewInitSpy).toHaveBeenCalled();
    expect(component).toBeTruthy();
  });
});
