import React from 'react';
import { useGame } from '../game/GameContext';
import styles from './ActionModal.module.css'; // Reuse some ActionModal styles

const InsolventModal: React.FC = () => {
  const { state, dispatch } = useGame();
  
  if (state.turnPhase !== 'insolvent' || !state.pendingPayment) return null;

  const currentPlayer = state.players[state.currentPlayerIndex];
  const { amount, reason } = state.pendingPayment;
  const canPay = currentPlayer.cash >= amount;

  const myPlayerId = Number(localStorage.getItem('myPlayerId'));
  const isMyTurn = currentPlayer.id === myPlayerId;

  const handlePay = () => {
    if (!isMyTurn) return;
    dispatch({ type: 'PAY_PENDING' });
    if (reason === '통행료') {
      dispatch({ type: 'END_TURN' });
    }
  };

  const handleBankruptcy = () => {
    if (!isMyTurn) return;
    if (window.confirm('정말 파산하시겠습니까? 모든 자산이 몰수되고 패배하게 됩니다.')) {
      dispatch({ type: 'DECLARE_BANKRUPTCY' });
      dispatch({ type: 'END_TURN' });
    }
  };

  const handleTakeLoan = () => {
    if (!isMyTurn) return;
    dispatch({ type: 'TAKE_LOAN' });
  };

  const handleSellProperty = (tileId: number) => {
    if (!isMyTurn) return;
    if (confirm('이 자산을 반값에 매각하시겠습니까?')) {
      dispatch({ type: 'SELL_PROPERTY', payload: { tileId } });
    }
  };

  // Find owned properties
  const myProperties = state.board.filter(t => t.ownerId === currentPlayer.id);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} style={{ maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
        <h2 className={styles.title} style={{ color: '#ef4444' }}>자금 부족!</h2>
        <div className={styles.content}>
          <p style={{ fontSize: '18px', fontWeight: 'bold' }}>
            [{reason}] 명목으로 <span style={{ color: '#ef4444' }}>{amount.toLocaleString()}원</span>을 지불해야 합니다.
          </p>
          <p>현재 자금: <strong>{currentPlayer.cash.toLocaleString()}원</strong></p>
          
          {!canPay && <p style={{ color: '#ef4444', marginTop: '10px' }}>자금이 부족합니다. 대출을 받거나 자산을 매각하세요.</p>}

          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {isMyTurn ? (
              canPay ? (
                <button className={`${styles.btn} ${styles.buyBtn}`} onClick={handlePay}>
                  지불하기
                </button>
              ) : (
                <>
                  <button 
                    className={styles.btn} 
                    style={{ backgroundColor: '#F59E0B' }}
                    onClick={handleTakeLoan}
                    disabled={currentPlayer.loanAmount > 0}
                  >
                    은행 대출 (100만원)
                  </button>
                  <button className={`${styles.btn} ${styles.passBtn}`} onClick={handleBankruptcy}>
                    파산하기
                  </button>
                </>
              )
            ) : (
              <div style={{ color: '#ef4444', fontWeight: 'bold', padding: '10px' }}>
                {currentPlayer.name}님이 자금을 마련 중입니다...
              </div>
            )}
          </div>

          <hr style={{ margin: '20px 0', borderColor: '#e5e7eb' }} />
          
          <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>나의 자산 목록 (클릭하여 반값 매각)</h3>
          {myProperties.length === 0 ? (
            <p style={{ color: '#6b7280' }}>보유한 자산이 없습니다.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {myProperties.map(prop => {
                const sellValue = (prop.price || 0) / 2 + 
                                  (prop.villas || 0) * (prop.villaPrice || 0) / 2 + 
                                  (prop.buildings || 0) * (prop.buildingPrice || 0) / 2 + 
                                  (prop.hotels || 0) * (prop.hotelPrice || 0) / 2;
                return (
                  <div 
                    key={prop.id} 
                    style={{ border: '1px solid #e5e7eb', padding: '10px', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#f9fafb' }}
                    onClick={() => handleSellProperty(prop.id)}
                  >
                    <div style={{ fontWeight: 'bold' }}>{prop.name}</div>
                    <div style={{ fontSize: '14px', color: '#10B981' }}>매각가: {sellValue.toLocaleString()}원</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsolventModal;
