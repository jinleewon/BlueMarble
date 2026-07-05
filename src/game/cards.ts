import type { ChanceCard } from './types';

export const CHANCE_CARDS: ChanceCard[] = [
  // --- Movement Cards (13) ---
  { id: 'm1', title: '고속도로', description: '출발지로 바로 이동 (월급 수령)', type: 'movement', action: { type: 'MOVE_TO_TILE', target: 0 } },
  { id: 'm2', title: '관광여행 - 서울', description: '서울로 이동', type: 'movement', action: { type: 'MOVE_TO_TILE', target: 39 } },
  { id: 'm3', title: '관광여행 - 부산', description: '부산으로 이동', type: 'movement', action: { type: 'MOVE_TO_TILE', target: 25 } },
  { id: 'm4', title: '관광여행 - 제주도', description: '제주도로 이동', type: 'movement', action: { type: 'MOVE_TO_TILE', target: 5 } },
  { id: 'm5', title: '항공여행 - 콩코드', description: '콩코드 여객기로 이동 (탑승료 지불)', type: 'movement', action: { type: 'MOVE_TO_TILE', target: 15 } },
  { id: 'm6', title: '항공여행 - 퀸엘리자베스', description: '퀸엘리자베스호로 이동 (탑승료 지불)', type: 'movement', action: { type: 'MOVE_TO_TILE', target: 28 } },
  { id: 'm7', title: '우주여행 ①', description: '우주여행 승강장으로 이동 (탑승료 면제)', type: 'movement', action: { type: 'MOVE_TO_TILE', target: 30 } },
  { id: 'm8', title: '우주여행 ②', description: '우주여행 승강장으로 이동 (탑승료 면제)', type: 'movement', action: { type: 'MOVE_TO_TILE', target: 30 } },
  { id: 'm9', title: '세계일주', description: '한 바퀴 돌아 제자리로 (월급 + 사회복지기금 수령)', type: 'movement', action: { type: 'WORLD_TOUR' } },
  { id: 'm10', title: '사회복지기금 배당', description: '사회복지기금 수령처로 이동', type: 'movement', action: { type: 'MOVE_TO_TILE', target: 20 } },
  { id: 'm11', title: '무인도 이동', description: '무인도로 즉시 이동 (월급 없음)', type: 'movement', action: { type: 'MOVE_TO_TILE', target: 10 } },
  { id: 'm12', title: '뒤로 가시오 (2칸)', description: '2칸 뒤로 이동', type: 'movement', action: { type: 'MOVE_RELATIVE', amount: -2 } },
  { id: 'm13', title: '뒤로 가시오 (3칸)', description: '3칸 뒤로 이동', type: 'movement', action: { type: 'MOVE_RELATIVE', amount: -3 } },

  // --- Income Cards (7) ---
  { id: 'i1', title: '노벨 평화상', description: '세계 평화에 기여한 공로로\n은행에서 +30만 원 수령', type: 'income', action: { type: 'GET_CASH', amount: 300000 } },
  { id: 'i2', title: '복권 당첨', description: '운수 대통! 축하합니다\n은행에서 +20만 원 수령', type: 'income', action: { type: 'GET_CASH', amount: 200000 } },
  { id: 'i3', title: '장학금', description: '우수한 성적으로 입학하여\n은행에서 +10만 원 수령', type: 'income', action: { type: 'GET_CASH', amount: 100000 } },
  { id: 'i4', title: '자동차 경주 우승', description: '서킷 위의 지배자!\n은행에서 +10만 원 수령', type: 'income', action: { type: 'GET_CASH', amount: 100000 } },
  { id: 'i5', title: '노후 연금', description: '안정적인 미래를 위해\n은행에서 +5만 원 수령', type: 'income', action: { type: 'GET_CASH', amount: 50000 } },
  { id: 'i6', title: '생일 축하', description: '모두에게 축하를 받으세요\n은행에서 축하금 +10만 원 수령', type: 'income', action: { type: 'GET_CASH', amount: 100000 } },
  { id: 'i7', title: '장기자랑', description: '화려한 무대 매너를 뽐내고\n은행에서 상금 +10만 원 수령', type: 'income', action: { type: 'GET_CASH', amount: 100000 } },

  // --- Expense Cards (8) ---
  { id: 'e1', title: '건물 정기종합소득세', description: '소유한 모든 건물의 세금을\n은행에 지불하세요.\n• 호텔: 15만\n• 빌딩: 10만\n• 별장: 5만', type: 'expense', action: { type: 'PAY_PROPERTY_TAX', hotel: 150000, building: 100000, villa: 50000 } },
  { id: 'e2', title: '건물 수리비 지불', description: '노후된 건물의 대대적인 수리를 위해 비용을 지불하세요.\n• 호텔: 10만\n• 빌딩: 6만\n• 별장: 3만', type: 'expense', action: { type: 'PAY_PROPERTY_TAX', hotel: 100000, building: 60000, villa: 30000 } },
  { id: 'e3', title: '건물 방범비', description: '도시 안전을 위한 방범 시스템 설치 비용을 지불하세요.\n• 호텔: 5만\n• 빌딩: 3만\n• 별장: 1만', type: 'expense', action: { type: 'PAY_PROPERTY_TAX', hotel: 50000, building: 30000, villa: 10000 } },
  { id: 'e4', title: '해외유학', description: '미래를 위한 투자! 해외 명문대 유학 자금을 지불하세요.\n• 은행에 10만 원 지불', type: 'expense', action: { type: 'PAY_CASH', amount: 100000 } },
  { id: 'e5', title: '과속운전', description: '제한 속도 위반 적발! 교통 위반 벌금을 지불하세요.\n• 은행에 5만 원 지불', type: 'expense', action: { type: 'PAY_CASH', amount: 50000 } },
  { id: 'e6', title: '병원비', description: '건강이 최고! 병원 진료비를 지불하세요.\n• 은행에 5만 원 지불', type: 'expense', action: { type: 'PAY_CASH', amount: 50000 } },
  { id: 'e7', title: '사회복지', description: '사회복지기금 접수처에 15만 원을 기부(적립)하십시오. 어려운 이웃을 돕는 따뜻한 마음!', type: 'expense', action: { type: 'PAY_WELFARE' } },
  { id: 'e8', title: '반액대매출', description: '불황으로 인해 당신의 자산 중 가장 비싼 땅과 건물을 은행에 반값으로 강제 매각합니다.', type: 'expense', action: { type: 'FORCE_SELL_HALF' } },

  // --- Special/Keep Cards (2) ---
  { id: 's1', title: '우대권', description: '다른 플레이어의 땅에 도착했을 때 통행료를 내지 않아도 됩니다. (보관 가능)', type: 'special', action: { type: 'GIVE_EXEMPTION' } },
  { id: 's2', title: '무인도 탈출', description: '무인도에 갇혔을 때 즉시 탈출할 수 있습니다. (보관 가능)', type: 'special', action: { type: 'GIVE_ESCAPE' } }
];
