import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingShare } from './meeting-share';

describe('MeetingShare', () => {
  let component: MeetingShare;
  let fixture: ComponentFixture<MeetingShare>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeetingShare],
    }).compileComponents();

    fixture = TestBed.createComponent(MeetingShare);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
