import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Paiement, PaiementComponent } from './paiement';

describe('PaiementComponent', () => {
  let component: PaiementComponent;
  let fixture: ComponentFixture<PaiementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaiementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaiementComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
