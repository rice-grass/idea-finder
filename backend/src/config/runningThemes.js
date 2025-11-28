/**
 * RunWave 러닝 테마, 지역, 난이도, 거리 설정
 */

export const runningThemes = [
  {
    id: 'view-food',
    label: '뷰 맛집',
    icon: '🍽️🌆',
    description: '맛집과 경치를 함께 즐기는 코스',
    keywords: ['맛집', '카페', '뷰포인트', '포토스팟', '레스토랑'],
    color: '#FF6B6B'
  },
  {
    id: 'night-view',
    label: '야경',
    icon: '🌃',
    description: '밤 러닝에 최적화된 야경 코스',
    keywords: ['야경', '조명', '다리', '광장', '야간'],
    color: '#4ECDC4'
  },
  {
    id: 'beach',
    label: '해변',
    icon: '🏖️',
    description: '바다를 따라 달리는 시원한 코스',
    keywords: ['해변', '해수욕장', '바다', '갈맷길', '해안'],
    color: '#45B7D1'
  },
  {
    id: 'urban-healing',
    label: '도심 힐링',
    icon: '🏙️🌿',
    description: '도심 속 공원과 산책로 코스',
    keywords: ['공원', '산책로', '녹지', '힐링', '도시'],
    color: '#96CEB4'
  }
];

export const busanDistricts = [
  {
    id: 'haeundae',
    label: '해운대구',
    icon: '🏖️',
    description: '부산의 대표 해변 관광지',
    coordinates: { lat: 35.1631, lng: 129.1635 },
    features: ['해수욕장', '마린시티', '동백섬', '달맞이길'],
    popularThemes: ['beach', 'night-view', 'view-food']
  },
  {
    id: 'gwangalli',
    label: '수영구 (광안리)',
    icon: '🌉',
    description: '광안대교가 보이는 해변 코스',
    coordinates: { lat: 35.1532, lng: 129.1189 },
    features: ['광안리해수욕장', '광안대교', '민락수변공원'],
    popularThemes: ['beach', 'night-view']
  },
  {
    id: 'songjeong',
    label: '해운대구 (송정)',
    icon: '🏄',
    description: '서퍼들의 성지, 한적한 해변',
    coordinates: { lat: 35.1785, lng: 129.2005 },
    features: ['송정해수욕장', '죽도공원', '서핑'],
    popularThemes: ['beach', 'urban-healing']
  },
  {
    id: 'nampo',
    label: '중구 (남포동)',
    icon: '🏙️',
    description: '부산의 중심 상권',
    coordinates: { lat: 35.0966, lng: 129.0279 },
    features: ['용두산공원', '자갈치시장', '국제시장'],
    popularThemes: ['urban-healing', 'view-food']
  },
  {
    id: 'seomyeon',
    label: '부산진구 (서면)',
    icon: '🏬',
    description: '부산의 도심 중심',
    coordinates: { lat: 35.1579, lng: 129.0595 },
    features: ['전포카페거리', '시민공원', '서면로데오거리'],
    popularThemes: ['urban-healing', 'view-food']
  },
  {
    id: 'bukhang',
    label: '중구 (북항)',
    icon: '⚓',
    description: '재개발 중인 항구 지역',
    coordinates: { lat: 35.1165, lng: 129.0408 },
    features: ['북항재개발지구', '워터프론트', '야경'],
    popularThemes: ['night-view', 'urban-healing']
  }
];

export const difficulties = [
  {
    id: 'beginner',
    label: '초급',
    icon: '🟢',
    description: '평탄한 길, 초보자 적합',
    elevation: '< 50m',
    slopePercent: '< 3%',
    targetPace: '6-7분/km',
    characteristics: ['평탄한 도로', '보행로 포함', '경사 거의 없음']
  },
  {
    id: 'intermediate',
    label: '중급',
    icon: '🟡',
    description: '약간의 오르막, 일반 러너',
    elevation: '50-100m',
    slopePercent: '3-6%',
    targetPace: '5-6분/km',
    characteristics: ['완만한 경사', '일부 계단', '체력 필요']
  },
  {
    id: 'advanced',
    label: '고급',
    icon: '🔴',
    description: '고도 변화 큼, 숙련 러너',
    elevation: '> 100m',
    slopePercent: '> 6%',
    targetPace: '< 5분/km',
    characteristics: ['가파른 언덕', '고도 변화 큼', '숙련자 전용']
  }
];

export const distances = [
  {
    id: '3km',
    label: '3km',
    value: 3,
    duration: '15-20분',
    calories: '~150kcal',
    description: '가볍게 달리기 좋은 거리',
    recommendedFor: ['초보자', '워밍업', '출근 전 러닝'],
    icon: '🏃'
  },
  {
    id: '5km',
    label: '5km',
    value: 5,
    duration: '25-35분',
    calories: '~250kcal',
    description: '가장 인기있는 러닝 거리',
    recommendedFor: ['일반 러너', '점심시간 러닝', '일상 러닝'],
    icon: '🏃‍♂️'
  },
  {
    id: '10km',
    label: '10km',
    value: 10,
    duration: '50-70분',
    calories: '~500kcal',
    description: '본격적인 러닝 코스',
    recommendedFor: ['중급자', '주말 러닝', '대회 준비'],
    icon: '🏃‍♀️💪'
  },
  {
    id: '15km',
    label: '15km',
    value: 15,
    duration: '75-105분',
    calories: '~750kcal',
    description: '장거리 러닝 코스',
    recommendedFor: ['고급자', '마라톤 훈련', '체력 향상'],
    icon: '🏃‍♂️🔥'
  }
];

/**
 * 오아시스 타입 정의
 */
export const oasisTypes = [
  {
    id: 'cafe',
    label: '카페',
    icon: '☕',
    benefits: ['음료 할인', '물병 리필', 'WiFi', '화장실']
  },
  {
    id: 'convenience',
    label: '편의점',
    icon: '🏪',
    benefits: ['이온음료 할인', '간식', '화장실', '물품 보관']
  },
  {
    id: 'restaurant',
    label: '식당',
    icon: '🍽️',
    benefits: ['식사 할인', '영양 보충', '휴식 공간']
  },
  {
    id: 'water_station',
    label: '급수대',
    icon: '💧',
    benefits: ['무료 물 제공', '휴식 공간', '스트레칭 공간']
  },
  {
    id: 'locker',
    label: '짐보관소',
    icon: '🔒',
    benefits: ['짐 보관', '샤워 시설', '락커룸']
  }
];

/**
 * 추천 시간대
 */
export const recommendedTimes = {
  sunrise: {
    label: '일출 러닝',
    icon: '🌅',
    timeRange: '05:30-07:00',
    benefits: ['맑은 공기', '한적함', '일출 감상'],
    bestThemes: ['beach', 'view-food']
  },
  morning: {
    label: '아침 러닝',
    icon: '🌤️',
    timeRange: '07:00-09:00',
    benefits: ['상쾌한 시작', '교통 한산', '기분 전환'],
    bestThemes: ['beach', 'urban-healing']
  },
  lunch: {
    label: '점심 러닝',
    icon: '☀️',
    timeRange: '12:00-13:00',
    benefits: ['점심시간 활용', '비타민D', '식후 운동'],
    bestThemes: ['urban-healing']
  },
  sunset: {
    label: '일몰 러닝',
    icon: '🌇',
    timeRange: '17:30-19:00',
    benefits: ['일몰 감상', '퇴근 운동', '스트레스 해소'],
    bestThemes: ['beach', 'view-food']
  },
  night: {
    label: '야간 러닝',
    icon: '🌃',
    timeRange: '19:00-21:00',
    benefits: ['야경 감상', '시원한 날씨', '로맨틱'],
    bestThemes: ['night-view']
  }
};

/**
 * 계절별 추천 코스
 */
export const seasonalRecommendations = {
  spring: {
    label: '봄',
    icon: '🌸',
    recommendedThemes: ['urban-healing', 'beach'],
    tips: ['벚꽃 명소', '온화한 날씨', '신록']
  },
  summer: {
    label: '여름',
    icon: '☀️',
    recommendedThemes: ['beach'],
    tips: ['새벽/저녁 추천', '수분 보충', '해변 코스']
  },
  autumn: {
    label: '가을',
    icon: '🍂',
    recommendedThemes: ['view-food', 'urban-healing'],
    tips: ['단풍 명소', '선선한 날씨', '러닝 최적기']
  },
  winter: {
    label: '겨울',
    icon: '❄️',
    recommendedThemes: ['night-view', 'urban-healing'],
    tips: ['따뜻한 복장', '미세먼지 확인', '야경 추천']
  }
};

// 기본 export
export default {
  runningThemes,
  busanDistricts,
  difficulties,
  distances,
  oasisTypes,
  recommendedTimes,
  seasonalRecommendations
};
