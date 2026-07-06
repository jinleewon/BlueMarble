import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../game/GameContext';
import styles from './Sidebar.module.css';
import ManagementModal from './ManagementModal';
import PropertyDeedModal, { getTileColor } from './PropertyDeedModal';

const AnimatedCash: React.FC<{ cash: number }> = ({ cash }) => {
  const [diffs, setDiffs] = useState<{ id: number; amount: number }[]>([]);
  const prevCash = useRef(cash);
  const diffId = useRef(0);

  useEffect(() => {
    const diff = cash - prevCash.current;
    if (diff !== 0) {
      const id = diffId.current++;
      setDiffs(prev => [...prev, { id, amount: diff }]);
      setTimeout(() => {
        setDiffs(prev => prev.filter(d => d.id !== id));
      }, 2000);
      prevCash.current = cash;
    }
  }, [cash]);

  return (
    <div className={styles.cashContainer}>
      <span className={styles.cash}>₩{cash.toLocaleString()}</span>
      {diffs.map(d => (
        <div key={d.id} className={`${styles.floatingDiff} ${d.amount > 0 ? styles.positive : styles.negative}`}>
          {d.amount > 0 ? '+' : ''}{d.amount.toLocaleString()}
        </div>
      ))}
    </div>
  );
};

const Sidebar: React.FC = () => {
  const { state, dispatch } = useGame();
  const logRef = useRef<HTMLDivElement>(null);
  const [showManagementModal, setShowManagementModal] = useState(false);
  const [selectedDeedId, setSelectedDeedId] = useState<number | null>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [state.messageLog]);

  const handleRollDice = () => {
    dispatch({ type: 'ROLL_DICE' });
  };

  const handleEndTurn = () => {
    dispatch({ type: 'END_TURN' });
  };

  const avatars = [
    `${import.meta.env.BASE_URL}assets/avatar1.png`,
    `${import.meta.env.BASE_URL}assets/avatar2.png`,
    `${import.meta.env.BASE_URL}assets/avatar3.png`
  ];

  return (
    <div className={styles.sidebar}>
      <p className={styles.title}>PLAYERS</p>
      
      {state.players.map((player, index) => {
        const isActive = state.currentPlayerIndex === index;
        const ownedProperties = state.board.filter(t => t.ownerId === player.id);
        const avatarSrc = avatars[index % avatars.length];

        return (
          <div key={player.id} className={`${styles.playerCard} ${isActive ? styles.active : ''}`}>
            <div className={styles.cardHeader}>
              <img src={avatarSrc} alt="Avatar" className={styles.avatar} />
              <div className={styles.info}>
                <div className={styles.name}>{player.name}</div>
                <AnimatedCash cash={player.cash} />
              </div>
              {isActive && <div className={styles.turnBadge}>TURN</div>}
            </div>
            
            {(player.hasEscapeCard || player.hasExemptionCard) && (
              <div className={styles.keptCards}>
                {player.hasEscapeCard && <div className={styles.keptCard}>🗝️ 무인도 탈출권</div>}
                {player.hasExemptionCard && <div className={styles.keptCard}>🗝️ 우대권</div>}
              </div>
            )}
            
            {ownedProperties.length > 0 && (
              <div className={styles.properties}>
                {ownedProperties.map(prop => {
                  return (
                    <div 
                      key={prop.id} 
                      className={styles.propertyBadge} 
                      style={{ backgroundColor: getTileColor(prop.id), cursor: 'pointer' }}
                      title={`${prop.name} (별장:${prop.villas||0} 빌딩:${prop.buildings||0} 호텔:${prop.hotels||0})`}
                      onClick={() => setSelectedDeedId(prop.id)}
                    >
                      <span className={styles.propName}>{prop.name}</span>
                      {(prop.villas! > 0 || prop.buildings! > 0 || prop.hotels! > 0) && (
                        <span className={styles.propAssets}>
                          {prop.villas! > 0 && '🏠'}
                          {prop.buildings! > 0 && '🏢'}
                          {prop.hotels! > 0 && '🏨'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <div className={styles.controls}>
        <div className={styles.logBox} ref={logRef}>
          {state.messageLog.map((log, i) => (
            <div key={i} className={styles.logEntry}>[{new Date().toLocaleTimeString('en-US', {hour12:false, hour:'2-digit', minute:'2-digit'})}] {log}</div>
          ))}
        </div>

        {state.turnPhase === 'pre_roll' && (
          state.players[state.currentPlayerIndex].isSpaceTravel ? (
            <div className={styles.btn} style={{ backgroundColor: '#8b5cf6', color: 'white', textAlign: 'center', lineHeight: '48px', fontWeight: 'bold' }}>
              보드판에서 이동할 땅을 클릭하세요!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className={styles.btn} 
                  style={{ flex: 1, backgroundColor: '#3B82F6' }}
                  onClick={() => setShowManagementModal(true)}
                >
                  자산 관리
                </button>
                {state.players[state.currentPlayerIndex].loanAmount > 0 ? (
                  <button 
                    className={styles.btn} 
                    style={{ flex: 1, backgroundColor: '#10B981', display: 'flex', flexDirection: 'column', gap: '2px', padding: '4px' }}
                    onClick={() => dispatch({ type: 'REPAY_LOAN' })}
                  >
                    <span>대출 상환</span>
                    <span style={{ fontSize: '11px', opacity: 0.9 }}>
                      (남은 턴: {state.players[state.currentPlayerIndex].loanTurnsLeft})
                    </span>
                  </button>
                ) : (
                  <button 
                    className={styles.btn} 
                    style={{ flex: 1, backgroundColor: '#F59E0B' }}
                    onClick={() => dispatch({ type: 'TAKE_LOAN' })}
                  >
                    대출 받기
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {state.players[state.currentPlayerIndex].islandTurnsLeft > 0 && (
                  <div style={{
                    backgroundColor: '#FEF2F2',
                    color: '#DC2626',
                    padding: '8px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    border: '1px solid #FCA5A5'
                  }}>
                    🏝️ 무인도에 갇혔습니다!<br />
                    주사위 더블이 나오면 탈출합니다.<br />
                    (남은 턴: {state.players[state.currentPlayerIndex].islandTurnsLeft})
                  </div>
                )}
                {state.players[state.currentPlayerIndex].hasEscapeCard && state.players[state.currentPlayerIndex].islandTurnsLeft > 0 ? (
                  <button 
                    className={styles.btn} 
                    style={{ backgroundColor: '#10B981' }}
                    onClick={() => dispatch({ type: 'USE_ESCAPE_CARD' })}
                  >
                    무인도 탈출권 사용
                  </button>
                ) : (
                  <button className={styles.btn} onClick={handleRollDice}>
                    주사위 굴리기
                  </button>
                )}
              </div>
            </div>
          )
        )}
        
        {state.turnPhase === 'action' && (
          <div className={styles.btnRow}>
            <button className={`${styles.btn} ${styles.altBtn}`}>
              건설하기
            </button>
            <button className={`${styles.btn} ${styles.altBtn}`} onClick={handleEndTurn}>
              턴 종료
            </button>
          </div>
        )}
        
        {(state.turnPhase === 'roll' || state.turnPhase === 'move') && (
          <button className={styles.btn} disabled>
            주사위 굴리기
          </button>
        )}
      </div>

      {showManagementModal && (
        <ManagementModal onClose={() => setShowManagementModal(false)} />
      )}

      {selectedDeedId !== null && (
        <PropertyDeedModal tileId={selectedDeedId} onClose={() => setSelectedDeedId(null)} />
      )}
    </div>
  );
};

export default Sidebar;
