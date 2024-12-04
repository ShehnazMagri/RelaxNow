import { TestBed } from '@angular/core/testing';

import { VisitorGuard } from './visitor.guard';

describe('VisitorGuard', () => {
  let guard: VisitorGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(VisitorGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
