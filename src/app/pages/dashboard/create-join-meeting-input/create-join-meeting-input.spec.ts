import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateJoinMeetingInput } from './create-join-meeting-input';

describe('CreateJoinMeetingInput', () => {
  let component: CreateJoinMeetingInput;
  let fixture: ComponentFixture<CreateJoinMeetingInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateJoinMeetingInput],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateJoinMeetingInput);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
