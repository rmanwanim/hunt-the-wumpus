export interface Position {
  row: number;
  col: number;
}

export enum Direction {
  NORTH = 'NORTH',
  EAST = 'EAST',
  SOUTH = 'SOUTH',
  WEST = 'WEST',
}

export enum GameStatus {
  PLAYING = 'PLAYING',
  WON = 'WON',
  LOST = 'LOST',
}

export interface Cell {
  hasPit: boolean;
  hasWumpus: boolean;
  hasGold: boolean;
  isExit: boolean;
}

export interface GameState {
  board: Cell[][];
  playerPosition: Position;
  playerDirection: Direction;
  status: GameStatus;
  arrowsRemaining: number;
  wumpusAlive: boolean;
  hasGold: boolean;
  messages: string[];
}

export interface GameConfig {
  size: number;
  pits: number;
  arrows: number;
}
