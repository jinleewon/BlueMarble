import { describe, it, expect } from 'vitest';
import { gameReducer, INITIAL_STATE } from './reducer';
import type { GameState } from './types';

describe('Game Reducer - Bankruptcy and Property Selling', () => {
  it('should transition to insolvent phase when cannot afford toll', () => {
    const initialState: GameState = {
      ...INITIAL_STATE,
      players: [
        { ...INITIAL_STATE.players[0], id: 1, cash: 1000 },
        { ...INITIAL_STATE.players[0], id: 2, name: 'Player 2', cash: 5000000 }
      ],
      board: [
        { ...INITIAL_STATE.board[0], id: 0, type: 'start' },
        { ...INITIAL_STATE.board[1], id: 1, type: 'city', ownerId: 2, toll: [5000, 0, 0, 0] }
      ],
      currentPlayerIndex: 0,
      turnPhase: 'action'
    };

    const action = { type: 'PAY_TOLL', payload: { tileId: 1, amount: 5000, ownerId: 2 } } as const;
    const nextState = gameReducer(initialState, action);

    expect(nextState.turnPhase).toBe('insolvent');
    expect(nextState.pendingPayment).toEqual({ amount: 5000, to: 2, reason: '통행료' });
  });

  it('should sell property and increase cash', () => {
    const initialState: GameState = {
      ...INITIAL_STATE,
      players: [
        { ...INITIAL_STATE.players[0], id: 1, cash: 1000 }
      ],
      board: [
        { ...INITIAL_STATE.board[0], id: 0, type: 'start' },
        { ...INITIAL_STATE.board[1], id: 1, type: 'city', price: 10000, ownerId: 1, villas: 1, villaPrice: 5000, buildings: 0, hotels: 0 }
      ],
      currentPlayerIndex: 0,
      turnPhase: 'insolvent'
    };

    const action = { type: 'SELL_PROPERTY', payload: { tileId: 1 } } as const;
    const nextState = gameReducer(initialState, action);

    // Initial price 10000, villa 5000. Total value 15000. Sell value = 7500.
    // Cash should be 1000 + 7500 = 8500
    expect(nextState.players[0].cash).toBe(8500);
    expect(nextState.board[1].ownerId).toBeNull();
    expect(nextState.board[1].villas).toBe(0);
  });

  it('should set player inactive and clear properties on bankruptcy', () => {
    const initialState: GameState = {
      ...INITIAL_STATE,
      players: [
        { ...INITIAL_STATE.players[0], id: 1, cash: 1000, isActive: true },
        { ...INITIAL_STATE.players[0], id: 2, name: 'Player 2', cash: 5000000, isActive: true }
      ],
      board: [
        { ...INITIAL_STATE.board[0], id: 0, type: 'start' },
        { ...INITIAL_STATE.board[1], id: 1, type: 'city', ownerId: 1, price: 10000 }
      ],
      currentPlayerIndex: 0,
      turnPhase: 'insolvent'
    };

    const action = { type: 'DECLARE_BANKRUPTCY' } as const;
    const nextState = gameReducer(initialState, action);

    expect(nextState.players[0].isActive).toBe(false);
    expect(nextState.players[0].cash).toBe(0);
    expect(nextState.board[1].ownerId).toBeNull();
  });

  it('should skip bankrupt players when ending turn', () => {
    const initialState: GameState = {
      ...INITIAL_STATE,
      players: [
        { ...INITIAL_STATE.players[0], id: 1, isActive: true },
        { ...INITIAL_STATE.players[0], id: 2, isActive: false },
        { ...INITIAL_STATE.players[0], id: 3, isActive: true }
      ],
      currentPlayerIndex: 0,
      turnPhase: 'action'
    };

    const action = { type: 'END_TURN' } as const;
    const nextState = gameReducer(initialState, action);

    // Should skip player 2 (index 1) and go to player 3 (index 2)
    expect(nextState.currentPlayerIndex).toBe(2);
  });
});
