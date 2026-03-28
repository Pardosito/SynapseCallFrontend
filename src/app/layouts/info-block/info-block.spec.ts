import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoBlock } from './info-block';

describe('InfoBlock', () => {
  let component: InfoBlock;
  let fixture: ComponentFixture<InfoBlock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoBlock],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoBlock);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
