import React, { useMemo } from 'react';
import { useGame } from '../game/GameContext';
import styles from './GameOverScreen.module.css';

const GameOverScreen: React.FC = () => {
  const { state } = useGame();

  const playersWithAssets = useMemo(() => {
    return state.players.map(player => {
      let propertyAssets = 0;
      state.board.forEach(tile => {
        if (tile.ownerId === player.id) {
          propertyAssets += (tile.price || 0) +
            (tile.villas || 0) * (tile.villaPrice || 0) +
            (tile.buildings || 0) * (tile.buildingPrice || 0) +
            (tile.hotels || 0) * (tile.hotelPrice || 0);
        }
      });
      return {
        ...player,
        totalAssets: player.cash + propertyAssets
      };
    }).sort((a, b) => b.totalAssets - a.totalAssets);
  }, [state.players, state.board]);

  const winner = playersWithAssets[0];
  const otherPlayers = playersWithAssets.slice(1);
  const myPlayerId = Number(localStorage.getItem('myPlayerId'));

  return (
    <div className={styles.gameOverContainer}>
      <div className={styles.bgDecoration} />
      
      <div className={styles.contentWrapper}>
        <div className={styles.title}>CONGRATULATIONS</div>
        
        {winner && (
          <div className={styles.winnerCard}>
            <img src={`${import.meta.env.BASE_URL}assets/trophy.svg`} alt="Trophy" className={styles.trophyIcon} onError={(e) => {
              // Fallback to emoji if trophy icon doesn't exist
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement?.insertAdjacentHTML('afterbegin', '<div style="font-size: 64px; margin-bottom: 16px;">🏆</div>');
            }} />
            
            <div className={styles.avatarContainer}>
              <img src={`${import.meta.env.BASE_URL}assets/players/p${winner.id}.png`} alt={winner.name} className={styles.avatar} onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${winner.name}`;
              }} />
            </div>
            
            <div className={styles.winnerName}>
              {winner.name} {winner.id === myPlayerId ? '(Me)' : ''}
            </div>
            
            <div className={styles.winnerBadge}>WINNER</div>
            
            <div className={styles.assetsLabel}>최종 총 자산</div>
            <div className={styles.assetsAmount}>
              ₩{winner.totalAssets.toLocaleString()}
            </div>
          </div>
        )}
        
        <div className={styles.playerList}>
          {otherPlayers.map((player, index) => (
            <div key={player.id} className={styles.playerRow}>
              <div className={styles.rankNumber}>{index + 2}</div>
              
              <div className={styles.rowAvatar}>
                <img src={`${import.meta.env.BASE_URL}assets/players/p${player.id}.png`} alt={player.name} onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}`;
                }} />
              </div>
              
              <div className={styles.rowName}>
                {player.name} {player.id === myPlayerId ? '(Me)' : ''}
              </div>
              
              <div className={styles.rowAssetsInfo}>
                <div className={styles.rowAssetsLabel}>총 자산</div>
                <div className={`${styles.rowAssetsAmount} ${!player.isActive ? styles.bankruptAmount : ''}`}>
                  {player.isActive ? `₩${player.totalAssets.toLocaleString()}` : '파산'}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button 
          className={styles.returnButton}
          onClick={() => window.location.href = import.meta.env.BASE_URL}
        >
          로비로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default GameOverScreen;
