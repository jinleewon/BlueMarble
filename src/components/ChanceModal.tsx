import React, { useState } from 'react';
import { useGame } from '../game/GameContext';
import styles from './ChanceModal.module.css';
import type { ChanceCard } from '../game/types';

const IncomeCardContent: React.FC<{ card: ChanceCard }> = ({ card }) => {
  const parts = card.description.split('\n');
  const mainDesc = parts[0] || '';
  const amountDesc = parts[1] || '';

  return (
    <>
      <div className={`${styles.cardHeader} ${styles.incomeHeader}`}>
        <div className={styles.headerIcon}>🗝️</div>
        <div>황금 열쇠</div>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.illustrationWrapper}>
          <div className={styles.placeholderIcon}>🌟</div>
        </div>
        <div className={styles.titleWrapper}>
          <div className={styles.incomeTitle}>{card.title}</div>
          <div className={styles.incomeBadge}>수입 (INCOME)</div>
        </div>
        <div className={styles.descWrapper}>
          <div className={styles.incomeDesc}>{mainDesc}</div>
          <div className={styles.incomeAmount}>{amountDesc}</div>
        </div>
      </div>
      <div className={styles.bottomBarIncome}></div>
    </>
  );
};

const ExpenseCardContent: React.FC<{ card: ChanceCard }> = ({ card }) => {
  const parts = card.description.split('\n');
  const mainDesc = parts.filter(p => !p.startsWith('•') && !p.startsWith('-')).join('\n');
  const listItems = parts.filter(p => p.startsWith('•') || p.startsWith('-'));

  return (
    <>
      <div className={`${styles.cardHeader} ${styles.expenseHeader}`}>
        <div className={styles.expenseEmblem}>
          <div className={styles.emblemIcon}>🗝️</div>
        </div>
        <div className={styles.expenseHeaderTitle}>황금 열쇠</div>
      </div>
      <div className={styles.cardBodyExpense}>
        <div className={styles.expenseBadge}>지출 (EXPENSE)</div>
        <div className={styles.titleWrapperExpense}>
          <div className={styles.expenseTitle}>{card.title}</div>
          <div className={styles.expenseUnderline}></div>
        </div>
        <div className={styles.expenseIconContainer}>
          <div className={styles.placeholderIconExpense}>💸</div>
        </div>
        <div className={styles.descWrapperExpense}>
          <div className={styles.expenseDesc}>{mainDesc}</div>
          {listItems.length > 0 && (
            <div className={styles.expenseBreakdown}>
              {listItems.map((item, i) => <div key={i}>{item}</div>)}
            </div>
          )}
        </div>
      </div>
      <div className={styles.bottomBarExpense}></div>
    </>
  );
};

const MovementCardContent: React.FC<{ card: ChanceCard }> = ({ card }) => {
  const isSpecial = card.type === 'special';
  
  return (
    <div className={styles.movementInner}>
      <div className={styles.movementHeader}>
        <div className={styles.movementIconBox}>
          <div className={styles.headerIconMovement}>🗝️</div>
        </div>
        <div className={styles.movementHeaderTitle}>황금 열쇠</div>
        <div className={styles.movementBadge}>{isSpecial ? '특수' : '이동'}</div>
      </div>
      <div className={styles.movementContent}>
        <div className={styles.titleWrapperMovement}>
          <div className={styles.movementTitle}>{card.title}</div>
          <div className={styles.movementUnderline}></div>
        </div>
        <div className={styles.movementDesc}>{card.description}</div>
      </div>
      <div className={styles.movementFooter}>
        <span className={styles.footerBrand}>BLUE MARBLE</span>
        <span className={styles.footerSparkle}>✨</span>
        <span className={styles.footerSub}>GOLDEN KEY</span>
      </div>
    </div>
  );
};

const ChanceModal: React.FC = () => {
  const { state, dispatch } = useGame();
  const [flipped, setFlipped] = useState(false);

  if (state.turnPhase !== 'chance_card') return null;

  const card = state.activeChanceCard;

  const handleCardClick = () => {
    if (!flipped) {
      dispatch({ type: 'DRAW_CHANCE_CARD' });
      setFlipped(true);
    }
  };

  const handleConfirm = () => {
    dispatch({ type: 'APPLY_CHANCE_CARD' });
  };

  const getCardStyle = () => {
    if (!card) return '';
    if (card.type === 'income') return styles.cardFrontIncome;
    if (card.type === 'expense') return styles.cardFrontExpense;
    return styles.cardFrontMovement;
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>황금 열쇠</h2>
        
        <div 
          className={`${styles.cardContainer} ${flipped ? styles.flipped : ''}`}
          onClick={handleCardClick}
        >
          <div className={styles.cardInner}>
            {/* Card Back */}
            <div className={`${styles.cardFace} ${styles.cardBack}`}>
              <div className={styles.keyIcon}>🗝️</div>
              <div className={styles.backText}>CHANCE</div>
            </div>
            
            {/* Card Front */}
            <div className={`${styles.cardFace} ${styles.cardFront} ${getCardStyle()}`}>
              {card?.type === 'income' && <IncomeCardContent card={card} />}
              {card?.type === 'expense' && <ExpenseCardContent card={card} />}
              {(card?.type === 'movement' || card?.type === 'special') && <MovementCardContent card={card} />}
            </div>
          </div>
        </div>

        {flipped && card && (
          <button className={styles.btn} onClick={handleConfirm}>
            확인
          </button>
        )}
      </div>
    </div>
  );
};

export default ChanceModal;
