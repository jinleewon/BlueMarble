import React, { useEffect, useState } from 'react';
import styles from './DiceOverlay.module.css';

interface DiceOverlayProps {
  result: [number, number];
}

const DiceOverlay: React.FC<DiceOverlayProps> = ({ result }) => {
  const [d1, d2] = result;
  const isDouble = d1 === d2;
  const total = d1 + d2;
  
  const [displayD1, setDisplayD1] = useState(Math.floor(Math.random() * 6) + 1);
  const [displayD2, setDisplayD2] = useState(Math.floor(Math.random() * 6) + 1);
  const [isRolling, setIsRolling] = useState(true);

  useEffect(() => {
    if (!isRolling) return;
    
    // Randomize face every 100ms
    const interval = setInterval(() => {
      setDisplayD1(Math.floor(Math.random() * 6) + 1);
      setDisplayD2(Math.floor(Math.random() * 6) + 1);
    }, 100);

    // Stop rolling after 1s (matching CSS animation time)
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setDisplayD1(result[0]);
      setDisplayD2(result[1]);
      setIsRolling(false);
    }, 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isRolling, result]);

  const renderDie = (value: number) => {
    return (
      <div className={`${styles.die} ${styles.rolling} ${styles[`face-${value}`]}`}>
        {Array.from({ length: value }).map((_, idx) => (
          <div key={idx} className={styles.pip} />
        ))}
      </div>
    );
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.diceContainer}>
        {renderDie(displayD1)}
        {renderDie(displayD2)}
      </div>

      <div className={styles.resultPanel}>
        <div className={styles.resultText}>
          <span className={styles.highlight}>{total} 칸 이동</span>
        </div>
        {isDouble && <div className={styles.doubleBadge}>Double!</div>}
      </div>
    </div>
  );
};

export default DiceOverlay;
