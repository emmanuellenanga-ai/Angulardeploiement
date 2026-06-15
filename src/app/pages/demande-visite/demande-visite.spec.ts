import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandeVisite } from './demande-visite';

describe('DemandeVisite', () => {
  let component: DemandeVisite;
  let fixture: ComponentFixture<DemandeVisite>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemandeVisite],
    }).compileComponents();

    fixture = TestBed.createComponent(DemandeVisite);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
