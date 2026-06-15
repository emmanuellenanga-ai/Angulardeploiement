import { TestBed } from '@angular/core/testing';

import { Bien } from './bien';

describe('Bien', () => {
  let service: Bien;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Bien);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
