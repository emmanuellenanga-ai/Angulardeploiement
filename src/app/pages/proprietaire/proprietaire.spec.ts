import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Proprietaire } from './proprietaire';

describe('Proprietaire', () => {
  let component: Proprietaire;
  let fixture: ComponentFixture<Proprietaire>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Proprietaire],
    }).compileComponents();

    fixture = TestBed.createComponent(Proprietaire);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
