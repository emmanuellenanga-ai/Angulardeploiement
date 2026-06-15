import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDemandes } from './admin-demandes';

describe('AdminDemandes', () => {
  let component: AdminDemandes;
  let fixture: ComponentFixture<AdminDemandes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDemandes],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDemandes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
