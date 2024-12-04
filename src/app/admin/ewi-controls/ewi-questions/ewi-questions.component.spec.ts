import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EwiQuestionsComponent } from './ewi-questions.component';

describe('EwiQuestionsComponent', () => {
  let component: EwiQuestionsComponent;
  let fixture: ComponentFixture<EwiQuestionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EwiQuestionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EwiQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
