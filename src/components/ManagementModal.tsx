import React from 'react';
import { useGame } from '../game/GameContext';
import styles from './ActionModal.module.css'; // Reusing styles

interface ManagementModalProps {
  onClose: () => void;
}

const ManagementModal: React.FC<ManagementModalProps> = ({ onClose }) => {
  const { state, dispatch } = useGame();
  const currentPlayer = state.players[state.currentPlayerIndex];
  
  const myProperties = state.board.filter(t => t.ownerId === currentPlayer.id);

  const handleSellProperty = (tileId: number) => {
    if (confirm('이 자산을 반값에 매각하시겠습니까? (되돌릴 수 없습니다)')) {
      dispatch({ type: 'SELL_PROPERTY', payload: { tileId } });
    }
  };

  const getTileColor = (id: number) => {
    if ([1, 2, 3, 4, 11, 12, 13, 14].includes(id)) return '#facc15'; // Yellow
    if ([6, 7, 8, 9, 21, 22, 23, 24].includes(id)) return '#ec4899'; // Pink
    if ([16, 17, 18, 19].includes(id)) return '#f97316'; // Orange
    if ([26, 27, 29, 31, 33, 34, 35, 36, 37].includes(id)) return '#3b82f6'; // Blue
    if ([5, 25].includes(id)) return '#22c55e'; // Green (Jeju, Busan)
    if ([15, 28, 32].includes(id)) return '#a855f7'; // Purple (Concorde, Queen, Columbia)
    if (id === 39) return '#ef4444'; // Red (Seoul)
    return '#facc15'; // Default
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} style={{ maxWidth: '700px', maxHeight: '80vh', overflowY: 'auto' }}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
        <h2 className={styles.title}>자산 관리</h2>
        <div className={styles.content}>
          <p>현재 자금: <strong>{currentPlayer.cash.toLocaleString()}원</strong></p>
          <hr style={{ margin: '15px 0', borderColor: '#e5e7eb' }} />
          
          {myProperties.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center' }}>보유한 자산이 없습니다.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
              {myProperties.map(prop => {
                const sellValue = (prop.price || 0) / 2 + 
                                  (prop.villas || 0) * (prop.villaPrice || 0) / 2 + 
                                  (prop.buildings || 0) * (prop.buildingPrice || 0) / 2 + 
                                  (prop.hotels || 0) * (prop.hotelPrice || 0) / 2;
                


                return (
                  <div key={prop.id} style={{ border: '1px solid #e5e7eb', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb', borderLeft: `6px solid ${getTileColor(prop.id)}` }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {prop.name}
                      </div>
                      <div style={{ fontSize: '14px', color: '#10B981' }}>매각가: {sellValue.toLocaleString()}원</div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                        건설 현황: 별장({prop.villas || 0}) 빌딩({prop.buildings || 0}) 호텔({prop.hotels || 0})
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '100px' }}>
                      <button 
                        className={styles.btn} 
                        style={{ backgroundColor: '#6B7280', padding: '8px 16px', fontSize: '14px' }}
                        onClick={() => handleSellProperty(prop.id)}
                      >
                        매각
                      </button>
                    </div>
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

export default ManagementModal;
