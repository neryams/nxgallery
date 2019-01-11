import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '~/app/framework/router/testing';
import { MockComponent, t, TestingModule } from '~/app/framework/testing';

import { ManageComponent } from './manage.component';

const MOCK_ROUTES = [
  {
    path: '',
    children: [
      {
        path: 'dashboard',
        component: MockComponent
      },
      {
        path: 'login',
        component: MockComponent
      }
    ]
  }
];

describe('ManageComponent', () => {
  let component: ManageComponent;
  let fixture: ComponentFixture<ManageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TestingModule,
        RouterTestingModule.withRoutes(MOCK_ROUTES)
      ],
      declarations: [ ManageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
