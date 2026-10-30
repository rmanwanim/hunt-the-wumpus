import { Component, input, output } from '@angular/core';
import { GameEngine } from '../../core/game-engine';
import { GameState } from '../../models/game.models';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [],
  templateUrl: './game-board.html',
  styleUrl: './game-board.css',
})
export class GameBoardComponent {
  gameState = input.required<GameState>();
  gameStateChange = output<GameState>();
  newGame = output<void>();

  constructor(private gameEngine: GameEngine) {}

  advance(): void {
    this.gameStateChange.emit(this.gameEngine.moveForward(this.gameState()));
  }

  turnLeft(): void {
    this.gameStateChange.emit(this.gameEngine.turnLeft(this.gameState()));
  }

  turnRight(): void {
    this.gameStateChange.emit(this.gameEngine.turnRight(this.gameState()));
  }

  shoot(): void {
    this.gameStateChange.emit(this.gameEngine.shootArrow(this.gameState()));
  }

  exit(): void {
    this.gameStateChange.emit(this.gameEngine.exitGame(this.gameState()));
  }
}
