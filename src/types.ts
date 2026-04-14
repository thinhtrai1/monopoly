export type SpaceType =
  | "GO"
  | "PROPERTY"
  | "CHANCE"
  | "CHEST"
  | "TAX"
  | "RAILROAD"
  | "UTILITY"
  | "JAIL"
  | "FREE_PARKING"
  | "GO_TO_JAIL";

export interface Space {
  id: number;
  name: string;
  type: SpaceType;
  price?: number;
  rent?: number[];
  color?: string;
  ownerId?: string | null;
  houses?: number;
  housePrice?: number;
}

export interface Player {
  id: string;
  name: string;
  isBot: boolean;
  money: number;
  position: number;
  color: string;
  inJail: boolean;
  jailTurns: number;
  bankrupt: boolean;
}

export type GamePhase = "ROLL" | "ACTION" | "END_TURN" | "GAME_OVER";

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  spaces: Space[];
  phase: GamePhase;
  dice: [number, number];
  message: string;
  logs: string[];
}
