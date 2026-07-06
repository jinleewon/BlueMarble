import React, { useMemo } from 'react';
import { useGame } from '../game/GameContext';
import styles from './ManagementModal.module.css';

interface ManagementModalProps {
  onClose: () => void;
}

const ManagementModal: React.FC<ManagementModalProps> = ({ onClose }) => {
  const { state, dispatch } = useGame();
  const currentPlayer = state.players[state.currentPlayerIndex];
  
  const myProperties = state.board.filter(t => t.ownerId === currentPlayer.id);

  // Calculate values
  const { propertyValue, totalAssets } = useMemo(() => {
    let pValue = 0;
    myProperties.forEach(prop => {
      pValue += (prop.price || 0) + 
                (prop.villas || 0) * (prop.villaPrice || 0) + 
                (prop.buildings || 0) * (prop.buildingPrice || 0) + 
                (prop.hotels || 0) * (prop.hotelPrice || 0);
    });
    return {
      propertyValue: pValue,
      totalAssets: currentPlayer.cash + pValue
    };
  }, [myProperties, currentPlayer.cash]);

  const handleSellProperty = (tileId: number) => {
    if (confirm('이 자산을 반값에 매각하시겠습니까? (되돌릴 수 없습니다)')) {
      dispatch({ type: 'SELL_PROPERTY', payload: { tileId } });
    }
  };

  const handleTakeLoan = () => {
    dispatch({ type: 'TAKE_LOAN' });
  };

  const getTileColor = (id: number) => {
    if ([1, 2, 3, 4, 11, 12, 13, 14].includes(id)) return '#facc15'; // Yellow
    if ([6, 7, 8, 9, 21, 22, 23, 24].includes(id)) return '#ec4899'; // Pink
    if ([16, 17, 18, 19].includes(id)) return '#f97316'; // Orange
    if ([26, 27, 29, 31, 33, 34, 35, 36, 37].includes(id)) return '#3b82f6'; // Blue
    if ([5, 25].includes(id)) return '#22c55e'; // Green (Jeju, Busan)
    if ([15, 28, 32].includes(id)) return '#a855f7'; // Purple
    if (id === 39) return '#ef4444'; // Red (Seoul)
    return '#facc15'; // Default
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleWrapper}>
            <div className={styles.briefcaseIcon}>💼</div>
            <h2 className={styles.title}>나의 자산</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Summary Box */}
        <div className={styles.summaryBox}>
          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>총 보유 현금</div>
            <div className={`${styles.summaryValue} ${styles.cashColor}`}>
              ₩{currentPlayer.cash.toLocaleString()}
            </div>
          </div>
          <div className={styles.summaryDivider} />
          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>부동산 가치</div>
            <div className={`${styles.summaryValue} ${styles.propertyColor}`}>
              ₩{propertyValue.toLocaleString()}
            </div>
          </div>
          <div className={styles.summaryDivider} />
          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>총 자산 합계</div>
            <div className={`${styles.summaryValue} ${styles.totalColor}`}>
              ₩{totalAssets.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Current Cash Row */}
        <div className={styles.cashRow}>
          <div className={styles.cashRowLeft}>
            <span className={styles.cashRowIcon}>🪙</span>
            현재 보유 현금
          </div>
          <div className={styles.cashRowAmount}>
            ₩{currentPlayer.cash.toLocaleString()}
          </div>
        </div>
        
        <div className={styles.separator} />

        {/* Property Section */}
        <div className={styles.propertySection}>
          <div className={styles.sectionTitle}>
            보유 부동산 목록 ({myProperties.length})
          </div>
          
          {myProperties.length === 0 ? (
            <div className={styles.emptyState}>보유한 부동산이 없습니다.</div>
          ) : (
            <div className={styles.propertyList}>
              {myProperties.map(prop => {
                const sellValue = (prop.price || 0) / 2 + 
                                  (prop.villas || 0) * (prop.villaPrice || 0) / 2 + 
                                  (prop.buildings || 0) * (prop.buildingPrice || 0) / 2 + 
                                  (prop.hotels || 0) * (prop.hotelPrice || 0) / 2;
                
                const totalBuildings = (prop.villas || 0) + (prop.buildings || 0) + (prop.hotels || 0);
                const buildingText = totalBuildings > 0 ? `건물 ${totalBuildings}채` : '대지만 보유';

                return (
                  <div key={prop.id} className={styles.propertyCard}>
                    <div className={styles.cityColorIndicator} style={{ backgroundColor: getTileColor(prop.id) }} />
                    
                    <div className={styles.propertyInfo}>
                      <div className={styles.cityName}>{prop.name}</div>
                      <div className={styles.propertyDetails}>
                        <span>매입가 ₩{(prop.price || 0).toLocaleString()}</span>
                        <div className={styles.detailDivider} />
                        <span>{buildingText}</span>
                      </div>
                    </div>
                    
                    <div className={styles.propertyValue}>
                      <span className={styles.valueLabel}>매각 가치</span>
                      <span className={styles.valueAmount}>₩{sellValue.toLocaleString()}</span>
                    </div>
                    
                    <button className={styles.sellBtn} onClick={() => handleSellProperty(prop.id)}>
                      매각
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.actionButtons}>
            <button 
              className={styles.loanBtn} 
              onClick={handleTakeLoan}
              disabled={currentPlayer.loanAmount > 0}
            >
              대출 받기
            </button>
            <button className={styles.confirmBtn} onClick={onClose}>
              확인
            </button>
          </div>
          <div className={styles.hintText}>
            <span className={styles.infoIcon}>ⓘ</span>
            부동산을 매각하거나 대출을 받아 현금을 확보할 수 있습니다.
          </div>
        </div>

      </div>
    </div>
  );
};

export default ManagementModal;
