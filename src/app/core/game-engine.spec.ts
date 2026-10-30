import { TestBed } from '@angular/core/testing';
import { GameEngine } from './game-engine';
import { GameState, Direction, GameStatus } from '../models/game.models';

describe('GameEngine', () => {
  let service: GameEngine;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameEngine);
    spyOn(Math, 'random').and.returnValue(0.99);
  });

  function createState(): GameState {
    const { state } = service.startGame({ size: 4, pits: 0, arrows: 2 });
    return state!;
  }

  it('debería crearse', () => {
    expect(service).toBeTruthy();
  });

  it('debería crear una partida correctamente', () => {
    const result = service.startGame({
      size: 4,
      pits: 3,
      arrows: 2,
    });

    expect(result.errors).toEqual([]);
    expect(result.state).not.toBeNull();

    const state = result.state!;

    expect(state.board.length).toBe(4);
    expect(state.board[0].length).toBe(4);

    expect(state.playerPosition).toEqual({
      row: 0,
      col: 0,
    });

    expect(state.arrowsRemaining).toBe(2);
  });

  it('debería girar a la izquierda correctamente', () => {
    const result = service.startGame({
      size: 4,
      pits: 3,
      arrows: 2,
    });

    const initialState = result.state!;

    const newState = service.turnLeft(initialState);

    expect(newState.playerDirection).toBe(Direction.NORTH);

    expect(newState.playerPosition).toEqual({
      row: 0,
      col: 0,
    });
  });

  it('debería perder la partida al entrar en un pozo', () => {
    const state = createState();

    // Colocamos un pozo justo delante del jugador.
    state.board[0][1].hasPit = true;

    const newState = service.moveForward(state);

    expect(newState.status).toBe(GameStatus.LOST);

    expect(newState.playerPosition).toEqual({
      row: 0,
      col: 1,
    });
  });

  it('debería recoger el oro al entrar en su casilla', () => {
    const state = createState();

    // Colocamos el oro justo delante del jugador.
    state.board[0][1].hasGold = true;

    const newState = service.moveForward(state);

    expect(newState.hasGold).toBe(true);

    expect(newState.playerPosition).toEqual({
      row: 0,
      col: 1,
    });

    expect(newState.board[0][1].hasGold).toBe(false);
  });

  it('debería matar al Wumpus al disparar en su dirección', () => {
    const state = createState();

    // Colocamos al Wumpus justo delante del cazador.
    state.board[0][1].hasWumpus = true;

    const newState = service.shootArrow(state);

    expect(newState.wumpusAlive).toBe(false);
    expect(newState.arrowsRemaining).toBe(1);
  });

  it('debería detectar el brillo cuando el jugador está sobre el oro', () => {
    const state = createState();

    state.board[0][0].hasGold = true;

    const perceptions = service.getPerceptions(state);

    expect(perceptions).toContain('¡Ves un brillo!');
  });

  it('debería detectar el olor cuando el Wumpus está cerca', () => {
    const state = createState();

    state.board[0][1].hasWumpus = true;

    const perceptions = service.getPerceptions(state);

    expect(perceptions).toContain('Notas un olor desagradable.');
  });

  it('debería detectar la corriente de aire cuando hay un pozo cerca', () => {
    const state = createState();

    state.board[1][0].hasPit = true;

    const perceptions = service.getPerceptions(state);

    expect(perceptions).toContain('Notas una corriente de aire.');
  });

  it('debería añadir automáticamente las percepciones después de moverse', () => {
    const state = createState();

    // Colocamos un pozo junto a la siguiente casilla.
    state.board[1][1].hasPit = true;

    const newState = service.moveForward(state);

    expect(newState.playerPosition).toEqual({
      row: 0,
      col: 1,
    });

    expect(newState.messages).toContain('Notas una corriente de aire.');
  });

  it('debería ganar al salir con el oro', () => {
    const state = createState();

    state.hasGold = true;

    const newState = service.exitGame(state);

    expect(newState.status).toBe(GameStatus.WON);
  });

  it('no debería permitir salir sin el oro', () => {
    const state = createState();

    const newState = service.exitGame(state);

    expect(newState.status).toBe(GameStatus.PLAYING);
    expect(newState.messages).toContain('Necesitas encontrar el oro antes de salir.');
  });

  it('no debería permitir salir fuera de la casilla de salida', () => {
    const state = createState();

    state.playerPosition = { row: 1, col: 1 };
    state.hasGold = true;

    const newState = service.exitGame(state);

    expect(newState.status).toBe(GameStatus.PLAYING);
  });

  it('debería mostrar una sola corriente de aire con varios pozos adyacentes', () => {
    const { state } = service.startGame({
      size: 4,
      pits: 0,
      arrows: 3,
    });

    const testState = {
      ...state!,
      board: state!.board.map((row) => row.map((cell) => ({ ...cell }))),
    };

    testState.board[1][0].hasPit = true;
    testState.board[0][1].hasPit = true;

    const perceptions = service.getPerceptions(testState);

    expect(perceptions.filter((message) => message === 'Notas una corriente de aire.').length).toBe(
      1,
    );
  });

  it('debería exigir salir explícitamente al regresar con el oro', () => {
    const { state } = service.startGame({
      size: 4,
      pits: 0,
      arrows: 3,
    });

    const testState = {
      ...state!,
      playerPosition: { row: 0, col: 1 },
      playerDirection: Direction.WEST,
      hasGold: true,
    };

    const result = service.moveForward(testState);

    expect(result.playerPosition).toEqual({ row: 0, col: 0 });
    expect(result.status).toBe(GameStatus.PLAYING);

    const escaped = service.exitGame(result);
    expect(escaped.status).toBe(GameStatus.WON);
  });

  it('debería rechazar una configuración inválida', () => {
    const result = service.startGame({ size: 1, pits: -1, arrows: 0 });
    expect(result.state).toBeNull();
    expect(result.errors.length).toBe(3);
  });

  it('debería rechazar los pozos que no caben', () => {
    expect(service.startGame({ size: 2, pits: 2, arrows: 1 }).state).toBeNull();
  });

  it('debería mantener la posición al chocar con una pared', () => {
    const state = createState();
    state.playerDirection = Direction.NORTH;
    const result = service.moveForward(state);
    expect(result.playerPosition).toEqual(state.playerPosition);
    expect(result.messages).toContain('¡Bump! Has chocado contra una pared.');
  });

  it('no debería disparar sin flechas', () => {
    const state = createState();
    state.arrowsRemaining = 0;
    const result = service.shootArrow(state);
    expect(result.arrowsRemaining).toBe(0);
    expect(result.wumpusAlive).toBeTrue();
    expect(result.messages).toContain('No te quedan flechas.');
  });

  it('no debería permitir acciones después de terminar', () => {
    const state = createState();
    state.status = GameStatus.LOST;
    expect(service.moveForward(state)).toBe(state);
    expect(service.turnLeft(state)).toBe(state);
    expect(service.turnRight(state)).toBe(state);
    expect(service.shootArrow(state)).toBe(state);
    expect(service.exitGame(state)).toBe(state);
  });
});
