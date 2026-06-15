import { TestBed } from '@angular/core/testing';

import { AdminProprietaire } from './admin-proprietaire';

describe('AdminProprietaire', () => {
  let service: AdminProprietaire;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminProprietaire);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
