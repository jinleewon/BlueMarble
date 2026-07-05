import React from 'react';
import styles from './RulesScreen.module.css';

interface RulesScreenProps {
  onBack: () => void;
}

const RulesScreen: React.FC<RulesScreenProps> = ({ onBack }) => {
  return (
    <div className={styles.container}>
      <div className={styles.bgDecoration} />
      <div className={styles.glow} />

      <div className={styles.navbar}>
        <button className={styles.backBtn} onClick={onBack}>
          <span style={{ fontSize: '20px' }}>←</span>
          <span className={styles.backBtnText}>뒤로가기</span>
        </button>
        <h1 className={styles.title}>게임 규칙</h1>
        <div className={styles.placeholder} />
      </div>

      <div className={styles.contentScroll}>
        
        {/* 1. 게임 목표 */}
        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>1. 게임 목표</h2>
          <div className={styles.row}>
            <div style={{fontSize: '80px'}}>🎲</div>
            <p className={styles.ruleText}>
              주사위를 굴려 세계 각국을 여행하며 도시를 매입하고 건물을 건설하세요!{' '}
              <span className={styles.highlight}>다른 플레이어를 모두 파산시키고 최후의 1인이 되는 것</span>
              이 이 게임의 유일한 목표입니다.
            </p>
          </div>
        </div>

        {/* 2. 게임 진행 */}
        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>2. 게임 진행</h2>
          <div className={styles.stepList}>
            <div className={styles.stepRow}>
              <div className={styles.stepNumber}>01</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>주사위 굴리기</h3>
                <p className={styles.stepDesc}>두 개의 주사위를 굴려 나온 합만큼 칸을 이동합니다. '더블'이 나오면 한 번 더!</p>
              </div>
            </div>
            <div className={styles.stepRow}>
              <div className={styles.stepNumber}>02</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>도시 매입 및 건설</h3>
                <p className={styles.stepDesc}>도착한 칸이 주인이 없다면 해당 도시를 구매하고 별장, 빌딩, 호텔을 지을 수 있습니다.</p>
              </div>
            </div>
            <div className={styles.stepRow}>
              <div className={styles.stepNumber}>03</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>통행료 징수</h3>
                <p className={styles.stepDesc}>다른 플레이어가 내 도시 도착하면 정해진 통행료를 받습니다. 건물이 많을수록 통행료가 비싸집니다.</p>
              </div>
            </div>
            <div className={styles.stepRow}>
              <div className={styles.stepNumber}>04</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>파산 주의</h3>
                <p className={styles.stepDesc}>가진 돈이 부족해 통행료를 낼 수 없게 되면 파산하며 게임에서 탈락하게 됩니다.</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. 건물 종류 */}
        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>3. 건물 종류</h2>
          <div className={styles.buildingsRow}>
            <div className={styles.buildingCard}>
              <div className={`${styles.buildingIconWrapper} ${styles.bHome}`}>🏠</div>
              <div>
                <p className={styles.bTitle}>별장</p>
                <p className={styles.bPrice}>₩5만</p>
              </div>
              <p className={styles.bDesc}>가장 저렴한 기초 건물입니다. 성장의 시작점!</p>
            </div>
            <div className={styles.buildingCard}>
              <div className={`${styles.buildingIconWrapper} ${styles.bBuilding}`}>🏢</div>
              <div>
                <p className={styles.bTitle}>빌딩</p>
                <p className={styles.bPrice}>₩10만</p>
              </div>
              <p className={styles.bDesc}>높은 층수의 건물로 통행료가 크게 상승합니다.</p>
            </div>
            <div className={styles.buildingCard}>
              <div className={`${styles.buildingIconWrapper} ${styles.bHotel}`}>🏨</div>
              <div>
                <p className={styles.bTitle}>호텔</p>
                <p className={styles.bPrice}>₩15만</p>
              </div>
              <p className={styles.bDesc}>최고 등급의 건물입니다. 상대에게 치명타를 입히세요.</p>
            </div>
          </div>
        </div>

        {/* 4. 특수 칸 설명 */}
        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>4. 특수 칸 설명</h2>
          <div className={styles.specialsList}>
            <div className={styles.specialCard}>
              <div className={styles.specialIcon} style={{backgroundColor: '#ffd700'}}>▶️</div>
              <div className={styles.specialContent}>
                <div className={styles.specialHeader}>
                  <p className={styles.specialTitle}>출발 (GO)</p>
                  <span className={styles.specialBadge}>월급</span>
                </div>
                <p className={styles.specialDesc}>출발지를 지날 때마다 월급 ₩20만 원을 받습니다.</p>
              </div>
            </div>
            <div className={styles.specialCard}>
              <div className={styles.specialIcon} style={{backgroundColor: '#06b6d4'}}>🏝️</div>
              <div className={styles.specialContent}>
                <div className={styles.specialHeader}>
                  <p className={styles.specialTitle}>무인도</p>
                  <span className={styles.specialBadge}>지체</span>
                </div>
                <p className={styles.specialDesc}>3턴 동안 대기해야 합니다. 주사위 '더블'이 나오면 즉시 탈출!</p>
              </div>
            </div>
            <div className={styles.specialCard}>
              <div className={styles.specialIcon} style={{backgroundColor: '#8b5cf6'}}>🚀</div>
              <div className={styles.specialContent}>
                <div className={styles.specialHeader}>
                  <p className={styles.specialTitle}>우주여행</p>
                  <span className={styles.specialBadge}>이동</span>
                </div>
                <p className={styles.specialDesc}>다음 턴에 원하는 도시 어디든 즉시 이동할 수 있습니다.</p>
              </div>
            </div>
            <div className={styles.specialCard}>
              <div className={styles.specialIcon} style={{backgroundColor: '#ff6b9d'}}>❤️</div>
              <div className={styles.specialContent}>
                <div className={styles.specialHeader}>
                  <p className={styles.specialTitle}>사회복지기금</p>
                  <span className={styles.specialBadge}>적립/수령</span>
                </div>
                <p className={styles.specialDesc}>칸에 따라 기금을 내거나, 쌓인 모든 기금을 한 번에 수령합니다.</p>
              </div>
            </div>
            <div className={styles.specialCard}>
              <div className={styles.specialIcon} style={{backgroundColor: '#facc15'}}>🔑</div>
              <div className={styles.specialContent}>
                <div className={styles.specialHeader}>
                  <p className={styles.specialTitle}>황금열쇠</p>
                  <span className={styles.specialBadge}>랜덤</span>
                </div>
                <p className={styles.specialDesc}>행운 혹은 불운이 담긴 카드를 뽑아 지시를 수행합니다.</p>
              </div>
            </div>
          </div>
        </div>

        {/* 5. 승리 조건 */}
        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>5. 승리 조건</h2>
          <div className={styles.winBox}>
            <div className={styles.winTrophy}>🏆</div>
            <p className={styles.winTitle}>마지막까지 살아남는 자가 승자!</p>
            <p className={styles.winDesc}>다른 모든 플레이어가 자산 부족으로 파산하고 나면 게임이 즉시 종료되며, 유일하게 남은 플레이어가 부루마블의 최종 승리자가 됩니다.</p>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <p className={styles.fCopy}>© 2024 SEEDNOVEL CO., LTD. ALL RIGHTS RESERVED.</p>
        <p className={styles.fVer}>Blue Marble Desktop Edition Ver 1.2.0</p>
      </div>

    </div>
  );
};

export default RulesScreen;
