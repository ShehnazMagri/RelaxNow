import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeSliderOneComponent } from './home-slider-one.component';

describe('HomeSliderOneComponent', () => {
  let component: HomeSliderOneComponent;
  let fixture: ComponentFixture<HomeSliderOneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomeSliderOneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeSliderOneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
