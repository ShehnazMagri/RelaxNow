import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeSliderTwoComponent } from './home-slider-two.component';

describe('HomeSliderTwoComponent', () => {
  let component: HomeSliderTwoComponent;
  let fixture: ComponentFixture<HomeSliderTwoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomeSliderTwoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeSliderTwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
