import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import type { GameState, GameAction } from './types';
import { INITIAL_STATE, gameReducer } from './reducer';

// Connect to local server for testing. Change this to the hosted server URL in production.
const SOCKET_URL = `http://${window.location.hostname}:3001`;
export const socket: Socket = io(SOCKET_URL);

interface GameContextProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  dispatchSync: (action: GameAction) => void;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);

  useEffect(() => {
    // Listen for actions from other players
    const handleActionDispatched = (action: GameAction) => {
      dispatch(action);
    };

    // Listen for full state sync (e.g. when joining a room)
    const handleStateUpdated = (newState: GameState) => {
      // Need a special action to set the entire state, or we can just bypass the reducer
      // We will add a 'SYNC_STATE' action to the reducer
      dispatch({ type: 'SYNC_STATE', payload: newState } as any);
    };

    const handleRequestStateSync = () => {
      // Send current state to the server so it can be relayed to the new player
      const roomCode = localStorage.getItem('blueMarbleRoomCode');
      if (roomCode) {
        socket.emit('sync_state', { roomCode, state });
        
        // Host adds the new player locally, which will then broadcast ADD_PLAYER to the guest
        if (state.players.length < 4) {
          dispatchSync({ 
            type: 'ADD_PLAYER', 
            payload: { 
              name: `Player ${state.players.length + 1}`, 
              color: ['#3B82F6', '#10B981', '#F59E0B'][state.players.length - 1] 
            }
          });
        }
      }
    };

    socket.on('action_dispatched', handleActionDispatched);
    socket.on('state_updated', handleStateUpdated);
    socket.on('request_state_sync', handleRequestStateSync);

    return () => {
      socket.off('action_dispatched', handleActionDispatched);
      socket.off('state_updated', handleStateUpdated);
      socket.off('request_state_sync', handleRequestStateSync);
    };
  }, [state]);

  const dispatchSync = (action: GameAction) => {
    // 1. Apply locally
    dispatch(action);
    // 2. Broadcast to others
    const roomCode = localStorage.getItem('blueMarbleRoomCode');
    if (roomCode) {
      socket.emit('dispatch_action', { roomCode, action });
    }
  };

  return (
    <GameContext.Provider value={{ state, dispatch: dispatchSync, dispatchSync }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
