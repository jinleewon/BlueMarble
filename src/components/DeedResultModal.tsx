import React, { useEffect } from 'react';
import { useGame } from '../game/GameContext';
import styles from './PropertyDeedModal.module.css';
import { getTileColor, getTileCountry, getTileImage } from './PropertyDeedModal';

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
    }, 3500); // 3.5 seconds delay before ending turn

    return () => clearTimeout(timer);
  }, [dispatch, isMyTurn, state.turnPhase]);

  if (state.turnPhase !== 'property_deed_result' || state.lastPurchasedTileId === undefined || state.lastPurchasedTileId === null) {
    return null;
  }

  const tile = state.board[state.lastPurchasedTileId];
  if (!tile) return null;

  const owner = state.players.find(p => p.id === tile.ownerId);
  const isMyPurchase = owner?.id === myPlayerId;

  const bgColor = getTileColor(state.lastPurchasedTileId);
  const country = getTileCountry(state.lastPurchasedTileId);
  const imagePath = getTileImage(tile.name);
  const hasBuildings = tile.villaPrice !== undefined;

  const formatAmount = (amount: number) => {
    if (amount >= 10000) {
      const man = amount / 10000;
      return `₩${Number.isInteger(man) ? man : man.toFixed(1)}만`;
    }
    return `₩${amount.toLocaleString()}`;
  };

  return (
    <div className={styles.overlay} style={{ zIndex: 1000, flexDirection: 'column' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px', fontSize: '24px', fontWeight: 'bold', color: isMyPurchase ? '#10B981' : '#3B82F6', animation: 'fadeIn 0.5s ease-out' }}>
        {owner?.name}님이 {tile.name}에 투자하셨습니다! 🎉
      </div>
      
      <div className={styles.modalContainer} style={{ animation: 'fadeIn 0.5s ease-out' }}>
        <div className={styles.modal}>
          {/* Header Banner */}
          <div className={styles.headerBanner} style={{ backgroundColor: bgColor }}>
            <div className={styles.cityName}>{tile.name}</div>
            <div className={styles.countryName}>{country}</div>
          </div>
          
          {/* Landmark Visual */}
          {imagePath ? (
            <img src={imagePath} alt={tile.name} className={styles.landmarkImage} />
          ) : (
            <div className={styles.landmarkVisual} />
          )}
          
          {/* Card Body */}
          <div className={styles.cardBody}>
            <div className={styles.purchasePriceBox}>
              <div className={styles.purchaseLabel}>Purchase Price</div>
              <div className={styles.purchaseAmount}>{formatAmount(tile.price || 0)}</div>
            </div>
            
            <div className={styles.divider} />
            
            <div className={styles.rentTable}>
              <div className={styles.rentRow}>
                <div className={styles.rentLabel}>{hasBuildings ? '빈 땅 (Base)' : '이용 요금 (Usage Fee)'}</div>
                <div className={styles.rentAmount}>{formatAmount(tile.toll?.[0] || 0)}</div>
              </div>
              
              {hasBuildings && (
                <>
                  <div className={styles.rentRow}>
                    <div className={styles.rentLabel}>별장 (Villa)</div>
                    <div className={styles.rentAmount}>{formatAmount(tile.toll?.[1] || 0)}</div>
                  </div>
                  <div className={styles.rentRow}>
                    <div className={styles.rentLabel}>빌딩 (Building)</div>
                    <div className={styles.rentAmount}>{formatAmount(tile.toll?.[2] || 0)}</div>
                  </div>
                  <div className={styles.rentRow}>
                    <div className={styles.rentLabel}>호텔 (Hotel)</div>
                    <div className={styles.rentAmount}>{formatAmount(tile.toll?.[3] || 0)}</div>
                  </div>
                </>
              )}
            </div>
            
            {/* Card Footer */}
            <div className={styles.cardFooter}>
              <div className={styles.brandLeft}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
                BLUE MARBLE
              </div>
              <div>SEED NOVEL</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px', color: '#e5e7eb', fontSize: '14px', animation: 'fadeIn 0.5s ease-out' }}>
        잠시 후 다음 턴으로 넘어갑니다...
      </div>
    </div>
  );
};

export default DeedResultModal;
