import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminProprietaire } from './admin-proprietaire';

describe('AdminProprietaire', () => {
  let component: AdminProprietaire;
  let fixture: ComponentFixture<AdminProprietaire>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProprietaire],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminProprietaire);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
