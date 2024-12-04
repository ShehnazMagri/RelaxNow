import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EwiTestComponent } from './ewi-test.component';

describe('EwiTestComponent', () => {
  let component: EwiTestComponent;
  let fixture: ComponentFixture<EwiTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EwiTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EwiTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
