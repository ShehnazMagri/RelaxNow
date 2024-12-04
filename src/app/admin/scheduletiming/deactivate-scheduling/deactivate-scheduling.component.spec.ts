import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeactivateSchedulingComponent } from './deactivate-scheduling.component';

describe('DeactivateSchedulingComponent', () => {
  let component: DeactivateSchedulingComponent;
  let fixture: ComponentFixture<DeactivateSchedulingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeactivateSchedulingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeactivateSchedulingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
