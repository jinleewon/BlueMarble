export type PlayerId = number;

export interface Player {
  id: PlayerId;
  name: string;
  color: string;
  cash: number;
  position: number; // 0 to 39
  isActive: boolean; // false if bankrupt
  isInIsland: boolean;
  islandTurnsLeft: number;
  isSpaceTravel: boolean;
  hasEscapeCard?: boolean;
  hasExemptionCard?: boolean;
  tokenId?: string;
  loanAmount: number;
  loanTurnsLeft: number;
  hasPassedStart: boolean;
}

export type TileType = 
  | 'start' 
  | 'city' 
  | 'island' 
  | 'fund_donate' 
  | 'fund_receive' 
  | 'space_travel' 
  | 'chance' 
  | 'tax';

export interface Tile {
  id: number;
  name: string;
  type: TileType;
  price?: number;
  toll?: number[]; // [land_only, 1_villa, 1_building, 1_hotel]
  villaPrice?: number;
  buildingPrice?: number;
  hotelPrice?: number;
  ownerId?: PlayerId | null;
  villas?: number;
  buildings?: number;
  hotels?: number;
}

export type TurnPhase = 'pre_roll' | 'roll' | 'move' | 'action' | 'chance_card' | 'insolvent' | 'idle' | 'island_fail' | 'property_deed_result';

export interface ChanceCard {
  id: string;
  title: string;
  description: string;
  type: 'special' | 'movement' | 'income' | 'expense';
  action: any; // specific action payload
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  board: Tile[];
  diceResult: [number, number] | null;
  doubleCount: number;
  fundBalance: number;
  turnPhase: TurnPhase;
  messageLog: string[];
  chanceDeck: ChanceCard[];
  activeChanceCard?: ChanceCard | null;
  pendingPayment?: { amount: number; to: number | 'bank'; reason: string } | null;
  lastMovementType?: 'forward' | 'backward' | 'teleport';
  lastPurchasedTileId?: number | null;
}

export type GameAction =
  | { type: 'ROLL_DICE' }
  | { type: 'MOVE_PLAYER'; payload: { steps: number } }
  | { type: 'SPACE_TRAVEL_MOVE'; payload: { targetTileId: number } }
  | { type: 'BUY_PROPERTY'; payload: { tileId: number; buyLand: boolean; buyVilla: boolean; buyBuilding: boolean; buyHotel: boolean; cost: number } }
  | { type: 'FINISH_PROPERTY_RESULT' }
  | { type: 'PAY_TOLL'; payload: { tileId: number; amount: number; ownerId: number } }
  | { type: 'FUND_DONATE'; payload: { amount: number } }
  | { type: 'FUND_RECEIVE' }
  | { type: 'DRAW_CHANCE_CARD' }
  | { type: 'APPLY_CHANCE_CARD' }
  | { type: 'END_TURN' }
  | { type: 'START_GAME' }
  | { type: 'FINISH_PRE_ROLL' }
  | { type: 'TAKE_LOAN' }
  | { type: 'REPAY_LOAN' }
  | { type: 'SELL_PROPERTY'; payload: { tileId: number } }
  | { type: 'TRANSFER_PROPERTY'; payload: { tileId: number; toPlayerId: number } }
  | { type: 'DECLARE_BANKRUPTCY' }
  | { type: 'PAY_PENDING' }
  | { type: 'SET_PLAYER_TOKEN'; payload: { playerId: number, tokenId: string } }
  | { type: 'ADD_PLAYER'; payload: { name: string, color: string } }
  | { type: 'ADD_MESSAGE'; payload: string }
  | { type: 'USE_ESCAPE_CARD' }
  | { type: 'USE_EXEMPTION_CARD' };
