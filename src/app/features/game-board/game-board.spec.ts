import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameBoardComponent } from './game-board';
import { GameEngine } from '../../core/game-engine';

describe('GameBoard', () => {
  let component: GameBoardComponent;
  let fixture: ComponentFixture<GameBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameBoardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GameBoardComponent);
    component = fixture.componentInstance;
    const { state } = TestBed.inject(GameEngine).startGame({
      size: 4,
      pits: 0,
      arrows: 2,
    });
    fixture.componentRef.setInput('gameState', state!);
    await fixture.whenStable();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });
});
