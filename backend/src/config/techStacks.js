/**
 * 기술 스택 설정
 * 개발자 유형별 사용 가능한 기술 스택 정의
 */

const TECH_STACKS = {
  frontend: {
    label: '프론트엔드 개발자',
    frameworks: [
      {
        id: 'react',
        name: 'React',
        keywords: ['react', 'reactjs', 'jsx', 'hooks'],
        languages: ['javascript', 'typescript'],
        topics: ['react', 'reactjs', 'react-hooks', 'react-components']
      },
      {
        id: 'vue',
        name: 'Vue',
        keywords: ['vue', 'vuejs', 'vue3'],
        languages: ['javascript', 'typescript'],
        topics: ['vue', 'vuejs', 'vue3', 'composition-api']
      },
      {
        id: 'angular',
        name: 'Angular',
        keywords: ['angular', 'ng'],
        languages: ['typescript'],
        topics: ['angular', 'angular2', 'rxjs']
      },
      {
        id: 'svelte',
        name: 'Svelte',
        keywords: ['svelte', 'sveltekit'],
        languages: ['javascript', 'typescript'],
        topics: ['svelte', 'sveltekit']
      },
      {
        id: 'nextjs',
        name: 'Next.js',
        keywords: ['nextjs', 'next.js', 'next'],
        languages: ['javascript', 'typescript'],
        topics: ['nextjs', 'react', 'ssr']
      }
    ]
  },
  backend: {
    label: '백엔드 개발자',
    frameworks: [
      {
        id: 'nodejs',
        name: 'Node.js',
        keywords: ['nodejs', 'node.js', 'express', 'nestjs', 'fastify'],
        languages: ['javascript', 'typescript'],
        topics: ['nodejs', 'express', 'nestjs', 'api']
      },
      {
        id: 'python',
        name: 'Python',
        keywords: ['python', 'django', 'flask', 'fastapi'],
        languages: ['python'],
        topics: ['python', 'django', 'flask', 'fastapi', 'rest-api']
      },
      {
        id: 'java',
        name: 'Java',
        keywords: ['java', 'spring', 'springboot'],
        languages: ['java'],
        topics: ['java', 'spring-boot', 'spring', 'microservices']
      },
      {
        id: 'go',
        name: 'Go',
        keywords: ['go', 'golang', 'gin', 'fiber'],
        languages: ['go'],
        topics: ['go', 'golang', 'microservices']
      },
      {
        id: 'rust',
        name: 'Rust',
        keywords: ['rust', 'actix', 'rocket'],
        languages: ['rust'],
        topics: ['rust', 'actix-web', 'performance']
      }
    ]
  },
  fullstack: {
    label: '풀스택 개발자',
    frameworks: [
      {
        id: 'mern',
        name: 'MERN Stack',
        keywords: ['mongodb', 'express', 'react', 'nodejs'],
        languages: ['javascript', 'typescript'],
        topics: ['react', 'nodejs', 'mongodb', 'express']
      },
      {
        id: 'mean',
        name: 'MEAN Stack',
        keywords: ['mongodb', 'express', 'angular', 'nodejs'],
        languages: ['javascript', 'typescript'],
        topics: ['angular', 'nodejs', 'mongodb', 'express']
      },
      {
        id: 'django-react',
        name: 'Django + React',
        keywords: ['django', 'react', 'python'],
        languages: ['python', 'javascript', 'typescript'],
        topics: ['django', 'react', 'rest-api']
      },
      {
        id: 'spring-react',
        name: 'Spring + React',
        keywords: ['spring', 'springboot', 'react', 'java'],
        languages: ['java', 'javascript', 'typescript'],
        topics: ['spring-boot', 'react', 'java']
      },
      {
        id: 't3-stack',
        name: 'T3 Stack',
        keywords: ['nextjs', 'typescript', 'trpc', 'prisma', 'tailwind'],
        languages: ['typescript'],
        topics: ['nextjs', 'typescript', 'prisma', 'trpc']
      }
    ]
  }
};

/**
 * 개발자 유형별 기술 스택 목록 가져오기
 * @param {string} devType - 'frontend', 'backend', 'fullstack'
 * @returns {Array} 기술 스택 배열
 */
function getTechStacksByType(devType) {
  const normalizedType = devType.toLowerCase();
  if (!TECH_STACKS[normalizedType]) {
    throw new Error(`Invalid developer type: ${devType}. Must be one of: frontend, backend, fullstack`);
  }
  return TECH_STACKS[normalizedType].frameworks;
}

/**
 * 선택된 기술 스택의 키워드 및 언어 정보 가져오기
 * @param {string} devType - 개발자 유형
 * @param {Array<string>} selectedStackIds - 선택된 스택 ID 배열
 * @returns {Object} { keywords: [], languages: [], topics: [] }
 */
function getStackMetadata(devType, selectedStackIds) {
  const stacks = getTechStacksByType(devType);
  const selectedStacks = stacks.filter(stack => selectedStackIds.includes(stack.id));

  const metadata = {
    keywords: [],
    languages: [],
    topics: []
  };

  selectedStacks.forEach(stack => {
    metadata.keywords.push(...stack.keywords);
    metadata.languages.push(...stack.languages);
    metadata.topics.push(...stack.topics);
  });

  // 중복 제거
  metadata.keywords = [...new Set(metadata.keywords)];
  metadata.languages = [...new Set(metadata.languages)];
  metadata.topics = [...new Set(metadata.topics)];

  return metadata;
}

/**
 * 모든 개발자 유형 목록 가져오기
 * @returns {Array} 개발자 유형 배열
 */
function getAllDeveloperTypes() {
  return Object.keys(TECH_STACKS).map(key => ({
    id: key,
    label: TECH_STACKS[key].label
  }));
}

/**
 * GitHub 검색 쿼리 생성
 * @param {string} devType - 개발자 유형
 * @param {Array<string>} selectedStackIds - 선택된 스택 ID 배열
 * @param {number} days - 최근 며칠 이내 저장소
 * @returns {string} GitHub 검색 쿼리
 */
function buildGitHubQuery(devType, selectedStackIds, days = 7) {
  const metadata = getStackMetadata(devType, selectedStackIds);
  const date = new Date();
  date.setDate(date.getDate() - days);
  const dateStr = date.toISOString().split('T')[0];

  // 언어 조건 (OR)
  const languageQuery = metadata.languages.length > 0
    ? metadata.languages.map(lang => `language:${lang}`).join(' ')
    : '';

  // 토픽 조건 (topic으로 더 정확한 필터링)
  const topicQuery = metadata.topics.slice(0, 3).map(topic => `topic:${topic}`).join(' ');

  // 기본 조건
  const baseQuery = `created:>${dateStr} stars:>10`;

  // 최종 쿼리 조합
  return `${baseQuery} ${languageQuery} ${topicQuery}`.trim();
}

export {
  TECH_STACKS,
  getTechStacksByType,
  getStackMetadata,
  getAllDeveloperTypes,
  buildGitHubQuery
};
