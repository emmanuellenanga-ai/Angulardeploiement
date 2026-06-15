import { TestBed } from '@angular/core/testing';

import { DemandeVisite } from './demande-visite';

describe('DemandeVisite', () => {
  let service: DemandeVisite;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DemandeVisite);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
