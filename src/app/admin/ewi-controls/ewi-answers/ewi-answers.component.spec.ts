import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EwiAnswersComponent } from './ewi-answers.component';

describe('EwiAnswersComponent', () => {
  let component: EwiAnswersComponent;
  let fixture: ComponentFixture<EwiAnswersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EwiAnswersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EwiAnswersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
