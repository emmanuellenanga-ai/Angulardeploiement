import { TestBed } from '@angular/core/testing';

import { Locataire } from './locataire';

describe('Locataire', () => {
  let service: Locataire;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Locataire);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
