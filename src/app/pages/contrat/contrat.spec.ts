import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContratComponent } from './contrat';

describe('Contrat', () => {
  let component: ContratComponent;
  let fixture: ComponentFixture<ContratComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContratComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContratComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
