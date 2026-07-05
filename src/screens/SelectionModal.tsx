import React from 'react';
import styles from './SelectionModal.module.css';
import { useGame } from '../game/GameContext';

interface SelectionModalProps {
  playerId: number;
  onClose: () => void;
}

type TokenDef = {
  id: string;
  name: string;
  icon: string;
};

const TOKENS: TokenDef[] = [
  { id: 'rocket', name: '로켓', icon: '🚀' },
  { id: 'sailboat', name: '범선', icon: '⛵' },
  { id: 'car', name: '자동차', icon: '🚗' },
  { id: 'plane', name: '비행기', icon: '✈️' },
  { id: 'train', name: '기차', icon: '🚂' },
  { id: 'balloon', name: '열기구', icon: '🎈' },
];

const SelectionModal: React.FC<SelectionModalProps> = ({ playerId, onClose }) => {
  const { state, dispatch } = useGame();
  
  const currentPlayer = state.players.find(p => p.id === playerId);
  if (!currentPlayer) return null;

  // Find which tokens are already taken by OTHER players
  const takenTokens = state.players
    .filter(p => p.id !== playerId && p.tokenId)
    .map(p => p.tokenId as string);

  const handleSelect = (tokenId: string) => {
    if (takenTokens.includes(tokenId)) return; // already taken

    dispatch({ type: 'SET_PLAYER_TOKEN', payload: { playerId, tokenId } });
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
        
        <div className={styles.header}>
          <h2 className={styles.title}>플레이어 말 선택</h2>
          <div className={styles.currentPlayerBox}>
            <div className={styles.playerDot} style={{ backgroundColor: currentPlayer.color }} />
            <div className={styles.playerName}>{currentPlayer.name}</div>
          </div>
        </div>

        <div className={styles.grid}>
          {TOKENS.map((token) => {
            const isTaken = takenTokens.includes(token.id);
            const isMine = currentPlayer.tokenId === token.id;
            const isDisabled = isTaken;

            return (
              <div 
                key={token.id} 
                className={`${styles.tokenCard} ${isDisabled ? styles.disabled : ''} ${isMine ? styles.selected : ''}`}
                onClick={() => handleSelect(token.id)}
              >
                {isDisabled && <div className={styles.takenBadge}>선택 불가</div>}
                {isMine && <div className={styles.myBadge}>선택됨</div>}
                <div className={styles.tokenIcon}>{token.icon}</div>
                <div className={styles.tokenName}>{token.name}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SelectionModal;
