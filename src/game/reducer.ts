import type { GameState, GameAction } from './types';
import { INITIAL_BOARD } from './board';
import { CHANCE_CARDS } from './cards';

const shuffle = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const INITIAL_STATE: GameState = {
  players: [
    { id: 1, name: '나 (1P)', color: '#EF4444', cash: 3000000, position: 0, isActive: true, isInIsland: false, islandTurnsLeft: 0, hasEscapeCard: false, isSpaceTravel: false, loanAmount: 0, loanTurnsLeft: 0, hasPassedStart: false },
  ],
  currentPlayerIndex: 0,
  board: INITIAL_BOARD,
  diceResult: null,
  doubleCount: 0,
  fundBalance: 0,
  chanceDeck: shuffle(CHANCE_CARDS),
  turnPhase: 'idle',
  messageLog: ['게임을 시작합니다!']
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const isTwoPlayers = state.players.length === 2;
      const initialCash = isTwoPlayers ? 6800000 : 3400000;
      
      const updatedPlayers = state.players.map(p => ({
        ...p,
        cash: initialCash
      }));

      return {
        ...state,
        players: updatedPlayers,
        turnPhase: 'pre_roll',
        messageLog: ['게임을 시작합니다!', isTwoPlayers ? '2인 플레이: 시작 자금 680만원' : `시작 자금 ${initialCash/10000}만원`]
      };
    }

    case 'ROLL_DICE': {
      const currentPlayer = state.players[state.currentPlayerIndex];
      
      // If preparing for space travel, shouldn't roll dice normally (UI should block this)
      if (currentPlayer.isSpaceTravel) {
        return state;
      }

      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const isDouble = d1 === d2;

      // Handle Island escape attempt
      if (currentPlayer.islandTurnsLeft > 0) {
        if (isDouble) {
          const updatedPlayers = state.players.map(p => 
            p.id === currentPlayer.id ? { ...p, islandTurnsLeft: 0 } : p
          );
          return {
            ...state,
            players: updatedPlayers,
            diceResult: [d1, d2],
            turnPhase: 'move',
            messageLog: [...state.messageLog, `${currentPlayer.name}님이 주사위 더블(${d1}, ${d2})로 무인도를 탈출합니다!`]
          };
        } else {
          const newTurnsLeft = currentPlayer.islandTurnsLeft - 1;
          const updatedPlayers = state.players.map(p => 
            p.id === currentPlayer.id ? { ...p, islandTurnsLeft: newTurnsLeft } : p
          );
          return {
            ...state,
            players: updatedPlayers,
            diceResult: [d1, d2],
            // Delay for showing dice result, handled in App.tsx
            turnPhase: 'island_fail', 
            messageLog: [...state.messageLog, `${currentPlayer.name}님이 무인도 탈출에 실패했습니다. (주사위: ${d1}, ${d2} / 남은 턴: ${newTurnsLeft})`]
          };
        }
      }

      return {
        ...state,
        diceResult: [d1, d2],
        doubleCount: isDouble ? state.doubleCount + 1 : 0,
        turnPhase: 'move',
        messageLog: [...state.messageLog, `${currentPlayer.name}님이 주사위를 굴렸습니다. (${d1}, ${d2})`]
      };
    }
    
    case 'USE_ESCAPE_CARD': {
      const currentPlayer = state.players[state.currentPlayerIndex];
      if (!currentPlayer.hasEscapeCard || currentPlayer.islandTurnsLeft === 0) return state;

      const updatedPlayers = state.players.map(p => 
        p.id === currentPlayer.id ? { ...p, hasEscapeCard: false, islandTurnsLeft: 0 } : p
      );

      return {
        ...state,
        players: updatedPlayers,
        messageLog: [...state.messageLog, `${currentPlayer.name}님이 무인도 탈출권을 사용했습니다! 이제 주사위를 굴릴 수 있습니다.`]
      };
    }
    
    case 'USE_EXEMPTION_CARD': {
      const currentPlayer = state.players[state.currentPlayerIndex];
      if (!currentPlayer.hasExemptionCard) return state;

      const updatedPlayers = state.players.map(p => 
        p.id === currentPlayer.id ? { ...p, hasExemptionCard: false } : p
      );

      return {
        ...state,
        players: updatedPlayers,
        messageLog: [...state.messageLog, `${currentPlayer.name}님이 우대권을 사용하여 통행료를 면제받았습니다!`]
      };
    }
    
    case 'MOVE_PLAYER': {
      if (state.turnPhase !== 'move') return state;
      
      const currentPlayer = state.players[state.currentPlayerIndex];
      let newPosition = currentPlayer.position + action.payload.steps;
      let passedStart = false;
      
      if (newPosition >= 40) {
        newPosition = newPosition % 40;
        passedStart = true;
      }
      
      let newFundBalance = state.fundBalance;
      
      const updatedPlayers = state.players.map(p => {
        if (p.id === currentPlayer.id) {
          let updatedCash = passedStart ? p.cash + 200000 : p.cash;
          let newPassedStartFlag = passedStart ? true : p.hasPassedStart;
          let newIslandTurns = p.islandTurnsLeft;
          let newIsSpace = false;

          // Special Tiles Effects
          if (newPosition === 10) {
            newIslandTurns = 3;
          } else if (newPosition === 30) {
            newIsSpace = true;
          } else if (newPosition === 38) {
            if (updatedCash < 150000) {
              // We will handle it after the loop using the pendingPayment state
            } else {
              updatedCash -= 150000;
              newFundBalance += 150000;
            }
          } else if (newPosition === 20) {
            updatedCash += state.fundBalance;
            newFundBalance = 0;
          }

          return { 
            ...p, 
            position: newPosition,
            cash: updatedCash,
            islandTurnsLeft: newIslandTurns,
            isSpaceTravel: newIsSpace,
            hasPassedStart: newPassedStartFlag
          };
        }
        return p;
      });

      let extraMessage = passedStart ? ' (월급 20만원 획득)' : '';
      if (newPosition === 10) extraMessage += ' - 무인도에 갇혔습니다! (3턴)';
      if (newPosition === 30) extraMessage += ' - 다음 턴에 우주여행을 떠납니다!';
      if (newPosition === 38) extraMessage += ' - 사회복지기금 15만원 납부';
      if (newPosition === 20 && state.fundBalance > 0) extraMessage += ` - 사회복지기금 ${state.fundBalance}만원 수령!`;

      // Check if insolvent on 38
      let newTurnPhase = 'action' as GameState['turnPhase'];
      let newPendingPayment = state.pendingPayment;
      if (newPosition === 38 && (passedStart ? currentPlayer.cash + 200000 : currentPlayer.cash) < 150000) {
        newTurnPhase = 'insolvent';
        newPendingPayment = { amount: 150000, to: 'bank', reason: '사회복지기금' };
        extraMessage += ' - [자금 부족! 매각/대출 필요]';
      } else if (state.board[newPosition].type === 'chance') {
        newTurnPhase = 'chance_card';
      }

      return {
        ...state,
        players: updatedPlayers,
        fundBalance: newFundBalance,
        turnPhase: newTurnPhase,
        pendingPayment: newPendingPayment,
        lastMovementType: 'forward',
        messageLog: [...state.messageLog, `${currentPlayer.name}님이 ${state.board[newPosition].name}(으)로 이동했습니다.${extraMessage}`]
      };
    }

    case 'SPACE_TRAVEL_MOVE': {
      const { targetTileId } = action.payload;
      const currentPlayer = state.players[state.currentPlayerIndex];
      
      let passedStart = false;
      if (targetTileId < currentPlayer.position && targetTileId !== 30) {
        // passedStart is only true if moving forward past start. Space travel allows moving anywhere. 
        // Typically space travel passes start if target < position.
        passedStart = true;
      }

      let newFundBalance = state.fundBalance;
      let newTurnPhase = 'action' as GameState['turnPhase'];
      let newPendingPayment = state.pendingPayment;
      let extraMessage = passedStart ? ' (월급 20만원 획득)' : '';

      const updatedPlayers = state.players.map(p => {
        if (p.id === currentPlayer.id) {
          let updatedCash = passedStart ? p.cash + 200000 : p.cash;
          let newPassedStartFlag = passedStart ? true : p.hasPassedStart;
          let newIslandTurns = p.islandTurnsLeft;
          let newIsSpace = false;

          if (targetTileId === 10) {
            newIslandTurns = 3;
            extraMessage += ' - 무인도에 갇혔습니다! (3턴)';
          } else if (targetTileId === 30) {
            newIsSpace = true;
            extraMessage += ' - 다음 턴에 우주여행을 떠납니다!';
          } else if (targetTileId === 38) {
            if (updatedCash < 150000) {
              newTurnPhase = 'insolvent';
              newPendingPayment = { amount: 150000, to: 'bank', reason: '사회복지기금' };
              extraMessage += ' - [자금 부족! 매각/대출 필요]';
            } else {
              updatedCash -= 150000;
              newFundBalance += 150000;
              extraMessage += ' - 사회복지기금 15만원 납부';
            }
          } else if (targetTileId === 20) {
            if (newFundBalance > 0) {
              updatedCash += newFundBalance;
              extraMessage += ` - 사회복지기금 ${newFundBalance.toLocaleString()}원 수령!`;
              newFundBalance = 0;
            }
          }

          return { 
            ...p, 
            position: targetTileId,
            isSpaceTravel: newIsSpace,
            islandTurnsLeft: newIslandTurns,
            cash: updatedCash,
            hasPassedStart: newPassedStartFlag
          };
        }
        return p;
      });

      if (state.board[targetTileId].type === 'chance' && newTurnPhase !== 'insolvent') {
        newTurnPhase = 'chance_card';
      }

      return {
        ...state,
        players: updatedPlayers,
        fundBalance: newFundBalance,
        turnPhase: newTurnPhase,
        pendingPayment: newPendingPayment,
        lastMovementType: 'teleport',
        messageLog: [...state.messageLog, `${currentPlayer.name}님이 우주여행으로 ${state.board[targetTileId].name}(으)로 이동했습니다.${extraMessage}`]
      };
    }

    case 'BUY_PROPERTY': {
      const { tileId, buyVilla, buyBuilding, buyHotel, cost } = action.payload;
      const currentPlayer = state.players[state.currentPlayerIndex];
      
      if (currentPlayer.cash < cost) {
        return { ...state, messageLog: [...state.messageLog, `자금이 부족하여 구매할 수 없습니다.`] };
      }

      const updatedPlayers = state.players.map(p => 
        p.id === currentPlayer.id ? { ...p, cash: p.cash - cost } : p
      );

      const updatedBoard = state.board.map(t => {
        if (t.id === tileId) {
          return {
            ...t,
            ownerId: currentPlayer.id,
            villas: (t.villas || 0) + (buyVilla ? 1 : 0),
            buildings: (t.buildings || 0) + (buyBuilding ? 1 : 0),
            hotels: (t.hotels || 0) + (buyHotel ? 1 : 0),
          };
        }
        return t;
      });

      return {
        ...state,
        players: updatedPlayers,
        board: updatedBoard,
        messageLog: [...state.messageLog, `${currentPlayer.name}님이 ${state.board[tileId].name}의 건물을 구매했습니다. (-${cost}원)`]
      };
    }

    case 'PAY_TOLL': {
      const { amount, ownerId } = action.payload;
      const currentPlayer = state.players[state.currentPlayerIndex];
      
      if (currentPlayer.cash < amount) {
        return {
          ...state,
          turnPhase: 'insolvent',
          pendingPayment: { amount, to: ownerId, reason: '통행료' },
          messageLog: [...state.messageLog, `${currentPlayer.name}님의 자금이 부족합니다! 자산을 매각하거나 대출을 받아 통행료 ${amount}원을 지불해야 합니다.`]
        };
      }

      const updatedPlayers = state.players.map(p => {
        if (p.id === currentPlayer.id) {
          return { ...p, cash: p.cash - amount };
        }
        if (p.id === ownerId) {
          return { ...p, cash: p.cash + amount };
        }
        return p;
      });

      return {
        ...state,
        players: updatedPlayers,
        messageLog: [...state.messageLog, `${currentPlayer.name}님이 통행료 ${amount}원을 지불했습니다.`]
      };
    }

    case 'FUND_DONATE': {
      // It's handled in MOVE_PLAYER directly
      return state;
    }
    
    case 'FUND_RECEIVE': {
      // Handled in MOVE_PLAYER directly
      return state;
    }

    case 'DRAW_CHANCE_CARD': {
      if (state.chanceDeck.length === 0) {
        // Reshuffle if deck is empty
        return {
          ...state,
          chanceDeck: shuffle(CHANCE_CARDS),
          messageLog: [...state.messageLog, '황금열쇠 카드를 섞습니다.']
        }; // Let the user click draw again
      }
      
      const newDeck = [...state.chanceDeck];
      const drawnCard = newDeck.pop();
      
      if (!drawnCard) return state;

      return {
        ...state,
        chanceDeck: newDeck,
        activeChanceCard: drawnCard,
        messageLog: [...state.messageLog, `황금열쇠: [${drawnCard.title}]`]
      };
    }

    case 'APPLY_CHANCE_CARD': {
      const card = state.activeChanceCard;
      if (!card) return state;
      
      const currentPlayer = state.players[state.currentPlayerIndex];
      const updatedPlayers = [...state.players];
      const me = { ...currentPlayer };
      let updatedFundBalance = state.fundBalance;
      const msgs = [...state.messageLog];

      let newMovementType: 'forward' | 'backward' | 'teleport' | undefined = undefined;

      switch (card.action.type) {
        case 'GIVE_EXEMPTION':
          me.hasExemptionCard = true;
          msgs.push('우대권을 획득했습니다.');
          break;
        case 'GIVE_ESCAPE':
          me.hasEscapeCard = true;
          msgs.push('무인도 탈출권을 획득했습니다.');
          break;
        case 'FORCE_SELL_HALF':
          const myProps = state.board.filter(t => t.ownerId === me.id);
          if (myProps.length > 0) {
            const targetProp = myProps.sort((a,b) => (b.price||0) - (a.price||0))[0];
            const sellPrice = (targetProp.price || 0) / 2;
            me.cash += sellPrice;
          } else {
            msgs.push(`매각할 자산이 없습니다.`);
          }
          break;
        case 'PAY_WELFARE':
          if (me.cash < 150000) {
            return {
              ...state,
              activeChanceCard: null,
              turnPhase: 'insolvent',
              pendingPayment: { amount: 150000, to: 'bank', reason: '사회복지기금 (카드)' },
              messageLog: [...msgs, `자금이 부족하여 지불 대기 상태가 됩니다.`]
            };
          }
          me.cash -= 150000;
          updatedFundBalance += 150000;
          break;
        case 'MOVE_TO_TILE':
          newMovementType = 'teleport';
          const originalPos = me.position;
          me.position = card.action.target;
          if (card.action.target === 30) {
            me.isSpaceTravel = true;
          } else if (card.action.target === 10) {
            me.islandTurnsLeft = 3;
          } else if (card.action.target === 20) {
            if (updatedFundBalance > 0) {
              me.cash += updatedFundBalance;
              msgs.push(`사회복지기금 ${updatedFundBalance.toLocaleString()}원을 수령했습니다!`);
              updatedFundBalance = 0;
            }
          }
          
          if (card.action.target === 0 || (originalPos > card.action.target && card.action.target !== 30)) {
            me.cash += 200000;
            me.hasPassedStart = true;
            msgs.push('(월급 20만원 획득)');
          }
          break;
        case 'WORLD_TOUR':
          newMovementType = 'teleport';
          me.position = 0;
          me.hasPassedStart = true;
          me.cash += 200000 + updatedFundBalance;
          msgs.push(`(월급 및 사회복지기금 총합 ${200000 + updatedFundBalance}원 획득)`);
          updatedFundBalance = 0;
          break;
        case 'MOVE_RELATIVE':
          newMovementType = card.action.amount > 0 ? 'forward' : 'backward';
          let newPos = me.position + card.action.amount;
          if (newPos < 0) newPos += 40;
          me.position = newPos;
          break;
        case 'GET_CASH':
          me.cash += card.action.amount;
          msgs.push(`${card.action.amount.toLocaleString()}원을 획득했습니다.`);
          break;
        case 'PAY_CASH':
          if (me.cash < card.action.amount) {
            return {
              ...state,
              activeChanceCard: null,
              turnPhase: 'insolvent',
              pendingPayment: { amount: card.action.amount, to: 'bank', reason: card.title },
              messageLog: [...msgs, `자금이 부족하여 지불 대기 상태가 됩니다.`]
            };
          }
          me.cash -= card.action.amount;
          break;
        case 'PAY_PROPERTY_TAX':
          let totalTax = 0;
          state.board.filter(t => t.ownerId === me.id).forEach(t => {
            if (t.villas) totalTax += card.action.villa * t.villas;
            if (t.buildings) totalTax += card.action.building * t.buildings;
            if (t.hotels) totalTax += card.action.hotel * t.hotels;
          });
          if (totalTax === 0) {
            msgs.push('소유한 건물이 없어 세금이 면제되었습니다.');
          } else {
            if (me.cash < totalTax) {
              return {
                ...state,
                activeChanceCard: null,
                turnPhase: 'insolvent',
                pendingPayment: { amount: totalTax, to: 'bank', reason: card.title },
                messageLog: [...msgs, `건물 세금 ${totalTax.toLocaleString()}원이 부과되었으나 자금이 부족하여 지불 대기 상태가 됩니다.`]
              };
            }
            me.cash -= totalTax;
            msgs.push(`건물 세금 ${totalTax.toLocaleString()}원을 지불했습니다.`);
          }
          break;
      }
      
      updatedPlayers[state.currentPlayerIndex] = me;
      
      let newBoard = state.board;
      if (card.action.type === 'FORCE_SELL_HALF') {
        const myProps = state.board.filter(t => t.ownerId === me.id);
        if (myProps.length > 0) {
          const targetProp = myProps.sort((a,b) => (b.price||0) - (a.price||0))[0];
          newBoard = state.board.map(t => t.id === targetProp.id ? { ...t, ownerId: null, villas: 0, buildings: 0, hotels: 0 } : t);
          msgs.push(`${targetProp.name}을(를) 반값에 매각했습니다.`);
        }
      }

      return {
        ...state,
        players: updatedPlayers,
        board: newBoard,
        fundBalance: updatedFundBalance,
        activeChanceCard: null,
        messageLog: msgs,
        turnPhase: 'action',
        lastMovementType: newMovementType !== undefined ? newMovementType : state.lastMovementType
      };
    }

    case 'TAKE_LOAN': {
      const currentPlayer = state.players[state.currentPlayerIndex];
      if (currentPlayer.loanAmount > 0) {
        return { ...state, messageLog: [...state.messageLog, `이미 대출이 있습니다.`] };
      }
      
      const updatedPlayers = state.players.map(p => 
        p.id === currentPlayer.id 
          ? { ...p, cash: p.cash + 1000000, loanAmount: 1000000, loanTurnsLeft: 3 } 
          : p
      );

      return {
        ...state,
        players: updatedPlayers,
        messageLog: [...state.messageLog, `${currentPlayer.name}님이 100만원을 대출받았습니다. 3턴 내에 상환해야 합니다.`]
      };
    }

    case 'REPAY_LOAN': {
      const currentPlayer = state.players[state.currentPlayerIndex];
      if (currentPlayer.loanAmount === 0) {
        return state;
      }
      
      // Let's add 10% interest as penalty? Or just repay principal. Let's do principal.
      const repayAmount = currentPlayer.loanAmount;
      if (currentPlayer.cash < repayAmount) {
        return { ...state, messageLog: [...state.messageLog, `현금이 부족하여 대출을 상환할 수 없습니다. (필요: ${repayAmount.toLocaleString()}원)`] };
      }

      const updatedPlayers = state.players.map(p => 
        p.id === currentPlayer.id 
          ? { ...p, cash: p.cash - repayAmount, loanAmount: 0, loanTurnsLeft: 0 } 
          : p
      );

      return {
        ...state,
        players: updatedPlayers,
        messageLog: [...state.messageLog, `${currentPlayer.name}님이 대출금 ${repayAmount.toLocaleString()}원을 상환했습니다!`]
      };
    }

    case 'END_TURN': {
      const isDouble = state.diceResult && state.diceResult[0] === state.diceResult[1];
      const hasAnotherTurn = isDouble && state.doubleCount > 0 && state.doubleCount < 3;
      
      let nextPlayerIndex = state.currentPlayerIndex;
      let message = `${state.players[state.currentPlayerIndex].name}님의 턴 종료.`;
      
      const playersUpdate = [...state.players];
      const me = { ...playersUpdate[state.currentPlayerIndex] };

      // Handle loan turns only if it's not a double (or if it's the real end of the player's turn)
      // Actually, if they roll a double, it's still their turn, so we don't count down loan turns until they actually end their turn and nextPlayerIndex advances.
      let newBoard = state.board;
      let msgs = [message];

      if (!hasAnotherTurn) {
        nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
        message = `다음 차례: ${state.players[nextPlayerIndex].name}님`;
        msgs = [message];

        // Process loan turn count down
        if (me.loanAmount > 0) {
          me.loanTurnsLeft -= 1;
          if (me.loanTurnsLeft === 0) {
            msgs.push(`${me.name}님의 대출 상환 기한이 만료되었습니다! 전 자산이 압류됩니다.`);
            // Foreclose all properties
            newBoard = newBoard.map(t => t.ownerId === me.id ? { ...t, ownerId: null, villas: 0, buildings: 0, hotels: 0 } : t);
            // Default on loan
            me.loanAmount = 0;
            // Optionally, should we bankrupt them? The rule says "담보로 잡힌 땅을 몰수한다".
            // Since we didn't specify collateral, we just seize ALL their lands.
          } else {
            msgs.push(`대출 상환 기한이 ${me.loanTurnsLeft}턴 남았습니다.`);
          }
        }
        playersUpdate[state.currentPlayerIndex] = me;
      } else {
        message = `더블! ${state.players[state.currentPlayerIndex].name}님이 한 번 더 굴립니다.`;
        msgs = [message];
      }
      
      return {
        ...state,
        players: playersUpdate,
        board: newBoard,
        currentPlayerIndex: nextPlayerIndex,
        diceResult: null,
        doubleCount: hasAnotherTurn ? state.doubleCount : 0,
        turnPhase: 'pre_roll',
        messageLog: [...state.messageLog, ...msgs]
      };
    }

    case 'PAY_PENDING': {
      if (!state.pendingPayment) return state;
      const { amount, to, reason } = state.pendingPayment;
      const currentPlayer = state.players[state.currentPlayerIndex];
      
      if (currentPlayer.cash < amount) {
        return { ...state, messageLog: [...state.messageLog, `아직 자금이 부족합니다.`] };
      }

      let updatedFundBalance = state.fundBalance;
      const updatedPlayers = state.players.map(p => {
        if (p.id === currentPlayer.id) return { ...p, cash: p.cash - amount };
        if (to !== 'bank' && p.id === to) return { ...p, cash: p.cash + amount };
        return p;
      });

      if (to === 'bank' && reason.includes('사회복지기금')) {
        updatedFundBalance += amount;
      }

      return {
        ...state,
        players: updatedPlayers,
        fundBalance: updatedFundBalance,
        turnPhase: 'action',
        pendingPayment: null,
        messageLog: [...state.messageLog, `${currentPlayer.name}님이 ${reason} ${amount}원을 지불했습니다.`]
      };
    }

    case 'DECLARE_BANKRUPTCY': {
      const currentPlayer = state.players[state.currentPlayerIndex];
      const updatedPlayers = state.players.map(p => 
        p.id === currentPlayer.id ? { ...p, isActive: false, cash: 0, loanAmount: 0 } : p
      );
      
      // All properties belong to bank now (or transferred if we implement it, but rule says 파산)
      const newBoard = state.board.map(t => 
        t.ownerId === currentPlayer.id ? { ...t, ownerId: null, villas: 0, buildings: 0, hotels: 0 } : t
      );

      return {
        ...state,
        players: updatedPlayers,
        board: newBoard,
        turnPhase: 'action',
        pendingPayment: null,
        messageLog: [...state.messageLog, `🚨 ${currentPlayer.name}님이 파산했습니다! 모든 자산이 초기화됩니다.`]
      };
    }

    case 'SELL_PROPERTY': {
      const { tileId } = action.payload;
      const currentPlayer = state.players[state.currentPlayerIndex];
      const tile = state.board[tileId];

      if (tile.ownerId !== currentPlayer.id) return state;

      const sellValue = (tile.price || 0) / 2 + 
                        (tile.villas || 0) * (tile.villaPrice || 0) / 2 + 
                        (tile.buildings || 0) * (tile.buildingPrice || 0) / 2 + 
                        (tile.hotels || 0) * (tile.hotelPrice || 0) / 2;

      const updatedPlayers = state.players.map(p => 
        p.id === currentPlayer.id ? { ...p, cash: p.cash + sellValue } : p
      );

      const updatedBoard = state.board.map(t => 
        t.id === tileId ? { ...t, ownerId: null, villas: 0, buildings: 0, hotels: 0 } : t
      );

      return {
        ...state,
        players: updatedPlayers,
        board: updatedBoard,
        messageLog: [...state.messageLog, `${currentPlayer.name}님이 ${tile.name}을(를) 반값(${sellValue}원)에 매각했습니다.`]
      };
    }

    case 'SET_PLAYER_TOKEN': {
      const updatedPlayers = state.players.map(p => 
        p.id === action.payload.playerId ? { ...p, tokenId: action.payload.tokenId } : p
      );
      return {
        ...state,
        players: updatedPlayers
      };
    }
    
    case 'ADD_PLAYER': {
      if (state.players.length >= 4) return state;
      return {
        ...state,
        players: [
          ...state.players,
          {
            id: state.players.length + 1,
            name: action.payload.name,
            color: action.payload.color,
            cash: 3000000,
            position: 0,
            isActive: true,
            isInIsland: false,
            islandTurnsLeft: 0,
            hasEscapeCard: false,
            isSpaceTravel: false,
            loanAmount: 0,
            loanTurnsLeft: 0
          }
        ]
      };
    }

    default:
      return state;
  }
}
