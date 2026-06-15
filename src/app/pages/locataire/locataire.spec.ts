import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocataireComponent } from './locataire';

describe('LocataireComponent', () => {
  let component: LocataireComponent;
  let fixture: ComponentFixture<LocataireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocataireComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LocataireComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
