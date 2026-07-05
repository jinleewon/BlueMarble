import React from 'react';
import styles from './PropertyDeedModal.module.css';
import { useGame } from '../game/GameContext';

interface PropertyDeedModalProps {
  tileId: number;
  onClose: () => void;
}

export const getTileCountry = (id: number) => {
  const map: Record<number, string> = {
    1: '대만', 3: '중국', 4: '필리핀', 5: '한국', 6: '싱가포르', 
    8: '이집트', 9: '튀르키예', 11: '그리스', 13: '덴마크', 14: '스웨덴',
    15: '여객기', 16: '스위스', 18: '독일', 19: '캐나다', 21: '아르헨티나',
    23: '브라질', 24: '호주', 25: '한국', 26: '미국', 27: '포르투갈',
    28: '유람선', 29: '스페인', 31: '일본', 32: '우주선', 33: '프랑스',
    34: '이탈리아', 36: '영국', 37: '미국', 39: '한국'
  };
  return map[id] || '';
};

export const getTileImage = (name: string) => {
  const fileNameMap: Record<string, string> = {
    '타이베이': '타이베이.png',
    '베이징': '홍콩.png',
    '마닐라': '마닐라.png',
    '제주도': '제주도.png',
    '싱가포르': '싱가포르.png',
    '카이로': '카이로.png',
    '이스탄불': '이스탄불.png',
    '아테네': '아테네.png',
    '코펜하겐': '코펜하겐.png',
    '스톡홀름': '스톡홀름.png',
    '취리히': '취히리.png',
    '베를린': '베를린.png',
    '몬트리올': '몬트리올.png',
    '부에노스아이레스': '부에노스.png',
    '상파울루': '상파울루.png',
    '시드니': '시드니.png',
    '부산': '부산.png',
    '하와이': '하와이.png',
    '리스본': '리스본.png',
    '마드리드': '마드리드.png',
    '도쿄': '도쿄.png',
    '파리': '파리.png',
    '로마': '로마.png',
    '런던': '런던.png',
    '뉴욕': '뉴욕.png',
    '서울': '서울.png',
    '콩코드 여객기': '콩코드여객기.png',
    '퀸엘리자베스호': '퀸엘리자베스.png',
    '콜롬비아호': '콜롬비아호.png',
  };
  const fileName = fileNameMap[name];
  if (!fileName) return '';
  return new URL(`../assets/${fileName}`, import.meta.url).href;
};

export const getTileColor = (id: number) => {
  if ([1, 2, 3, 4, 11, 12, 13, 14].includes(id)) return '#facc15'; // Yellow
  if ([6, 7, 8, 9, 21, 22, 23, 24].includes(id)) return '#ec4899'; // Pink
  if ([16, 17, 18, 19].includes(id)) return '#f97316'; // Orange
  if ([26, 27, 29, 31, 33, 34, 35, 36, 37].includes(id)) return '#3b82f6'; // Blue
  if ([5, 25].includes(id)) return '#22c55e'; // Green (Jeju, Busan)
  if ([15, 28, 32].includes(id)) return '#a855f7'; // Purple (Concorde, Queen, Columbia)
  if (id === 39) return '#ef4444'; // Red (Seoul)
  return '#facc15'; // Default
};

const formatAmount = (amount: number) => {
  if (amount >= 10000) {
    const man = amount / 10000;
    // Show up to 1 decimal place if it's not a whole number (e.g. 1.5만)
    return `₩${Number.isInteger(man) ? man : man.toFixed(1)}만`;
  }
  return `₩${amount.toLocaleString()}`;
};

const PropertyDeedModal: React.FC<PropertyDeedModalProps> = ({ tileId, onClose }) => {
  const { state } = useGame();
  const tile = state.board[tileId];

  if (!tile) return null;

  const bgColor = getTileColor(tileId);
  const country = getTileCountry(tileId);
  const imagePath = getTileImage(tile.name);
  
  // Decide if this is a city with buildings or a special tourist/vehicle spot
  const hasBuildings = tile.villaPrice !== undefined;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
        
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
              
              {!hasBuildings && (
                <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '30px', fontSize: '13px' }}>
                  이 자산은 구매 후 건물을<br/>추가로 건설할 수 없습니다.
                </div>
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
    </div>
  );
};

export default PropertyDeedModal;
