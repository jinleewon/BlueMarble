import React, { useState } from 'react';
import styles from './ActionModal.module.css';
import { useGame } from '../game/GameContext';

interface ActionModalProps {
  tileId: number;
}

const ActionModal: React.FC<ActionModalProps> = ({ tileId }) => {
  const { state, dispatch } = useGame();
  
  const tile = state.board[tileId];
  const currentPlayer = state.players[state.currentPlayerIndex];
  
  // Local state for checkboxes when buying
  const [buyLand] = useState(!tile.ownerId); // Must buy land if not owned
  const [buyVilla, setBuyVilla] = useState(false);
  const [buyBuilding, setBuyBuilding] = useState(false);
  const [buyHotel, setBuyHotel] = useState(false);

  if (!tile) return null;

  const handleEndTurn = () => {
    dispatch({ type: 'END_TURN' });
  };

  const handleBuy = () => {
    const cost = 
      (buyLand ? tile.price || 0 : 0) +
      (buyVilla ? tile.villaPrice || 0 : 0) +
      (buyBuilding ? tile.buildingPrice || 0 : 0) +
      (buyHotel ? tile.hotelPrice || 0 : 0);

    dispatch({ 
      type: 'BUY_PROPERTY', 
      payload: { tileId, buyLand, buyVilla, buyBuilding, buyHotel, cost } 
    });
    handleEndTurn();
  };

  const formatMoney = (amount: number) => {
    return amount >= 10000 ? `${amount / 10000}만` : amount;
  };

  // Special tiles (Start, Island, Space, Chance, Fund)
  React.useEffect(() => {
    if (tile && (tile.type === 'chance' || tile.type === 'start')) {
      dispatch({ type: 'END_TURN' });
    }
  }, [tile, dispatch]);

  if (tile.type === 'chance' || tile.type === 'start') {
    return null;
  }

  if (tile.type !== 'city') {
    let subtitle = '특수 지역에 도착했습니다.';
    if (tile.id === 20) subtitle = '모인 사회복지기금을 전액 수령했습니다!';
    else if (tile.id === 38) subtitle = '사회복지기금 15만원을 납부했습니다.';
    else if (tile.id === 10) subtitle = '무인도에 갇혔습니다! (3턴간 고립)';
    else if (tile.id === 30) subtitle = '다음 턴에 원하는 곳으로 우주여행을 떠납니다!';

    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.header}>
            <h2 className={styles.title}>{tile.name}</h2>
            <p className={styles.subtitle}>{subtitle}</p>
          </div>
          <div className={styles.actions}>
            <button className={`${styles.btn} ${styles.btnBuy}`} onClick={handleEndTurn}>
              확인
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate total cost selected
  const totalCost = 
    (buyLand && !tile.ownerId ? tile.price || 0 : 0) +
    (buyVilla ? tile.villaPrice || 0 : 0) +
    (buyBuilding ? tile.buildingPrice || 0 : 0) +
    (buyHotel ? tile.hotelPrice || 0 : 0);

  const canAfford = currentPlayer.cash >= totalCost;

  // Is it unowned or owned by me?
  if (tile.ownerId === undefined || tile.ownerId === currentPlayer.id) {
    const isMine = tile.ownerId === currentPlayer.id;
    
    // Check what is already built
    const hasVilla = tile.villas && tile.villas > 0;
    const hasBuilding = tile.buildings && tile.buildings > 0;
    const hasHotel = tile.hotels && tile.hotels > 0;

    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.header}>
            <h2 className={styles.title}>{tile.name}</h2>
            <p className={styles.subtitle}>{isMine ? '추가 건물을 건설하시겠습니까?' : '이 땅을 구매하시겠습니까?'}</p>
          </div>

          <div className={styles.card}>
            {!isMine && (
              <div className={styles.row}>
                <label className={styles.label}>
                  <input type="checkbox" checked={buyLand} disabled /> 대지
                </label>
                <div className={styles.price}>{formatMoney(tile.price || 0)}원</div>
              </div>
            )}
            
            {currentPlayer.hasPassedStart ? (
              <>
                {tile.villaPrice && !hasVilla && (
                  <div className={styles.row}>
                    <label className={styles.label}>
                      <input type="checkbox" checked={buyVilla} onChange={(e) => setBuyVilla(e.target.checked)} /> 별장
                    </label>
                    <div className={styles.price}>{formatMoney(tile.villaPrice)}원</div>
                  </div>
                )}
                
                {tile.buildingPrice && !hasBuilding && (
                  <div className={styles.row}>
                    <label className={styles.label}>
                      <input type="checkbox" checked={buyBuilding} onChange={(e) => setBuyBuilding(e.target.checked)} /> 빌딩
                    </label>
                    <div className={styles.price}>{formatMoney(tile.buildingPrice)}원</div>
                  </div>
                )}
                
                {tile.hotelPrice && !hasHotel && (
                  <div className={styles.row}>
                    <label className={styles.label}>
                      <input type="checkbox" checked={buyHotel} onChange={(e) => setBuyHotel(e.target.checked)} /> 호텔
                    </label>
                    <div className={styles.price}>{formatMoney(tile.hotelPrice)}원</div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', color: '#ef4444', fontSize: '13px', margin: '12px 0', fontWeight: 'bold' }}>
                첫 바퀴에는 건물 건설이 불가합니다.
              </div>
            )}

            <div className={styles.totalRow}>
              <div className={styles.totalLabel}>총 결제 금액</div>
              <div className={styles.totalPrice}>{formatMoney(totalCost)}원</div>
            </div>
          </div>

          <div className={styles.actions}>
            <button className={`${styles.btn} ${styles.btnPass}`} onClick={handleEndTurn}>
              패스
            </button>
            <button 
              className={`${styles.btn} ${styles.btnBuy}`} 
              onClick={handleBuy}
              disabled={!canAfford || totalCost === 0}
            >
              구매하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Owned by someone else -> Pay Toll
  if (tile.ownerId !== currentPlayer.id) {
    const owner = state.players.find(p => p.id === tile.ownerId);
    
    // Calculate toll based on buildings
    let tollAmount = tile.toll ? tile.toll[0] : 0; // base toll
    if (tile.villas && tile.toll && tile.toll[1]) tollAmount += tile.toll[1];
    if (tile.buildings && tile.toll && tile.toll[2]) tollAmount += tile.toll[2];
    if (tile.hotels && tile.toll && tile.toll[3]) tollAmount += tile.toll[3];

    const handlePayToll = () => {
      dispatch({ type: 'PAY_TOLL', payload: { tileId, amount: tollAmount, ownerId: tile.ownerId! } });
      handleEndTurn();
    };

    const handleUseExemption = () => {
      dispatch({ type: 'USE_EXEMPTION_CARD' });
      handleEndTurn();
    };

    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.header}>
            <h2 className={styles.title}>{tile.name}</h2>
            <p className={styles.subtitle}>{owner?.name}님의 영토입니다.</p>
          </div>

          <div className={styles.tollAlert}>
            앗! 통행료를 지불해야 합니다.
          </div>

          <div className={styles.card}>
            <div className={styles.totalRow}>
              <div className={styles.totalLabel}>지불할 통행료</div>
              <div className={styles.totalPrice}>{formatMoney(tollAmount)}원</div>
            </div>
          </div>

          <div className={styles.actions}>
            {currentPlayer.hasExemptionCard && (
              <button className={`${styles.btn} ${styles.btnPass}`} style={{ backgroundColor: '#facc15', color: '#b45309', border: '1px solid #eab308' }} onClick={handleUseExemption}>
                우대권 사용
              </button>
            )}
            <button className={`${styles.btn} ${styles.btnPay}`} onClick={handlePayToll} disabled={currentPlayer.cash < tollAmount}>
              지불하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ActionModal;
