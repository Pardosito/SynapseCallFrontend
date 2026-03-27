import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoGrid } from './video-grid';

describe('VideoGrid', () => {
  let component: VideoGrid;
  let fixture: ComponentFixture<VideoGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoGrid],
    }).compileComponents();

    fixture = TestBed.createComponent(VideoGrid);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
