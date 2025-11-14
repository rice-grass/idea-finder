/**
 * 기술 스택 설정
 * 개발자 유형별, 학생 레벨별 사용 가능한 기술 스택 정의
 */

const TECH_STACKS = {
  frontend: {
    label: '프론트엔드 개발자',
    levels: {
      elementary: {
        frameworks: [
          {
            id: 'scratch',
            name: 'Scratch',
            keywords: ['scratch', 'visual-programming', 'blocks'],
            languages: ['scratch'],
            topics: ['scratch', 'education', 'visual-programming']
          },
          {
            id: 'blockly',
            name: 'Blockly',
            keywords: ['blockly', 'google-blockly', 'visual'],
            languages: ['javascript'],
            topics: ['blockly', 'visual-programming', 'education']
          },
          {
            id: 'p5js',
            name: 'p5.js',
            keywords: ['p5js', 'processing', 'creative-coding'],
            languages: ['javascript'],
            topics: ['p5js', 'creative-coding', 'generative-art']
          }
        ]
      },
      middle: {
        frameworks: [
          {
            id: 'html-css',
            name: 'HTML/CSS',
            keywords: ['html', 'css', 'html5', 'css3', 'web'],
            languages: ['html', 'css'],
            topics: ['html', 'css', 'web-design', 'frontend']
          },
          {
            id: 'javascript-basic',
            name: 'JavaScript 기초',
            keywords: ['javascript', 'js', 'dom', 'vanilla-js'],
            languages: ['javascript'],
            topics: ['javascript', 'web-development', 'dom']
          },
          {
            id: 'bootstrap',
            name: 'Bootstrap',
            keywords: ['bootstrap', 'css-framework', 'responsive'],
            languages: ['html', 'css', 'javascript'],
            topics: ['bootstrap', 'responsive-design', 'css-framework']
          }
        ]
      },
      high: {
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
            id: 'nextjs',
            name: 'Next.js',
            keywords: ['nextjs', 'next.js', 'next'],
            languages: ['javascript', 'typescript'],
            topics: ['nextjs', 'react', 'ssr']
          },
          {
            id: 'tailwind',
            name: 'Tailwind CSS',
            keywords: ['tailwind', 'tailwindcss', 'utility-first'],
            languages: ['css'],
            topics: ['tailwindcss', 'css', 'utility-first']
          }
        ]
      },
      university: {
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
      }
    }
  },
  backend: {
    label: '백엔드 개발자',
    levels: {
      elementary: {
        frameworks: [
          {
            id: 'scratch-backend',
            name: 'Scratch 확장',
            keywords: ['scratch', 'extensions', 'blocks'],
            languages: ['scratch'],
            topics: ['scratch', 'education']
          }
        ]
      },
      middle: {
        frameworks: [
          {
            id: 'python-basic',
            name: 'Python 기초',
            keywords: ['python', 'beginner', 'basics'],
            languages: ['python'],
            topics: ['python', 'beginner', 'education']
          },
          {
            id: 'flask-simple',
            name: 'Flask (간단한 웹)',
            keywords: ['flask', 'python', 'web', 'simple'],
            languages: ['python'],
            topics: ['flask', 'python', 'web']
          }
        ]
      },
      high: {
        frameworks: [
          {
            id: 'nodejs',
            name: 'Node.js',
            keywords: ['nodejs', 'node.js', 'express', 'fastify'],
            languages: ['javascript', 'typescript'],
            topics: ['nodejs', 'express', 'api']
          },
          {
            id: 'python',
            name: 'Python (Flask/Django)',
            keywords: ['python', 'django', 'flask', 'fastapi'],
            languages: ['python'],
            topics: ['python', 'django', 'flask', 'rest-api']
          },
          {
            id: 'mongodb',
            name: 'MongoDB',
            keywords: ['mongodb', 'nosql', 'database'],
            languages: ['javascript'],
            topics: ['mongodb', 'database', 'nosql']
          },
          {
            id: 'postgresql',
            name: 'PostgreSQL',
            keywords: ['postgresql', 'postgres', 'sql'],
            languages: ['sql'],
            topics: ['postgresql', 'database', 'sql']
          }
        ]
      },
      university: {
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
          },
          {
            id: 'graphql',
            name: 'GraphQL',
            keywords: ['graphql', 'apollo', 'api'],
            languages: ['javascript', 'typescript'],
            topics: ['graphql', 'api', 'apollo']
          }
        ]
      }
    }
  },
  fullstack: {
    label: '풀스택 개발자',
    levels: {
      elementary: {
        frameworks: [
          {
            id: 'scratch-web',
            name: 'Scratch 웹 프로젝트',
            keywords: ['scratch', 'web', 'interactive'],
            languages: ['scratch'],
            topics: ['scratch', 'education', 'web']
          },
          {
            id: 'glitch',
            name: 'Glitch (웹 앱)',
            keywords: ['glitch', 'web', 'nodejs', 'simple'],
            languages: ['html', 'css', 'javascript'],
            topics: ['web', 'beginner', 'fullstack']
          }
        ]
      },
      middle: {
        frameworks: [
          {
            id: 'html-css-js',
            name: 'HTML/CSS/JavaScript',
            keywords: ['html', 'css', 'javascript', 'web'],
            languages: ['html', 'css', 'javascript'],
            topics: ['web-development', 'frontend', 'fullstack']
          },
          {
            id: 'python-flask-basic',
            name: 'Python + Flask',
            keywords: ['python', 'flask', 'web', 'templates'],
            languages: ['python', 'html', 'css'],
            topics: ['flask', 'python', 'web', 'fullstack']
          }
        ]
      },
      high: {
        frameworks: [
          {
            id: 'mern-basic',
            name: 'MERN Stack (기본)',
            keywords: ['mongodb', 'express', 'react', 'nodejs'],
            languages: ['javascript', 'typescript'],
            topics: ['react', 'nodejs', 'mongodb', 'express']
          },
          {
            id: 'django-simple',
            name: 'Django (풀스택)',
            keywords: ['django', 'python', 'templates', 'orm'],
            languages: ['python', 'html', 'css', 'javascript'],
            topics: ['django', 'python', 'fullstack']
          },
          {
            id: 'nextjs-basic',
            name: 'Next.js (풀스택)',
            keywords: ['nextjs', 'react', 'ssr', 'api'],
            languages: ['javascript', 'typescript'],
            topics: ['nextjs', 'react', 'fullstack']
          }
        ]
      },
      university: {
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
    }
  }
};

/**
 * 개발자 유형 및 학생 레벨별 기술 스택 목록 가져오기
 * @param {string} devType - 'frontend', 'backend', 'fullstack'
 * @param {string} studentLevel - 'elementary', 'middle', 'high', 'university'
 * @returns {Array} 기술 스택 배열
 */
function getTechStacksByType(devType, studentLevel = 'university') {
  const normalizedType = devType.toLowerCase();
  const normalizedLevel = studentLevel.toLowerCase();

  if (!TECH_STACKS[normalizedType]) {
    throw new Error(`Invalid developer type: ${devType}. Must be one of: frontend, backend, fullstack`);
  }

  if (!TECH_STACKS[normalizedType].levels[normalizedLevel]) {
    throw new Error(`Invalid student level: ${studentLevel}. Must be one of: elementary, middle, high, university`);
  }

  return TECH_STACKS[normalizedType].levels[normalizedLevel].frameworks;
}

/**
 * 선택된 기술 스택의 키워드 및 언어 정보 가져오기
 * @param {string} devType - 개발자 유형
 * @param {string} studentLevel - 학생 레벨
 * @param {Array<string>} selectedStackIds - 선택된 스택 ID 배열
 * @returns {Object} { keywords: [], languages: [], topics: [] }
 */
function getStackMetadata(devType, studentLevel, selectedStackIds) {
  const stacks = getTechStacksByType(devType, studentLevel);
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
 * @param {string} studentLevel - 학생 레벨
 * @param {Array<string>} selectedStackIds - 선택된 스택 ID 배열
 * @param {number} days - 최근 며칠 이내 저장소
 * @returns {string} GitHub 검색 쿼리
 */
function buildGitHubQuery(devType, studentLevel, selectedStackIds, days = 7) {
  const metadata = getStackMetadata(devType, studentLevel, selectedStackIds);
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
