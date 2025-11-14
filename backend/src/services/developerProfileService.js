/**
 * 개발자 프로필 서비스
 * 개발자 유형 및 기술 스택 기반 필터링 및 추천 로직
 */

import {
  getTechStacksByType,
  getStackMetadata,
  getAllDeveloperTypes,
  buildGitHubQuery
} from '../config/techStacks.js';

/**
 * 개발자 유형 및 학생 레벨별 기술 스택 목록 반환
 * @param {string} devType - 'frontend', 'backend', 'fullstack'
 * @param {string} studentLevel - 'elementary', 'middle', 'high', 'university'
 * @returns {Array} 기술 스택 배열
 */
function getAvailableStacks(devType, studentLevel = 'university') {
  try {
    const stacks = getTechStacksByType(devType, studentLevel);
    return stacks.map(stack => ({
      id: stack.id,
      name: stack.name,
      description: `${stack.name} 기반 프로젝트`
    }));
  } catch (error) {
    throw new Error(`Failed to get stacks for ${devType} (${studentLevel}): ${error.message}`);
  }
}

/**
 * 모든 개발자 유형 반환
 * @returns {Array} 개발자 유형 배열
 */
function getDeveloperTypes() {
  return getAllDeveloperTypes();
}

/**
 * GitHub 검색 쿼리 생성
 * @param {string} devType - 개발자 유형
 * @param {Array<string>} techStacks - 선택된 기술 스택 ID 배열
 * @param {number} days - 최근 며칠
 * @param {string} studentLevel - 학생 레벨
 * @returns {Object} { query, metadata }
 */
function createSearchQuery(devType, techStacks, days = 7, studentLevel = 'university') {
  if (!devType) {
    throw new Error('Developer type is required');
  }

  if (!techStacks || techStacks.length === 0) {
    throw new Error('At least one tech stack must be selected');
  }

  const query = buildGitHubQuery(devType, studentLevel, techStacks, days);
  const metadata = getStackMetadata(devType, studentLevel, techStacks);

  return {
    query,
    metadata,
    devType,
    studentLevel,
    selectedStacks: techStacks
  };
}

/**
 * 저장소가 선택된 기술 스택과 관련있는지 확인
 * @param {Object} repo - GitHub 저장소 객체
 * @param {Object} metadata - 기술 스택 메타데이터
 * @returns {boolean} 관련 여부
 */
function isRelevantToStacks(repo, metadata) {
  // 언어 확인
  const repoLanguage = repo.language?.toLowerCase();
  if (repoLanguage && metadata.languages.includes(repoLanguage)) {
    return true;
  }

  // 토픽 확인
  const repoTopics = repo.topics || [];
  const hasMatchingTopic = repoTopics.some(topic =>
    metadata.topics.includes(topic.toLowerCase())
  );
  if (hasMatchingTopic) {
    return true;
  }

  // 키워드 확인 (설명 및 이름)
  const searchText = `${repo.name} ${repo.description || ''}`.toLowerCase();
  const hasMatchingKeyword = metadata.keywords.some(keyword =>
    searchText.includes(keyword.toLowerCase())
  );

  return hasMatchingKeyword;
}

/**
 * 저장소 필터링 및 관련도 점수 계산
 * @param {Array} repos - GitHub 저장소 배열
 * @param {Object} metadata - 기술 스택 메타데이터
 * @returns {Array} 필터링되고 점수가 매겨진 저장소 배열
 */
function filterAndScoreRepos(repos, metadata) {
  return repos
    .map(repo => {
      let relevanceScore = 0;

      // 언어 매칭 (30점)
      const repoLanguage = repo.language?.toLowerCase();
      if (repoLanguage && metadata.languages.includes(repoLanguage)) {
        relevanceScore += 30;
      }

      // 토픽 매칭 (각 토픽당 20점, 최대 40점)
      const repoTopics = repo.topics || [];
      const matchingTopics = repoTopics.filter(topic =>
        metadata.topics.includes(topic.toLowerCase())
      );
      relevanceScore += Math.min(matchingTopics.length * 20, 40);

      // 키워드 매칭 (각 키워드당 5점, 최대 30점)
      const searchText = `${repo.name} ${repo.description || ''}`.toLowerCase();
      const matchingKeywords = metadata.keywords.filter(keyword =>
        searchText.includes(keyword.toLowerCase())
      );
      relevanceScore += Math.min(matchingKeywords.length * 5, 30);

      return {
        ...repo,
        relevanceScore,
        matchingTopics,
        matchingKeywords: matchingKeywords.slice(0, 5) // 상위 5개만
      };
    })
    .filter(repo => repo.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * 개발자 프로필에 맞는 추천 생성
 * @param {string} devType - 개발자 유형
 * @param {Array<string>} techStacks - 선택된 기술 스택
 * @param {string} studentLevel - 학생 레벨
 * @returns {Object} 추천 정보
 */
function generateRecommendations(devType, techStacks, studentLevel = 'university') {
  const metadata = getStackMetadata(devType, studentLevel, techStacks);
  const stackNames = getTechStacksByType(devType, studentLevel)
    .filter(stack => techStacks.includes(stack.id))
    .map(stack => stack.name);

  return {
    profile: {
      devType,
      studentLevel,
      techStacks: stackNames,
      languages: metadata.languages,
      topics: metadata.topics.slice(0, 5)
    },
    suggestions: {
      searchTips: [
        `${stackNames.join(', ')} 기반 프로젝트를 찾고 있습니다`,
        `관련 언어: ${metadata.languages.join(', ')}`,
        `주요 토픽: ${metadata.topics.slice(0, 3).join(', ')}`
      ],
      focusAreas: metadata.topics.slice(0, 5)
    }
  };
}

export {
  getAvailableStacks,
  getDeveloperTypes,
  createSearchQuery,
  isRelevantToStacks,
  filterAndScoreRepos,
  generateRecommendations
};
