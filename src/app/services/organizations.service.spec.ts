import { TestBed } from '@angular/core/testing';

import { Organizations } from './organizations.service';

describe('Organizations', () => {
  let service: Organizations;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Organizations);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
