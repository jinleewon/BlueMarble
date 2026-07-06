import React, { useEffect } from 'react';
import { useGame } from '../game/GameContext';
import styles from './PropertyDeedModal.module.css';

const DeedResultModal: React.FC = () => {
  const { state, dispatch } = useGame();

  const myPlayerId = Number(localStorage.getItem('myPlayerId'));
  const isMyTurn = state.players[state.currentPlayerIndex]?.id === myPlayerId;

  useEffect(() => {
    // Only the active player dispatches the automatic END_TURN to prevent duplicate actions
    if (!isMyTurn) return;
    if (state.turnPhase !== 'property_deed_result') return;

    const timer = setTimeout(() => {
      dispatch({ type: 'END_TURN' });
    }, 3000); // 3 seconds delay before ending turn

    return () => clearTimeout(timer);
  }, [dispatch, isMyTurn, state.turnPhase]);

  if (state.turnPhase !== 'property_deed_result' || state.lastPurchasedTileId === undefined || state.lastPurchasedTileId === null) {
    return null;
  }

  const tile = state.board[state.lastPurchasedTileId];
  if (!tile) return null;

  const owner = state.players.find(p => p.id === tile.ownerId);
  const isMyPurchase = owner?.id === myPlayerId;

  return (
    <div className={styles.overlay} style={{ zIndex: 1000 }}>
      <div className={styles.modal} style={{ animation: 'popIn 0.5s ease-out' }}>
        <h2 className={styles.title}>부동산 증서 발급 완료</h2>
        <div style={{ textAlign: 'center', margin: '10px 0', fontSize: '18px', fontWeight: 'bold', color: isMyPurchase ? '#10B981' : '#3B82F6' }}>
          {owner?.name}님이 {tile.name}에 투자하셨습니다! 🎉
        </div>
        
        <div className={styles.deedContainer}>
          <div className={styles.deedHeader}>
            <div className={styles.deedType}>{tile.type === 'city' ? 'CITY DEED' : 'RESORT DEED'}</div>
            <div className={styles.deedCity}>{tile.name}</div>
          </div>
          <div className={styles.deedBody}>
            <div className={styles.deedRow}>
              <span>대지 가격</span>
              <span>{tile.price?.toLocaleString()}원</span>
            </div>
            {(tile.villas || 0) > 0 && (
              <div className={styles.deedRow}>
                <span>별장 ({tile.villas}개)</span>
                <span>{((tile.villaPrice || 0) * tile.villas!).toLocaleString()}원</span>
              </div>
            )}
            {(tile.buildings || 0) > 0 && (
              <div className={styles.deedRow}>
                <span>빌딩 ({tile.buildings}개)</span>
                <span>{((tile.buildingPrice || 0) * tile.buildings!).toLocaleString()}원</span>
              </div>
            )}
            {(tile.hotels || 0) > 0 && (
              <div className={styles.deedRow}>
                <span>호텔 ({tile.hotels}개)</span>
                <span>{((tile.hotelPrice || 0) * tile.hotels!).toLocaleString()}원</span>
              </div>
            )}
            <hr className={styles.divider} />
            <div className={styles.deedRow} style={{ fontWeight: 'bold' }}>
              <span>소유주</span>
              <span style={{ color: owner?.color }}>{owner?.name}</span>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', color: '#6b7280', fontSize: '14px' }}>
          잠시 후 다음 턴으로 넘어갑니다...
        </div>
      </div>
    </div>
  );
};

export default DeedResultModal;
