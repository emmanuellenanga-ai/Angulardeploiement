import { TestBed } from '@angular/core/testing';

import { BiensPublics } from './biens-publics';

describe('BiensPublics', () => {
  let service: BiensPublics;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BiensPublics);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
