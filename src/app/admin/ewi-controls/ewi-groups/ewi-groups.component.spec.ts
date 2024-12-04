import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EwiGroupsComponent } from './ewi-groups.component';

describe('EwiGroupsComponent', () => {
  let component: EwiGroupsComponent;
  let fixture: ComponentFixture<EwiGroupsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EwiGroupsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EwiGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
