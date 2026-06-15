import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BiensDetails } from './biens-details';

describe('BiensDetails', () => {
  let component: BiensDetails;
  let fixture: ComponentFixture<BiensDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BiensDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(BiensDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
