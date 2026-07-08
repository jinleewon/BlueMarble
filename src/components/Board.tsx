import React, { useState, useEffect } from 'react';
import { useGame } from '../game/GameContext';
import styles from './Board.module.css';

const Board: React.FC = () => {
  const { state, dispatch } = useGame();
  
  // Track visual positions for animation
  const [visualPositions, setVisualPositions] = useState<Record<number, number>>({});
  const [salaryEffects, setSalaryEffects] = useState<{id: number, text: string}[]>([]);
  const effectIdRef = React.useRef(0);

  useEffect(() => {
    // Initialize or sync positions
    const newVisuals = { ...visualPositions };
    let hasChanges = false;
    
    state.players.forEach(p => {
      if (newVisuals[p.id] === undefined) {
        newVisuals[p.id] = p.position;
        hasChanges = true;
      }
    });
    
    if (hasChanges) setVisualPositions(newVisuals);
  }, [state.players]);

  useEffect(() => {
    // Step-by-step movement logic
    const timers: ReturnType<typeof setTimeout>[] = [];

    state.players.forEach(p => {
      const targetPos = p.position;
      const currentVisual = visualPositions[p.id] ?? targetPos;
      
      if (currentVisual !== targetPos) {
        let nextVisual = currentVisual;
        const movementType = state.lastMovementType || 'forward';

        if (movementType === 'teleport') {
          nextVisual = targetPos;
        } else if (movementType === 'backward') {
          nextVisual = (currentVisual - 1 + 40) % 40;
        } else {
          // forward
          nextVisual = (currentVisual + 1) % 40;
        }

        const timer = setTimeout(() => {
          if (nextVisual === 0 && movementType === 'forward') {
            const eid = effectIdRef.current++;
            setSalaryEffects(prev => [...prev, { id: eid, text: '+20만원 (월급)' }]);
            setTimeout(() => {
              setSalaryEffects(prev => prev.filter(e => e.id !== eid));
            }, 2000);
          }
          setVisualPositions(prev => ({
            ...prev,
            [p.id]: nextVisual
          }));
        }, nextVisual === targetPos ? 0 : 150);
        timers.push(timer);
      }
    });

    return () => timers.forEach(clearTimeout);
  }, [state.players, visualPositions, state.lastMovementType]);

  const getTileCoords = (id: number) => {
    let col = 1, row = 1;
    if (id === 0) { col = 11; row = 11; }
    else if (id > 0 && id < 10) { col = 11 - id; row = 11; }
    else if (id === 10) { col = 1; row = 11; }
    else if (id > 10 && id < 20) { col = 1; row = 21 - id; }
    else if (id === 20) { col = 1; row = 1; }
    else if (id > 20 && id < 30) { col = id - 19; row = 1; }
    else if (id === 30) { col = 11; row = 1; }
    else if (id > 30 && id < 40) { col = 11; row = id - 29; }
    
    const getCenter = (idx: number) => {
      if (idx === 1) return 50;
      if (idx === 11) return 870;
      return 100 + (idx - 2) * 80 + 40;
    };
    
    return { x: getCenter(col), y: getCenter(row) };
  };

  const formatMoney = (amount: number) => {
    return amount >= 10000 ? `${amount / 10000}만` : amount;
  };

  const currentPlayer = state.players[state.currentPlayerIndex];
  const myPlayerId = Number(localStorage.getItem('myPlayerId'));
  const isMyTurn = currentPlayer?.id === myPlayerId;
  const isSpaceTravelMode = state.turnPhase === 'pre_roll' && currentPlayer?.isSpaceTravel && isMyTurn;

  const getTileColor = (id: number) => {
    if ([1, 2, 3, 4, 11, 12, 13, 14].includes(id)) return '#facc15'; // Yellow
    if ([6, 7, 8, 9, 21, 22, 23, 24].includes(id)) return '#ec4899'; // Pink
    if ([16, 17, 18, 19].includes(id)) return '#f97316'; // Orange
    if ([26, 27, 29, 31, 33, 34, 35, 36, 37].includes(id)) return '#3b82f6'; // Blue
    if ([5, 25].includes(id)) return '#22c55e'; // Green (Jeju, Busan)
    if ([15, 28, 32].includes(id)) return '#a855f7'; // Purple (Concorde, Queen, Columbia)
    if (id === 39) return '#ef4444'; // Red (Seoul)
    return '#facc15'; // Default for Chance (황금열쇠)
  };

  const getRotation = (id: number) => {
    if (id > 0 && id < 10) return '0deg';
    if (id > 10 && id < 20) return '90deg';
    if (id > 20 && id < 30) return '180deg';
    if (id > 30 && id < 40) return '-90deg';
    return '0deg';
  };

  return (
    <div className={styles.boardContainer}>
      <div className={styles.boardGrid}>
        
        {/* Background Decoration */}
        <div className={styles.bgDecoration} />

        {/* Center Area */}
        <div className={styles.centerArea}>
          <img src={`${import.meta.env.BASE_URL}assets/globe.png`} alt="Globe" className={styles.globe} />
          <div className={styles.logo}>BLUE MARBLE</div>
          
          {/* Fund Balance Display */}
          {state.fundBalance > 0 && (
            <div className={styles.fundBalanceDisplay}>
              <div className={styles.fundBalanceIcon}>🤝</div>
              <div className={styles.fundBalanceText}>사회복지기금</div>
              <div className={styles.fundBalanceAmount}>{state.fundBalance.toLocaleString()}원</div>
            </div>
          )}

          {salaryEffects.map(effect => (
            <div key={effect.id} className={styles.salaryEffect}>
              {effect.text}
            </div>
          ))}
        </div>

        {/* Tiles */}
        {state.board.map((tile) => {
          const isCorner = tile.id % 10 === 0;
          const cornerClass = isCorner ? styles.cornerTile : '';
          
          if (isCorner) {
            return (
              <div 
                key={tile.id} 
                className={`${styles.tile} ${cornerClass}`} 
                data-id={tile.id}
                onClick={() => {
                  if (isSpaceTravelMode) {
                    dispatch({ type: 'SPACE_TRAVEL_MOVE', payload: { targetTileId: tile.id } });
                  }
                }}
                style={{
                  cursor: isSpaceTravelMode ? 'pointer' : 'default',
                  boxShadow: isSpaceTravelMode ? 'inset 0 0 0 3px #8b5cf6' : 'none',
                  opacity: isSpaceTravelMode && tile.id === currentPlayer.position ? 0.5 : 1
                }}
              >
                {tile.id === 0 && (
                  <>
                    <img src={`${import.meta.env.BASE_URL}assets/line1.svg`} alt="" style={{width: '24px', height: '24px', position: 'absolute', top: 10, left: 10}}/>
                    <div className={styles.cornerTitle} style={{marginTop: 'auto', color: 'white', textShadow: '0px 1px 2px rgba(0,0,0,0.5)'}}>출발<br/>GO</div>
                  </>
                )}
                {tile.id === 10 && (
                  <>
                    <div className={styles.cornerIconWrapper} style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                      <img src={`${import.meta.env.BASE_URL}assets/palmtree.svg`} alt="Island" className={styles.cornerIcon} />
                    </div>
                    <div className={styles.cornerTitle}>무인도<br/><span style={{fontSize: '7px'}}>ISLAND</span></div>
                  </>
                )}
                {tile.id === 20 && (
                  <>
                    <div className={styles.cornerIconWrapper} style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                      <img src={`${import.meta.env.BASE_URL}assets/heart.svg`} alt="Fund" className={styles.cornerIcon} />
                    </div>
                    <div className={styles.cornerTitle}>사회복지<br/>기금<br/><span style={{fontSize: '7px', background: 'rgba(255,255,255,0.2)', padding: '2px 4px', borderRadius: '4px'}}>FUND</span></div>
                  </>
                )}
                {tile.id === 30 && (
                  <>
                    <div className={styles.cornerIconWrapper} style={{ border: '1px solid #8b5cf6', background: 'radial-gradient(circle, rgba(139,92,246,0.5) 0%, rgba(76,29,149,0.3) 100%)' }}>
                      <img src={`${import.meta.env.BASE_URL}assets/rocket.svg`} alt="Space" className={styles.cornerIcon} />
                    </div>
                    <div className={styles.cornerTitle}>우주여행<br/><span style={{fontSize: '7px', color: '#c084fc'}}>SPACE</span></div>
                  </>
                )}
              </div>
            );
          }

          // Edge tiles
          const isVerticalEdge = (tile.id > 10 && tile.id < 20) || (tile.id > 30 && tile.id < 40);
          const edgeClass = isVerticalEdge ? (tile.id < 20 ? styles.tileLeft : styles.tileRight) : (tile.id < 10 ? styles.tileBottom : styles.tileTop);

          return (
            <div 
              key={tile.id} 
              className={`${styles.tile} ${edgeClass}`} 
              data-id={tile.id}
              onClick={() => {
                if (isSpaceTravelMode) {
                  dispatch({ type: 'SPACE_TRAVEL_MOVE', payload: { targetTileId: tile.id } });
                }
              }}
              style={{
                cursor: isSpaceTravelMode ? 'pointer' : 'default',
                boxShadow: isSpaceTravelMode ? 'inset 0 0 0 3px #8b5cf6' : 'none',
                opacity: isSpaceTravelMode && tile.id === currentPlayer.position ? 0.5 : 1
              }}
            >
              {/* Inner container for rotation */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '80px',
                height: '100px',
                transform: `translate(-50%, -50%) rotate(${getRotation(tile.id)})`,
                display: 'flex',
                flexDirection: 'column',
              }}>
                <div className={styles.colorBar} style={{ height: '20px', width: '100%', backgroundColor: getTileColor(tile.id), borderBottom: tile.ownerId ? `4px solid ${state.players.find(p => p.id === tile.ownerId)?.color}` : 'none' }} />
                <div className={styles.tileContent}>
                  <div className={styles.tileName}>{tile.name}</div>
                  {tile.price && (
                    <div className={styles.tilePrice}>{formatMoney(tile.price)}</div>
                  )}
                  {/* Building indicators */}
                  {(tile.villas! > 0 || tile.buildings! > 0 || tile.hotels! > 0) && (
                    <div style={{ display: 'flex', gap: '2px', marginTop: 'auto', marginBottom: '4px' }}>
                      {tile.villas! > 0 && <span title="별장">🏠</span>}
                      {tile.buildings! > 0 && <span title="빌딩">🏢</span>}
                      {tile.hotels! > 0 && <span title="호텔">🏨</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Absolute rendering of moving tokens */}
        {state.players.map((p) => {
          const currentVisual = visualPositions[p.id] ?? p.position;
          const coords = getTileCoords(currentVisual);
          
          let icon = '';
          switch(p.tokenId) {
            case 'rocket': icon = '🚀'; break;
            case 'sailboat': icon = '⛵'; break;
            case 'car': icon = '🚗'; break;
            case 'plane': icon = '✈️'; break;
            case 'train': icon = '🚂'; break;
            case 'balloon': icon = '🎈'; break;
          }

          // Add slight offset if multiple players on same tile
          const playersOnSameVisual = state.players.filter(other => (visualPositions[other.id] ?? other.position) === currentVisual);
          const indexInSame = playersOnSameVisual.findIndex(other => other.id === p.id);
          const offsetX = playersOnSameVisual.length > 1 ? (indexInSame % 2 === 0 ? -12 : 12) : 0;
          const offsetY = playersOnSameVisual.length > 1 ? (indexInSame < 2 ? -12 : 12) : 0;

          return (
            <div 
              key={p.id} 
              style={{
                position: 'absolute',
                top: 0, left: 0,
                width: '32px', height: '32px',
                borderRadius: '16px',
                backgroundColor: p.color,
                border: '2px solid white',
                boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                fontSize: '18px',
                transform: `translate(${coords.x - 16 + offsetX}px, ${coords.y - 16 + offsetY}px)`,
                transition: 'transform 0.15s linear',
                zIndex: 100 + p.id
              }}
              title={p.name}
            >
              {icon}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Board;
