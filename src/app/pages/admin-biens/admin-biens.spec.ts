import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminBiens } from './admin-biens';

describe('AdminBiens', () => {
  let component: AdminBiens;
  let fixture: ComponentFixture<AdminBiens>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminBiens],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminBiens);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
