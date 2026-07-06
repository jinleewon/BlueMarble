import React from 'react';
import styles from './HomeScreen.module.css';

interface HomeScreenProps {
  onStart: () => void;
  onRules: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onStart, onRules }) => {
  return (
    <div className={styles.container}>
      <div className={styles.bgDecoration} />
      
      <div className={styles.centerArea}>
        <img src={`${import.meta.env.BASE_URL}assets/globe.png`} alt="Globe" className={styles.globe} />
        <div className={styles.logo}>BLUE MARBLE</div>
      </div>

      <div className={styles.menu}>
        <button className={styles.btn}>설정</button>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={onStart}>게임 시작</button>
        <button className={styles.btn} onClick={onRules}>도움말</button>
      </div>

      <div className={styles.footer}>
        © 2026 BLUE MARBLE GAME. All rights reserved. Version 1.0.0
      </div>
    </div>
  );
};

export default HomeScreen;
