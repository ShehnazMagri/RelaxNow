import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EwiControlsComponent } from './ewi-controls.component';

describe('EwiControlsComponent', () => {
  let component: EwiControlsComponent;
  let fixture: ComponentFixture<EwiControlsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EwiControlsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EwiControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
