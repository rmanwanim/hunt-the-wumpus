import { TestBed } from '@angular/core/testing';
import { GameStatus } from './models/game.models';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('debería crear la aplicación', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    expect(app).toBeTruthy();
  });

  it('debería mostrar el título del juego', async () => {
    const fixture = TestBed.createComponent(App);

    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h1')?.textContent).toContain('Hunt the Wumpus');
  });

  for (const status of [GameStatus.WON, GameStatus.LOST]) {
    it('debería iniciar otra partida después de ' + status, async () => {
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      app.onStartGame({ size: 4, pits: 0, arrows: 2 });
      app.gameState = { ...app.gameState!, status };
      fixture.detectChanges();
      await fixture.whenStable();
      const element = fixture.nativeElement as HTMLElement;
      const button = Array.from(element.querySelectorAll('button')).find(
        (button) => button.textContent?.trim() === 'Nueva partida',
      );
      expect(button).toBeDefined();
      button!.click();
      await fixture.whenStable();
      expect(app.gameState).toBeNull();
      expect(app.errors).toEqual([]);
      expect(element.querySelector('app-game-setup')).not.toBeNull();
      expect(element.querySelector('app-game-board')).toBeNull();
      element
        .querySelector('form')!
        .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      await fixture.whenStable();
      expect(app.gameState?.status).toBe(GameStatus.PLAYING);
      expect(element.querySelector('app-game-board')).not.toBeNull();
      expect(
        Array.from(element.querySelectorAll('button')).some(
          (button) => button.textContent?.trim() === 'Nueva partida',
        ),
      ).toBeFalse();
    });
  }
});
