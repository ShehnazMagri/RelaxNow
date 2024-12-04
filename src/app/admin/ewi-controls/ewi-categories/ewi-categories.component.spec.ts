import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EwiCategoriesComponent } from './ewi-categories.component';

describe('EwiCategoriesComponent', () => {
  let component: EwiCategoriesComponent;
  let fixture: ComponentFixture<EwiCategoriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EwiCategoriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EwiCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
