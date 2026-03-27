import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaControls } from './media-controls';

describe('MediaControls', () => {
  let component: MediaControls;
  let fixture: ComponentFixture<MediaControls>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaControls],
    }).compileComponents();

    fixture = TestBed.createComponent(MediaControls);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
