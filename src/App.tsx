import React, { useState, useEffect } from 'react';
import { GameProvider, useGame } from './game/GameContext';
import Board from './components/Board';
import Sidebar from './components/Sidebar';
import DiceOverlay from './components/DiceOverlay';
import ActionModal from './components/ActionModal';
import ChanceModal from './components/ChanceModal';
import InsolventModal from './components/InsolventModal';
import DeedResultModal from './components/DeedResultModal';
import GameOverScreen from './components/GameOverScreen';
import HomeScreen from './screens/HomeScreen';
import LobbyScreen from './screens/LobbyScreen';
import RulesScreen from './screens/RulesScreen';
import './index.css';

// We manage screen state here
export type AppScreen = 'HOME' | 'LOBBY' | 'GAME' | 'RULES';

const MainApp: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('HOME');
  const { state, dispatch } = useGame();

  // Watch for game start (by host) to navigate guests automatically
  useEffect(() => {
    if (state.turnPhase !== 'idle' && currentScreen === 'LOBBY') {
      setCurrentScreen('GAME');
    }
  }, [state.turnPhase, currentScreen]);

  const isMyTurn = state.players[state.currentPlayerIndex]?.id === Number(localStorage.getItem('myPlayerId'));

  // Watch for dice roll and trigger move after delay
  useEffect(() => {
    if (!isMyTurn) return; // Only active player's client dispatches automatic events

    if (state.turnPhase === 'move' && state.diceResult) {
      const sum = state.diceResult[0] + state.diceResult[1];
      const timer = setTimeout(() => {
        dispatch({ type: 'MOVE_PLAYER', payload: { steps: sum } });
      }, 2500); // 1s roll + 1.5s result view
      return () => clearTimeout(timer);
    } else if (state.turnPhase === 'island_fail' && state.diceResult) {
      const timer = setTimeout(() => {
        dispatch({ type: 'END_TURN' });
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [state.turnPhase, state.diceResult, dispatch, isMyTurn]);

  const renderGame = () => (
    <div style={{ 
      display: 'flex', 
      width: '100%', 
      height: '100%', 
      padding: '40px', 
      justifyContent: 'center', 
      alignItems: 'center',
      gap: '40px'
    }}>
      <Sidebar />
      
      {/* Dice overlay */}
      {(state.turnPhase === 'move' || state.turnPhase === 'island_fail') && state.diceResult && <DiceOverlay result={state.diceResult} />}
      
      {/* Action modal for buying/toll */}
      {state.turnPhase === 'action' && <ActionModal tileId={state.players[state.currentPlayerIndex].position} />}
      
      {/* Chance modal */}
      {state.turnPhase === 'chance_card' && <ChanceModal />}

      {/* Insolvent modal */}
      {state.turnPhase === 'insolvent' && <InsolventModal />}

      {/* Property Deed Result modal */}
      {state.turnPhase === 'property_deed_result' && <DeedResultModal />}
      
      <Board />
    </div>
  );

  return (
    <>
      {state.turnPhase === 'game_over' ? (
        <GameOverScreen />
      ) : (
        <>
          {currentScreen === 'HOME' && <HomeScreen onStart={() => setCurrentScreen('LOBBY')} onRules={() => setCurrentScreen('RULES')} />}
          {currentScreen === 'RULES' && <RulesScreen onBack={() => setCurrentScreen('HOME')} />}
          {currentScreen === 'LOBBY' && <LobbyScreen onBack={() => setCurrentScreen('HOME')} onPlay={() => setCurrentScreen('GAME')} />}
          {currentScreen === 'GAME' && renderGame()}
        </>
      )}
    </>
  );
};

function App() {
  return (
    <GameProvider>
      <MainApp />
    </GameProvider>
  );
}

export default App;
