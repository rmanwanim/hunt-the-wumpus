import { Injectable } from '@angular/core';
import {
  Cell,
  Direction,
  GameState,
  GameStatus,
  Position,
  GameConfig,
} from '../models/game.models';

@Injectable({
  providedIn: 'root',
})
export class GameEngine {
  private createEmptyBoard(size: number): Cell[][] {
    return Array.from({ length: size }, () =>
      Array.from({ length: size }, () => ({
        hasPit: false,
        hasWumpus: false,
        hasGold: false,
        isExit: false,
      })),
    );
  }

  validateConfig(config: GameConfig): string[] {
    const errors: string[] = [];

    if (!Number.isInteger(config.size) || config.size < 2) {
      errors.push('El tamaño del tablero debe ser un número entero igual o superior a 2.');
    }

    if (!Number.isInteger(config.pits) || config.pits < 0) {
      errors.push('El número de pozos debe ser un entero igual o superior a 0.');
    }

    if (!Number.isInteger(config.arrows) || config.arrows < 1) {
      errors.push('Debe haber al menos una flecha disponible.');
    }

    if (
      Number.isInteger(config.size) &&
      config.size >= 2 &&
      Number.isInteger(config.pits) &&
      config.pits >= 0
    ) {
      const availableCells = config.size * config.size - 3;

      if (config.pits > availableCells) {
        errors.push(
          'Hay demasiados pozos para el tamaño del tablero. No hay espacio suficiente para todos los elementos.',
        );
      }
    }

    return errors;
  }

  startGame(config: GameConfig): {
    state: GameState | null;
    errors: string[];
  } {
    const errors = this.validateConfig(config);

    if (errors.length > 0) {
      return {
        state: null,
        errors,
      };
    }

    const board = this.createEmptyBoard(config.size);

    board[0][0].isExit = true;

    const availablePositions: Position[] = [];

    for (let row = 0; row < config.size; row++) {
      for (let col = 0; col < config.size; col++) {
        if (row !== 0 || col !== 0) {
          availablePositions.push({ row, col });
        }
      }
    }

    // Retirar la posición evita que los elementos se solapen.
    const takeRandomPosition = (): Position => {
      const index = Math.floor(Math.random() * availablePositions.length);

      return availablePositions.splice(index, 1)[0];
    };

    const wumpusPosition = takeRandomPosition();
    board[wumpusPosition.row][wumpusPosition.col].hasWumpus = true;

    const goldPosition = takeRandomPosition();
    board[goldPosition.row][goldPosition.col].hasGold = true;

    for (let i = 0; i < config.pits; i++) {
      const pitPosition = takeRandomPosition();
      board[pitPosition.row][pitPosition.col].hasPit = true;
    }

    const state: GameState = {
      board,
      playerPosition: { row: 0, col: 0 },
      playerDirection: Direction.EAST,
      status: GameStatus.PLAYING,
      arrowsRemaining: config.arrows,
      wumpusAlive: true,
      hasGold: false,
      messages: ['La partida ha comenzado.'],
    };

    return {
      state,
      errors: [],
    };
  }

  moveForward(state: GameState): GameState {
    if (state.status !== GameStatus.PLAYING) {
      return state;
    }

    let nextRow = state.playerPosition.row;
    let nextCol = state.playerPosition.col;

    switch (state.playerDirection) {
      case Direction.NORTH:
        nextRow--;
        break;

      case Direction.EAST:
        nextCol++;
        break;

      case Direction.SOUTH:
        nextRow++;
        break;

      case Direction.WEST:
        nextCol--;
        break;
    }

    if (
      nextRow < 0 ||
      nextRow >= state.board.length ||
      nextCol < 0 ||
      nextCol >= state.board[nextRow]?.length
    ) {
      return {
        ...state,
        messages: [...state.messages, '¡Bump! Has chocado contra una pared.'],
      };
    }

    const nextCell = state.board[nextRow][nextCol];

    if (nextCell.hasPit) {
      return {
        ...state,
        playerPosition: { row: nextRow, col: nextCol },
        status: GameStatus.LOST,
        messages: [...state.messages, '¡Has caído en un pozo! Fin de la partida.'],
      };
    }

    if (nextCell.hasWumpus && state.wumpusAlive) {
      return {
        ...state,
        playerPosition: { row: nextRow, col: nextCol },
        status: GameStatus.LOST,
        messages: [...state.messages, '¡El Wumpus te ha atrapado! Fin de la partida.'],
      };
    }

    if (nextCell.hasGold) {
      return this.addPerceptions({
        ...state,
        playerPosition: { row: nextRow, col: nextCol },
        hasGold: true,
        board: state.board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            if (rowIndex === nextRow && colIndex === nextCol) {
              return {
                ...cell,
                hasGold: false,
              };
            }
            return cell;
          }),
        ),
        messages: [...state.messages, '¡Has encontrado el oro!'],
      });
    }

    return this.addPerceptions({
      ...state,
      playerPosition: { row: nextRow, col: nextCol },
      messages: [...state.messages, 'Has avanzado una casilla.'],
    });
  }

  turnLeft(state: GameState): GameState {
    if (state.status !== GameStatus.PLAYING) {
      return state;
    }

    let newDirection: Direction;

    switch (state.playerDirection) {
      case Direction.NORTH:
        newDirection = Direction.WEST;
        break;

      case Direction.WEST:
        newDirection = Direction.SOUTH;
        break;

      case Direction.SOUTH:
        newDirection = Direction.EAST;
        break;

      case Direction.EAST:
        newDirection = Direction.NORTH;
        break;
    }

    return {
      ...state,
      playerDirection: newDirection,
      messages: [...state.messages, 'Has girado a la izquierda.'],
    };
  }

  turnRight(state: GameState): GameState {
    if (state.status !== GameStatus.PLAYING) {
      return state;
    }

    let newDirection: Direction;

    switch (state.playerDirection) {
      case Direction.NORTH:
        newDirection = Direction.EAST;
        break;

      case Direction.EAST:
        newDirection = Direction.SOUTH;
        break;

      case Direction.SOUTH:
        newDirection = Direction.WEST;
        break;

      case Direction.WEST:
        newDirection = Direction.NORTH;
        break;
    }

    return {
      ...state,
      playerDirection: newDirection,
      messages: [...state.messages, 'Has girado a la derecha.'],
    };
  }

  shootArrow(state: GameState): GameState {
    if (state.status !== GameStatus.PLAYING) {
      return state;
    }

    if (state.arrowsRemaining <= 0) {
      return {
        ...state,
        messages: [...state.messages, 'No te quedan flechas.'],
      };
    }

    let row = state.playerPosition.row;
    let col = state.playerPosition.col;

    while (true) {
      switch (state.playerDirection) {
        case Direction.NORTH:
          row--;
          break;

        case Direction.EAST:
          col++;
          break;

        case Direction.SOUTH:
          row++;
          break;

        case Direction.WEST:
          col--;
          break;
      }

      if (row < 0 || row >= state.board.length || col < 0 || col >= state.board[row]?.length) {
        return {
          ...state,
          arrowsRemaining: state.arrowsRemaining - 1,
          messages: [...state.messages, 'La flecha ha chocado contra una pared.'],
        };
      }

      const cell = state.board[row][col];

      if (cell.hasWumpus && state.wumpusAlive) {
        return this.addPerceptions({
          ...state,
          wumpusAlive: false,
          arrowsRemaining: state.arrowsRemaining - 1,
          messages: [...state.messages, '¡Has matado al Wumpus! ¡Se escucha un grito!'],
        });
      }
    }
  }

  getPerceptions(state: GameState): string[] {
    const perceptions: string[] = [];
    const { row, col } = state.playerPosition;
    const currentCell = state.board[row][col];

    if (currentCell.hasGold) {
      perceptions.push('¡Ves un brillo!');
    }

    if (currentCell.hasWumpus && state.wumpusAlive) {
      perceptions.push('¡El Wumpus está aquí!');
    }

    const adjacentPositions = [
      { row: row - 1, col },
      { row: row + 1, col },
      { row, col: col - 1 },
      { row, col: col + 1 },
    ];

    let hasWumpusNearby = false;
    let hasPitNearby = false;

    for (const position of adjacentPositions) {
      if (
        position.row < 0 ||
        position.row >= state.board.length ||
        position.col < 0 ||
        position.col >= state.board[position.row].length
      ) {
        continue;
      }

      const cell = state.board[position.row][position.col];

      if (cell.hasWumpus && state.wumpusAlive) {
        hasWumpusNearby = true;
      }

      if (cell.hasPit) {
        hasPitNearby = true;
      }
    }

    if (hasWumpusNearby) {
      perceptions.push('Notas un olor desagradable.');
    }

    if (hasPitNearby) {
      perceptions.push('Notas una corriente de aire.');
    }

    return perceptions;
  }

  private addPerceptions(state: GameState): GameState {
    const perceptions = this.getPerceptions(state);

    return {
      ...state,
      messages: [...state.messages, ...perceptions],
    };
  }

  exitGame(state: GameState): GameState {
    if (state.status !== GameStatus.PLAYING) {
      return state;
    }

    const { row, col } = state.playerPosition;
    const currentCell = state.board[row][col];

    if (!currentCell.isExit) {
      return {
        ...state,
        messages: [...state.messages, 'No puedes salir: no estás en la casilla de salida.'],
      };
    }

    if (!state.hasGold) {
      return {
        ...state,
        messages: [...state.messages, 'Necesitas encontrar el oro antes de salir.'],
      };
    }

    return {
      ...state,
      status: GameStatus.WON,
      messages: [...state.messages, '¡Enhorabuena! Has escapado con el oro. ¡Has ganado!'],
    };
  }
}
