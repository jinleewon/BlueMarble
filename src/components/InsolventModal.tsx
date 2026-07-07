import React, { useState } from 'react';
import { useGame } from '../game/GameContext';
import styles from './ActionModal.module.css';

const InsolventModal: React.FC = () => {
  const { state, dispatch } = useGame();
  
  // Track funds raised during this modal session
  const [raisedFunds, setRaisedFunds] = useState(0);
  const [expandedSellId, setExpandedSellId] = useState<number | null>(null);
  
  if (state.turnPhase !== 'insolvent' || !state.pendingPayment) return null;

  const currentPlayer = state.players[state.currentPlayerIndex];
  const { amount, reason } = state.pendingPayment;
  
  const myPlayerId = Number(localStorage.getItem('myPlayerId'));
  const isMyTurn = currentPlayer.id === myPlayerId;

  const handlePay = () => {
    if (!isMyTurn) return;
    dispatch({ type: 'PAY_PENDING' });
    if (reason === '통행료') {
      dispatch({ type: 'END_TURN' });
    }
  };

  const handleTakeLoan = () => {
    if (!isMyTurn || currentPlayer.loanAmount > 0) return;
    dispatch({ type: 'TAKE_LOAN' });
  };

  const handleBankruptcy = () => {
    if (!isMyTurn) return;
    if (confirm('정말 파산하시겠습니까? 보유한 모든 자산이 몰수되고 게임에서 패배하게 됩니다.')) {
      dispatch({ type: 'DECLARE_BANKRUPTCY' });
    }
  };

  const handleSellProperty = (tileId: number, sellValue: number, sellType: 'all' | 'villa' | 'building' | 'hotel' | 'land') => {
    if (!isMyTurn) return;

    let typeName = '전체';
    if (sellType === 'villa') typeName = '별장';
    else if (sellType === 'building') typeName = '빌딩';
    else if (sellType === 'hotel') typeName = '호텔';
    else if (sellType === 'land') typeName = '대지';

    if (confirm(`선택하신 ${typeName}을(를) 매각하시겠습니까? (₩${sellValue.toLocaleString()} 반환)`)) {
      dispatch({ type: 'SELL_PROPERTY', payload: { tileId, sellType } });
      setRaisedFunds(prev => prev + sellValue);
      setExpandedSellId(null);
    }
  };

  // Find owned properties
  const myProperties = state.board.filter(t => t.ownerId === currentPlayer.id);

  const getTileColor = (id: number) => {
    if ([1, 2, 3, 4, 11, 12, 13, 14].includes(id)) return '#facc15';
    if ([6, 7, 8, 9, 21, 22, 23, 24].includes(id)) return '#ec4899';
    if ([16, 17, 18, 19].includes(id)) return '#f97316';
    if ([26, 27, 29, 31, 33, 34, 35, 36, 37].includes(id)) return '#3b82f6';
    if ([5, 25].includes(id)) return '#22c55e';
    if ([15, 28, 32].includes(id)) return '#a855f7';
    if (id === 39) return '#ef4444';
    return '#94a3b8';
  };

  const totalAssetValue = myProperties.reduce((sum, prop) => {
    return sum + (prop.price || 0) + 
                 (prop.villas || 0) * (prop.villaPrice || 0) + 
                 (prop.buildings || 0) * (prop.buildingPrice || 0) + 
                 (prop.hotels || 0) * (prop.hotelPrice || 0);
  }, currentPlayer.cash);
  
  const canPay = currentPlayer.cash >= amount;

  // Custom styling elements to exactly match Figma
  const containerStyle: React.CSSProperties = {
    backgroundColor: 'white',
    boxShadow: '0px 32px 32px rgba(0,0,0,0.4)',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    alignItems: 'flex-start',
    padding: '40px',
    borderRadius: '48px',
    width: '100%',
    maxWidth: '680px', // slightly wider to fit 4 summary items perfectly
    maxHeight: '90vh',
    overflowY: 'auto',
    boxSizing: 'border-box',
    fontFamily: 'Pretendard, -apple-system, sans-serif'
  };

  const inlineBtnStyle = (bgColor: string): React.CSSProperties => ({
    backgroundColor: bgColor,
    display: 'flex',
    height: '32px',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 12px',
    borderRadius: '16px',
    border: 'none',
    cursor: 'pointer',
    color: 'white',
    fontSize: '12px',
    fontWeight: 700
  });

  return (
    <div className={styles.overlay}>
      <div style={containerStyle}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#3b82f6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L4 9V17L2 19V21H22V19L20 17V9L22 7L12 2ZM10 17H6V9H10V17ZM18 17H14V9H18V17Z" fill="white"/>
              </svg>
            </div>
            <p style={{ fontWeight: 800, color: '#1e293b', fontSize: '28px', margin: 0 }}>
              자금 마련
            </p>
          </div>
          <div style={{ width: '48px', height: '48px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
        </div>

        {/* Summary Box */}
        <div style={{ backgroundColor: '#f8fafc', display: 'flex', gap: '24px', alignItems: 'flex-start', padding: '28px', borderRadius: '32px', width: '100%', boxSizing: 'border-box' }}>
          
          <div style={{ display: 'flex', flex: '1 0 0', flexDirection: 'column', gap: '8px', alignItems: 'center', minWidth: 0, whiteSpace: 'nowrap' }}>
            <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>총 자산</p>
            <p style={{ color: '#1e293b', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>₩{totalAssetValue.toLocaleString()}</p>
          </div>
          
          <div style={{ backgroundColor: '#e2e8f0', height: '40px', width: '1px', flexShrink: 0 }} />
          
          <div style={{ display: 'flex', flex: '1 0 0', flexDirection: 'column', gap: '8px', alignItems: 'center', minWidth: 0, whiteSpace: 'nowrap' }}>
            <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>현재 대출금</p>
            <p style={{ color: '#f97316', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>₩{currentPlayer.loanAmount.toLocaleString()}</p>
          </div>
          
          <div style={{ backgroundColor: '#e2e8f0', height: '40px', width: '1px', flexShrink: 0 }} />
          
          <div style={{ display: 'flex', flex: '1 0 0', flexDirection: 'column', gap: '8px', alignItems: 'center', minWidth: 0, whiteSpace: 'nowrap' }}>
            <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>필요한 자금</p>
            <p style={{ color: '#ef4444', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>₩{amount.toLocaleString()}</p>
          </div>
          
          <div style={{ backgroundColor: '#e2e8f0', height: '40px', width: '1px', flexShrink: 0 }} />
          
          <div style={{ display: 'flex', flex: '1 0 0', flexDirection: 'column', gap: '8px', alignItems: 'center', minWidth: 0, whiteSpace: 'nowrap' }}>
            <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>매각한 자금</p>
            <p style={{ color: '#f97316', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>₩{raisedFunds.toLocaleString()}</p>
          </div>
          
        </div>

        {/* Properties List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start', width: '100%', flexShrink: 0 }}>
          <p style={{ color: '#64748b', fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>내 현재 자산</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', flexShrink: 0 }}>
            {myProperties.length === 0 ? (
              <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', padding: '20px', borderRadius: '20px', width: '100%', boxSizing: 'border-box' }}>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>보유한 자산이 없습니다.</p>
              </div>
            ) : (
              myProperties.map(prop => {
                const sellValue = (prop.price || 0) + 
                                  (prop.villas || 0) * (prop.villaPrice || 0) + 
                                  (prop.buildings || 0) * (prop.buildingPrice || 0) + 
                                  (prop.hotels || 0) * (prop.hotelPrice || 0);
                
                const propColor = getTileColor(prop.id);
                
                const buildingsInfo = [];
                if (prop.villas) buildingsInfo.push(`별장 ${prop.villas}채`);
                if (prop.buildings) buildingsInfo.push(`빌딩 ${prop.buildings}채`);
                if (prop.hotels) buildingsInfo.push(`호텔 ${prop.hotels}채`);
                const buildingText = buildingsInfo.length > 0 ? buildingsInfo.join(', ') : '대지만 보유';

                return (
                  <div key={prop.id} style={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0px 4px 6px rgba(0,0,0,0.15)',
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'center',
                    padding: '20px',
                    borderRadius: '20px',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}>
                    <div style={{ backgroundColor: propColor, height: '60px', borderRadius: '6px', width: '12px', flexShrink: 0 }} />
                    
                    <div style={{ display: 'flex', flex: '1 0 0', flexDirection: 'column', gap: '4px', alignItems: 'flex-start', minWidth: 0 }}>
                      <p style={{ color: '#1e293b', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{prop.name}</p>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <p style={{ color: '#64748b', fontSize: '14px', fontWeight: 'normal', margin: 0 }}>매입가 ₩{(prop.price || 0).toLocaleString()}</p>
                        <div style={{ backgroundColor: '#e2e8f0', height: '12px', width: '1px', flexShrink: 0 }} />
                        <p style={{ color: '#64748b', fontSize: '14px', fontWeight: 'normal', margin: 0 }}>{buildingText}</p>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-end', flexShrink: 0, whiteSpace: 'nowrap' }}>
                      <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold', margin: 0 }}>현재 가치</p>
                      <p style={{ color: '#10b981', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>₩{sellValue.toLocaleString()}</p>
                    </div>
                    
                    {isMyTurn && expandedSellId !== prop.id && (
                      <button 
                        onClick={() => setExpandedSellId(prop.id)}
                        style={{
                          backgroundColor: '#f97316',
                          display: 'flex',
                          height: '44px',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0 16px',
                          borderRadius: '22px',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: 800,
                          flexShrink: 0
                        }}
                      >
                        매각 옵션
                      </button>
                    )}
                    {isMyTurn && expandedSellId === prop.id && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end', flexShrink: 0 }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {(prop.hotels || 0) > 0 && (
                            <button onClick={() => handleSellProperty(prop.id, prop.hotelPrice || 0, 'hotel')} style={inlineBtnStyle('#ec4899')}>호텔 매각</button>
                          )}
                          {(prop.buildings || 0) > 0 && (
                            <button onClick={() => handleSellProperty(prop.id, prop.buildingPrice || 0, 'building')} style={inlineBtnStyle('#3b82f6')}>빌딩 매각</button>
                          )}
                          {(prop.villas || 0) > 0 && (
                            <button onClick={() => handleSellProperty(prop.id, prop.villaPrice || 0, 'villa')} style={inlineBtnStyle('#22c55e')}>별장 매각</button>
                          )}
                          {((prop.hotels || 0) === 0 && (prop.buildings || 0) === 0 && (prop.villas || 0) === 0) && (
                            <button onClick={() => handleSellProperty(prop.id, prop.price || 0, 'land')} style={inlineBtnStyle('#a855f7')}>대지 매각</button>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => handleSellProperty(prop.id, sellValue, 'all')} style={inlineBtnStyle('#f97316')}>전체 매각</button>
                          <button onClick={() => setExpandedSellId(null)} style={inlineBtnStyle('#64748b')}>닫기</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Bottom Buttons */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', width: '100%', flexShrink: 0 }}>
          <button 
            onClick={handleBankruptcy}
            disabled={!isMyTurn}
            style={{
            backgroundColor: '#fee2e2',
            display: 'flex',
            flex: '1 0 0',
            height: '64px',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '32px',
            border: 'none',
            cursor: isMyTurn ? 'pointer' : 'not-allowed',
            color: '#ef4444',
            fontSize: '18px',
            fontWeight: 800
          }}>
            파산하기
          </button>
          
          <button 
            onClick={handlePay}
            disabled={!canPay || !isMyTurn}
            style={{
              backgroundColor: canPay ? '#3268e8' : '#9ca3af',
              boxShadow: canPay ? '0px 8px 8px rgba(50,104,232,0.3)' : 'none',
              display: 'flex',
              flex: '1 0 0',
              height: '64px',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '32px',
              border: 'none',
              cursor: canPay && isMyTurn ? 'pointer' : 'not-allowed',
              color: 'white',
              fontSize: '18px',
              fontWeight: 800
            }}>
            지불하기
          </button>
          
          <button 
            onClick={handleTakeLoan}
            disabled={currentPlayer.loanAmount > 0 || !isMyTurn}
            style={{
              backgroundColor: currentPlayer.loanAmount === 0 ? '#10b981' : '#9ca3af',
              boxShadow: currentPlayer.loanAmount === 0 ? '0px 8px 8px rgba(16,185,129,0.3)' : 'none',
              display: 'flex',
              flex: '1 0 0',
              height: '64px',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '32px',
              border: 'none',
              cursor: currentPlayer.loanAmount === 0 && isMyTurn ? 'pointer' : 'not-allowed',
              color: 'white',
              fontSize: '18px',
              fontWeight: 800
            }}>
            대출받기
          </button>
        </div>

        {/* Hint */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', justifyContent: 'center', width: '100%', flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '2px' }}>
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <p style={{ color: '#64748b', fontSize: '13px', fontWeight: 'normal', margin: 0 }}>
            자산 매각 시 현재 가치의 100%로 매각됩니다. 대출 이자율 10%, 매 턴마다 이자 발생.
          </p>
        </div>

      </div>
    </div>
  );
};

export default InsolventModal;

