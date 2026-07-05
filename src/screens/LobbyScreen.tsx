import React, { useState, useRef, useEffect } from 'react';
import styles from './LobbyScreen.module.css';
import { useGame } from '../game/GameContext';
import SelectionModal from './SelectionModal';

interface LobbyScreenProps {
  onBack: () => void;
  onPlay: () => void;
}

type LobbyMode = 'SELECT' | 'CREATE' | 'JOIN';

const LobbyScreen: React.FC<LobbyScreenProps> = ({ onBack, onPlay }) => {
  const { state, dispatch } = useGame();
  const [mode, setMode] = useState<LobbyMode>('SELECT');
  const [code, setCode] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [selectingTokenForPlayerId, setSelectingTokenForPlayerId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate random code when entering CREATE mode
  useEffect(() => {
    if (mode === 'CREATE' && !roomCode) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setRoomCode(result);
    }
  }, [mode, roomCode]);

  // Focus input automatically when JOIN mode is entered
  useEffect(() => {
    if (mode === 'JOIN') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [mode]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (val.length <= 6) {
      setCode(val);
    }
  };

  const handleJoinSubmit = () => {
    if (code.length === 6) {
      // Simulate successful join by transitioning to the lobby
      setMode('CREATE');
    } else {
      alert("6자리 코드를 모두 입력해주세요.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.bgDecoration} />
      <div className={styles.glow} />

      {mode === 'SELECT' && (
        <div className={styles.modalDialog}>
          <button className={styles.closeBtn} onClick={onBack}>✕</button>
          <div className={styles.modalTitle}>게임 시작</div>
          
          <div className={styles.optionsContainer}>
            <div className={styles.optionCard} onClick={() => setMode('JOIN')}>
              <div className={styles.optionIcon}>👥</div>
              <div className={styles.optionTitle}>참여하기</div>
              <button className={`${styles.btn} ${styles.btnPrimary}`} style={{padding: '16px 32px', fontSize: '16px'}}>코드 입력</button>
            </div>
            
            <div className={styles.optionCard} onClick={() => setMode('CREATE')}>
              <div className={styles.optionIcon}>➕</div>
              <div className={styles.optionTitle}>방 만들기</div>
              <button className={`${styles.btn} ${styles.btnPrimary}`} style={{padding: '16px 32px', fontSize: '16px'}}>생성하기</button>
            </div>
          </div>
        </div>
      )}

      {mode === 'JOIN' && (
        <div className={styles.roomLayout}>
          <div className={styles.roomHeader}>
            <div className={styles.headerIcon}>🔑</div>
            <div className={styles.roomTitle}>참여하기</div>
            <div className={styles.roomSubtitle}>입장 코드를 입력해주세요</div>
          </div>

          <div className={styles.codeInputContainer} onClick={() => inputRef.current?.focus()}>
            <input 
              ref={inputRef}
              type="text" 
              className={styles.hiddenInput}
              value={code}
              onChange={handleCodeChange}
              maxLength={6}
            />
            {Array.from({ length: 6 }).map((_, idx) => {
              const isActive = code.length === idx;
              const char = code[idx] || '';
              return (
                <div key={idx} className={`${styles.codeSlot} ${isActive ? styles.active : ''}`}>
                  {char}
                  {isActive && <div className={styles.cursor} />}
                </div>
              );
            })}
          </div>

          <div className={styles.actions} style={{marginTop: '20px'}}>
            <button className={styles.btn} onClick={() => setMode('SELECT')}>취소하기</button>
            <button 
              className={`${styles.btn} ${code.length === 6 ? styles.btnPrimary : ''}`} 
              onClick={handleJoinSubmit}
            >
              입장하기
            </button>
          </div>

          <div className={styles.tipBox}>
            <div style={{fontSize: '20px'}}>ℹ️</div>
            <div className={styles.tipText}>친구에게 받은 6자리 코드를 정확히 입력해주세요!</div>
          </div>
        </div>
      )}

      {mode === 'CREATE' && (
        <div className={styles.roomLayout}>
          <div className={styles.roomHeader}>
            <div className={styles.roomTitle}>방 만들기</div>
            <div className={styles.roomSubtitle}>Create Game Lobby</div>
          </div>

          <div className={styles.codeSection}>
            <div className={styles.codeLabel}>Room Code</div>
            <div className={styles.codeBox}>
              <div className={styles.codeText}>{roomCode}</div>
              <div className={styles.copyBtn} onClick={handleCopyCode} title="복사">
                {isCopied ? "✅" : "📋"}
              </div>
            </div>
          </div>

          <div className={styles.playerGrid}>
            {state.players.map((p, idx) => {
              const TokenIcon = () => {
                switch(p.tokenId) {
                  case 'rocket': return '🚀';
                  case 'sailboat': return '⛵';
                  case 'car': return '🚗';
                  case 'plane': return '✈️';
                  case 'train': return '🚂';
                  case 'balloon': return '🎈';
                  default: return idx === 0 ? '👑' : '👤';
                }
              };

              return (
                <div 
                  key={p.id} 
                  className={`${styles.playerSlot} ${idx === 0 ? styles.host : ''}`}
                  onClick={() => setSelectingTokenForPlayerId(p.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.slotAvatar} style={{ backgroundColor: p.tokenId ? '#dbeafe' : p.color, color: p.tokenId ? '#111827' : 'white' }}>
                    <TokenIcon />
                  </div>
                  <div className={styles.slotName}>{p.name}</div>
                  <div className={`${styles.slotStatus} ${idx === 0 ? styles.hostBadge : ''}`}>
                    {p.tokenId ? '말 선택 완료' : <span style={{ color: '#ef4444', animation: 'pulse 1s infinite' }}>[말 선택하기 👆]</span>}
                  </div>
                </div>
              );
            })}
            {Array.from({ length: 4 - state.players.length }).map((_, idx) => (
              <div key={`empty-${idx}`} className={styles.playerSlot}>
                <div className={styles.slotAvatar}>👤</div>
                <div className={styles.slotName}>빈 슬롯</div>
                <div className={styles.slotStatus}>대기 중...</div>
              </div>
            ))}
          </div>

          <div className={styles.actions}>
            {state.players.length < 4 && (
              <button 
                className={styles.btn} 
                onClick={() => dispatch({ 
                  type: 'ADD_PLAYER', 
                  payload: { name: `Player ${state.players.length + 1}`, color: ['#3B82F6', '#10B981', '#F59E0B'][state.players.length - 1] }
                })}
              >
                테스트: P{state.players.length + 1} 추가
              </button>
            )}
            <button className={styles.btn} onClick={() => setMode('SELECT')}>나가기</button>
            <button 
              className={`${styles.btn} ${state.players.length >= 2 && state.players.every(p => p.tokenId) ? styles.btnPrimary : ''}`} 
              onClick={() => {
                if (state.players.length < 2) {
                  alert("게임을 시작하려면 최소 2명의 플레이어가 필요합니다.");
                  return;
                }
                if (!state.players.every(p => p.tokenId)) {
                  alert("모든 플레이어가 캐릭터(말)를 선택해야 합니다. 프로필을 클릭하세요!");
                  return;
                }
                dispatch({ type: 'START_GAME' });
                onPlay();
              }}
            >
              게임 시작
            </button>
          </div>
          
          {selectingTokenForPlayerId !== null && (
            <SelectionModal 
              playerId={selectingTokenForPlayerId} 
              onClose={() => setSelectingTokenForPlayerId(null)} 
            />
          )}
        </div>
      )}
    </div>
  );
};

export default LobbyScreen;
