import { Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GameConfig } from '../../models/game.models';

@Component({
  selector: 'app-game-setup',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './game-setup.html',
  styleUrl: './game-setup.css',
})
export class GameSetupComponent {
  config: GameConfig = {
    size: 4,
    pits: 3,
    arrows: 3,
  };

  startGame = output<GameConfig>();

  onSubmit(): void {
    this.startGame.emit({ ...this.config });
  }
}
