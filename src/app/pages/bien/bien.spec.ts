import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BienComponent } from './bien';

describe('Bien', () => {
  let component: BienComponent;
  let fixture: ComponentFixture<BienComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BienComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BienComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
