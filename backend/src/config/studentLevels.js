/**
 * 학생 레벨 정의 및 설정
 * 각 학년 수준에 맞는 프로젝트 복잡도와 기준 정의
 */

export const STUDENT_LEVELS = {
  elementary: {
    id: 'elementary',
    label: '초등학생',
    description: '블록 코딩과 기초 프로그래밍',
    complexity: 'beginner',
    maxFeatures: 3,
    recommendedTime: '1-2주',
    difficultyLevel: 'Beginner',
    techFocus: 'Scratch, 블록 코딩, 간단한 게임 개발',
    guidelines: '비주얼 프로그래밍 도구 활용, 복잡한 알고리즘이나 데이터베이스 피하기, 재미있고 직관적인 프로젝트'
  },
  middle: {
    id: 'middle',
    label: '중학생',
    description: '기본 웹/앱 개발',
    complexity: 'beginner-intermediate',
    maxFeatures: 5,
    recommendedTime: '2-4주',
    difficultyLevel: 'Beginner-Intermediate',
    techFocus: 'HTML/CSS/JavaScript, Python 기초',
    guidelines: '간단한 웹 페이지나 앱 개발, 기본 변수/조건문/반복문 활용, 시각적으로 흥미로운 결과물'
  },
  high: {
    id: 'high',
    label: '고등학생',
    description: '포트폴리오용 풀스택 프로젝트',
    complexity: 'intermediate',
    maxFeatures: 7,
    recommendedTime: '4-8주',
    difficultyLevel: 'Intermediate',
    techFocus: 'React, Node.js, Python/Flask, 데이터베이스',
    guidelines: '풀스택 프로젝트, API 연동, 데이터베이스 사용, 배포 가능, 대학 입시 포트폴리오로 활용'
  },
  university: {
    id: 'university',
    label: '대학생',
    description: '고급 프로젝트 및 취업용 포트폴리오',
    complexity: 'intermediate-advanced',
    maxFeatures: 10,
    recommendedTime: '8-12주',
    difficultyLevel: 'Intermediate-Advanced',
    techFocus: '고급 프레임워크, 마이크로서비스, CI/CD, 테스팅, 보안',
    guidelines: '산업 수준의 프로젝트, 실무 경험 강조, 확장 가능한 아키텍처, 테스트 코드 포함, 취업 포트폴리오'
  }
};

/**
 * 모든 학생 레벨 반환
 * @returns {Array} 학생 레벨 배열
 */
export function getStudentLevels() {
  return Object.values(STUDENT_LEVELS);
}

/**
 * 특정 학생 레벨 정보 가져오기
 * @param {string} levelId - 학생 레벨 ID
 * @returns {Object|null} 학생 레벨 객체
 */
export function getStudentLevel(levelId) {
  return STUDENT_LEVELS[levelId] || null;
}

/**
 * 학생 레벨에 맞는 난이도 매핑
 * @param {string} levelId - 학생 레벨 ID
 * @returns {string} 난이도 문자열
 */
export function getDifficultyForLevel(levelId) {
  const level = getStudentLevel(levelId);
  return level ? level.difficultyLevel : 'Intermediate';
}

/**
 * 학생 레벨 유효성 검사
 * @param {string} levelId - 학생 레벨 ID
 * @returns {boolean} 유효 여부
 */
export function isValidStudentLevel(levelId) {
  return !!STUDENT_LEVELS[levelId];
}
