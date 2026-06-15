import { TestBed } from '@angular/core/testing';

import { Proprietaire } from './proprietaire';

describe('Proprietaire', () => {
  let service: Proprietaire;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Proprietaire);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
