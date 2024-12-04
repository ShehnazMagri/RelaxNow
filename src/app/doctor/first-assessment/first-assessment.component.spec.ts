import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FirstAssessmentComponent } from './first-assessment.component';

describe('FirstAssessmentComponent', () => {
  let component: FirstAssessmentComponent;
  let fixture: ComponentFixture<FirstAssessmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FirstAssessmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FirstAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
