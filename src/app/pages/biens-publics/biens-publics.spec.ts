import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BiensPublics } from './biens-publics';

describe('BiensPublics', () => {
  let component: BiensPublics;
  let fixture: ComponentFixture<BiensPublics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BiensPublics],
    }).compileComponents();

    fixture = TestBed.createComponent(BiensPublics);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
