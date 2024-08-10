import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardStatusComponent } from './board-status.component';

describe('BoardStatusComponent', () => {
  let component: BoardStatusComponent;
  let fixture: ComponentFixture<BoardStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoardStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
