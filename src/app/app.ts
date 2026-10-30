import { Component } from '@angular/core';
import { GameSetupComponent } from './features/game-setup/game-setup';
import { GameBoardComponent } from './features/game-board/game-board';
import { GameEngine } from './core/game-engine';
import { GameConfig, GameState } from './models/game.models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GameSetupComponent, GameBoardComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  gameState: GameState | null = null;
  errors: string[] = [];

  constructor(private gameEngine: GameEngine) {}

  onNewGame(): void {
    this.gameState = null;
    this.errors = [];
  }

  onStartGame(config: GameConfig): void {
    const result = this.gameEngine.startGame(config);

    this.errors = result.errors;
    this.gameState = result.state;
  }
}
