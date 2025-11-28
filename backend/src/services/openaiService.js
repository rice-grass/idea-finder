import OpenAI from 'openai';
import { getStudentLevel, getDifficultyForLevel } from '../config/studentLevels.js';

class OpenAIService {
  constructor() {
    this._openai = null;
  }

  get openai() {
    if (!this._openai) {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not set in environment variables');
      }
      this._openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
    return this._openai;
  }

  /**
   * Generate project ideas based on GitHub trends
   * @param {Object} trends - Analyzed GitHub trends
   * @param {Object} context - Additional context (devType, techStacks, gapAnalysis, studentLevel)
   */
  async generateIdeas(trends, context = {}) {
    try {
      const prompt = this.buildPrompt(trends, context);
      const systemPrompt = this.buildSystemPrompt(context.devType, context.studentLevel);

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000  // Increased to prevent truncation
      });

      return this.parseResponse(completion.choices[0].message.content);
    } catch (error) {
      console.error('Error generating ideas:', error.message);
      throw error;
    }
  }

  /**
   * Refine or generate variations of an existing idea
   * @param {Object} originalIdea - The original idea to refine
   * @param {string} refinementType - Type of refinement (similar, easier, harder, focus)
   * @param {Object} context - Additional context (devType, techStacks, studentLevel)
   */
  async refineIdea(originalIdea, refinementType, context = {}) {
    try {
      const prompt = this.buildRefinePrompt(originalIdea, refinementType, context);
      const systemPrompt = this.buildSystemPrompt(context.devType, context.studentLevel);

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: refinementType === 'similar' ? 0.8 : 0.7,
        max_tokens: 3000
      });

      return this.parseResponse(completion.choices[0].message.content);
    } catch (error) {
      console.error('Error refining idea:', error.message);
      throw error;
    }
  }

  /**
   * Build system prompt based on developer type and student level
   * @param {string} devType - Developer type (frontend, backend, fullstack)
   * @param {string} studentLevel - Student level (elementary, middle, high, university)
   */
  buildSystemPrompt(devType, studentLevel = 'university') {
    const basePrompt = "당신은 시장 격차를 식별하고 혁신적인 오픈소스 프로젝트 아이디어를 생성하는 전문 소프트웨어 엔지니어입니다. 모든 응답은 한국어로 작성해야 합니다.";

    const levelPrompts = {
      elementary: "초등학생을 위한 아이디어를 생성합니다. Scratch, 블록 코딩, 간단한 게임 개발 등 비주얼 프로그래밍 도구를 활용하고, 개념을 쉽게 설명하세요. 복잡한 알고리즘이나 데이터베이스는 피하고, 재미있고 직관적인 프로젝트를 제안하세요.",
      middle: "중학생을 위한 아이디어를 생성합니다. HTML/CSS/JavaScript, Python 기초 등을 활용한 간단한 웹 페이지나 앱 개발에 초점을 맞추세요. 기본적인 변수, 조건문, 반복문 수준으로 제한하고, 시각적으로 흥미로운 결과물을 만들 수 있도록 하세요.",
      high: "고등학생을 위한 아이디어를 생성합니다. React, Node.js, Python/Flask 등을 활용한 풀스택 프로젝트로 포트폴리오에 활용 가능해야 합니다. API 연동, 데이터베이스 사용, 배포까지 포함하여 대학 입시나 대회용으로 적합한 프로젝트를 제안하세요.",
      university: "대학생 및 취업 준비생을 위한 아이디어를 생성합니다. 고급 프레임워크, 마이크로서비스, CI/CD, 테스팅, 보안 등을 포함한 산업 수준의 프로젝트를 제안하세요. 실무 경험을 보여줄 수 있고 취업 포트폴리오로 활용 가능해야 합니다."
    };

    const typeSpecificPrompts = {
      frontend: "프론트엔드 개발, UI/UX 디자인, 사용자 경험 개선에 대한 깊은 전문성을 보유하고 있습니다. 클라이언트 측 애플리케이션, 컴포넌트 라이브러리, 프론트엔드 개발자를 위한 도구에 중점을 둡니다.",
      backend: "백엔드 개발, API 설계, 데이터베이스 최적화, 확장 가능한 아키텍처에 대한 깊은 전문성을 보유하고 있습니다. 서버 측 애플리케이션, 마이크로서비스, 백엔드 개발자를 위한 도구에 중점을 둡니다.",
      fullstack: "프론트엔드와 백엔드 개발 모두에 대한 포괄적인 전문성을 보유하고 있으며, 엔드투엔드 솔루션에 중점을 둡니다. 풀스택 역량을 보여주는 완전한 애플리케이션에 집중합니다."
    };

    const levelGuidance = levelPrompts[studentLevel] || levelPrompts.university;
    const typeGuidance = typeSpecificPrompts[devType] || typeSpecificPrompts.fullstack;

    return `${basePrompt} ${levelGuidance} ${typeGuidance}`;
  }

  /**
   * Build prompt for OpenAI based on trends
   * @param {Object} trends - Analyzed GitHub trends
   * @param {Object} context - Additional context
   */
  buildPrompt(trends, context = {}) {
    const topTopics = trends.topics.slice(0, 5).map(([topic]) => topic).join(', ');
    const topLanguages = trends.languages.slice(0, 3).map(([lang]) => lang).join(', ');
    const topKeywords = trends.keywords.slice(0, 10).map(([keyword]) => keyword).join(', ');

    // Get student level configuration
    const studentLevel = context.studentLevel || 'university';
    const levelConfig = getStudentLevel(studentLevel);

    let prompt = `현재 GitHub 트렌드를 기반으로 다음 데이터를 발견했습니다:

📊 인기 주제: ${topTopics}
💻 인기 언어: ${topLanguages}
🔑 주요 키워드: ${topKeywords}
`;

    // Add student level context
    if (levelConfig) {
      prompt += `\n🎓 학생 수준: ${levelConfig.label} (${levelConfig.description})`;
      prompt += `\n📅 추천 개발 기간: ${levelConfig.recommendedTime}`;
      prompt += `\n⚙️ 복잡도: ${levelConfig.complexity}`;
      prompt += `\n✨ 최대 핵심 기능: ${levelConfig.maxFeatures}개`;
    }

    // Add developer type context
    if (context.devType) {
      const devTypeLabels = {
        frontend: '프론트엔드 개발자',
        backend: '백엔드 개발자',
        fullstack: '풀스택 개발자'
      };
      prompt += `\n👤 개발자 유형: ${devTypeLabels[context.devType] || context.devType}`;
    }

    // Add tech stack context
    if (context.techStacks && context.techStacks.length > 0) {
      prompt += `\n🛠️ 선택된 기술 스택: ${context.techStacks.join(', ')}`;
    }

    // Add gap analysis context
    if (context.gapAnalysis && context.gapAnalysis.summary) {
      prompt += `\n\n📈 Gap 분석 결과:
- 높은 수요 영역: ${context.gapAnalysis.summary.highDemandCount}개 프로젝트
- 중간 수요 영역: ${context.gapAnalysis.summary.mediumDemandCount}개 프로젝트
- 평균 Gap 점수: ${context.gapAnalysis.summary.avgGapScore}

이는 많은 수요(이슈/문제)가 있지만 기존 솔루션이 제한적인 영역을 나타냅니다.`;
    }

    prompt += `

## 요청사항

위 트렌드를 분석하여 **${levelConfig ? levelConfig.label : ''}를 위한** 다음 조건을 만족하는 **3개의 혁신적인 오픈소스 프로젝트 아이디어**를 제안해주세요:

### 필수 조건
1. 현재 생태계의 **구체적인 격차**를 채움 (수요는 높지만 공급이 적은 영역에 집중)
2. 선택된 개발자 유형과 기술 스택에 **완벽하게 맞춤**
3. 개발자들이 실제로 직면하는 **실용적인 문제 해결**
4. 개인 개발자나 소규모 팀이 **실행 가능한** 규모
5. 기존 솔루션과의 **명확한 차별화**

### 각 아이디어에 포함할 정보

**기본 정보:**
- **Project Name**: 매력적이고 설명적인 프로젝트명 (한국어)
- **Description**: 프로젝트가 무엇을 하는지 2-3문장으로 설명 (한국어, 구체적으로)
- **Target Audience**: 누가 사용할지 명확하게 (예: "React를 사용하는 스타트업 프론트엔드 개발자")
- **Key Features**: 핵심 기능 3-5개 (각각 구체적인 문장으로, 단순 키워드 아님)
- **Tech Stack**: 선택된 기술 스택을 활용한 구체적 기술 조합

**시장 분석:**
- **Why it's needed**: 시장 격차를 **구체적인 증거**와 함께 설명 (현재 어떤 문제가 있고, 왜 기존 솔루션이 부족한지)
- **Gap Score**: 1-10점 (10점 = 수요 최고 & 경쟁 최소)

**실행 계획:**
- **Implementation Plan**: 3-4단계의 고수준 구현 계획 (각 단계는 구체적인 행동으로)
- **Estimated Time**: 반드시 "${levelConfig ? levelConfig.recommendedTime : '8-12주'}" 범위로 설정
- **Difficulty Level**: 반드시 "${levelConfig ? levelConfig.difficultyLevel : 'Intermediate-Advanced'}"로 설정

**기술 세부사항:**
- **Required Libraries**: 필요한 3-5개의 핵심 라이브러리/도구 (구체적인 패키지명)
- **Learning Resources**: 2-3개의 유용한 학습 리소스 (공식 문서, 튜토리얼 등)
- **Potential Challenges**: 개발 시 직면할 2-3개의 기술적 도전과제 (구체적으로)

## 출력 형식 (매우 중요!)

**절대적으로 준수해야 할 규칙:**
1. 순수한 JSON 배열만 반환 (코드 블록 없이, 설명 없이)
2. 문자열 안에 쌍따옴표가 있으면 반드시 이스케이프 처리 (\\" 사용)
3. 배열의 마지막 항목 뒤에 쉼표 없음
4. 모든 키는 정확히 아래 형식 그대로 사용
5. 일반 텍스트는 한국어로 작성하되, **기술/개발 용어는 영어로 표기** (예: Node.js, React, API, TypeScript 등)

**정확한 JSON 구조 예시:**
[
  {
    "Project Name": "실시간 API 모니터링 대시보드",
    "Description": "Node.js 기반 마이크로서비스의 API 성능을 실시간으로 모니터링하고 분석하는 대시보드입니다. Prometheus와 Grafana를 활용하여 응답 시간, 에러율, 트래픽 패턴을 시각화합니다.",
    "Target Audience": "MSA 아키텍처를 운영하는 백엔드 개발자와 DevOps 엔지니어",
    "Key Features": ["RESTful API 및 GraphQL 엔드포인트 자동 감지 및 추적", "실시간 성능 메트릭 수집 및 알림 시스템", "병목 지점 자동 분석 및 최적화 제안"],
    "Tech Stack": "Node.js, Express, Prometheus, Grafana, Redis, WebSocket",
    "Why it's needed": "많은 기업이 MSA로 전환하면서 API 모니터링의 복잡도가 증가했지만, 기존 도구들은 설정이 복잡하고 비용이 높습니다.",
    "Gap Score": 8,
    "Implementation Plan": ["Prometheus 메트릭 수집기 구현", "Express middleware로 API 추적 기능 개발", "Grafana 대시보드 템플릿 제작", "실시간 알림 시스템 구축"],
    "Estimated Time": "1-2개월",
    "Difficulty Level": "중급",
    "Required Libraries": ["express", "prom-client", "redis", "ws", "node-cron"],
    "Learning Resources": ["Prometheus 공식 문서", "Node.js Performance Monitoring Guide"],
    "Potential Challenges": ["대용량 메트릭 데이터 처리 최적화", "다양한 API 프로토콜 지원"]
  }
]

**중요:**
- 기술 용어(Node.js, API, MSA, RESTful, GraphQL, Express, Prometheus 등)는 영어 그대로 표기
- 설명 문장은 한국어로 작성
- 응답은 위와 같은 JSON 배열로만 시작하고 끝나야 하며, 다른 텍스트를 포함하지 마세요`;

    return prompt;
  }

  /**
   * Build prompt for refining an existing idea
   * @param {Object} originalIdea - The original idea
   * @param {string} refinementType - Type of refinement
   * @param {Object} context - Additional context
   */
  buildRefinePrompt(originalIdea, refinementType, context = {}) {
    const projectName = originalIdea['Project Name'] || 'Unnamed Project';
    const description = originalIdea['Description'] || '';
    const techStack = originalIdea['Tech Stack'] || '';
    const difficulty = originalIdea['Difficulty Level'] || '';

    // Get student level configuration
    const studentLevel = context.studentLevel || 'university';
    const levelConfig = getStudentLevel(studentLevel);

    const refinementInstructions = {
      similar: `다음 프로젝트와 비슷하지만 다른 각도에서 접근하는 새로운 아이디어를 1개 생성해주세요:

프로젝트: ${projectName}
설명: ${description}
기술 스택: ${techStack}
학생 수준: ${levelConfig ? levelConfig.label : '대학생'}

비슷한 문제 영역을 다루지만, 다른 사용자층이나 다른 구현 방식으로 접근하는 아이디어를 제안해주세요. ${levelConfig ? levelConfig.label : ''}에게 적합한 난이도와 범위로 제한하세요.`,

      easier: `다음 프로젝트를 ${levelConfig ? levelConfig.label : '초보자'}도 쉽게 구현할 수 있도록 단순화한 버전을 1개 생성해주세요:

프로젝트: ${projectName}
설명: ${description}
현재 난이도: ${difficulty}
목표 학생 수준: ${levelConfig ? levelConfig.label : '초등학생'}

핵심 기능은 유지하되, 구현 난이도를 낮추고 필요한 기술을 줄인 버전을 제안해주세요. 난이도는 "${levelConfig ? levelConfig.difficultyLevel : 'Beginner'}"이어야 합니다.`,

      harder: `다음 프로젝트를 더 고급 개발자를 위한 챌린징한 버전으로 확장한 아이디어를 1개 생성해주세요:

프로젝트: ${projectName}
설명: ${description}
현재 난이도: ${difficulty}
목표 학생 수준: ${levelConfig ? levelConfig.label : '대학생'}

더 복잡한 기능, 확장성, 성능 최적화, 고급 아키텍처 패턴을 포함한 버전을 제안해주세요. 난이도는 "${levelConfig ? levelConfig.difficultyLevel : 'Advanced'}"이어야 합니다.`,

      focus: `다음 프로젝트의 핵심 기능 중 하나에 집중한 전문화된 버전을 1개 생성해주세요:

프로젝트: ${projectName}
설명: ${description}
기술 스택: ${techStack}
학생 수준: ${levelConfig ? levelConfig.label : '대학생'}

프로젝트의 특정 기능이나 측면을 깊이 있게 파고드는 전문화된 도구나 라이브러리 아이디어를 제안해주세요. ${levelConfig ? levelConfig.label : ''}에게 적합한 수준으로 제안하세요.`
    };

    const instruction = refinementInstructions[refinementType] || refinementInstructions.similar;

    let prompt = `${instruction}

${context.techStacks && context.techStacks.length > 0 ? `선호하는 기술 스택: ${context.techStacks.join(', ')}` : ''}
${levelConfig ? `\n추천 개발 기간: ${levelConfig.recommendedTime}\n최대 핵심 기능: ${levelConfig.maxFeatures}개` : ''}

다음 JSON 형식으로 정확히 1개의 아이디어를 생성해주세요:

[
  {
    "Project Name": "프로젝트 이름 (영어로)",
    "Description": "2-3문장으로 프로젝트 설명",
    "Target Audience": "누구를 위한 프로젝트인지",
    "Key Features": ["주요 기능 1", "주요 기능 2", "주요 기능 3"],
    "Tech Stack": "사용할 기술 스택 (영어로, 쉼표로 구분)",
    "Why it's needed": "왜 이 프로젝트가 필요한지 설명",
    "Gap Score": 7,
    "Implementation Plan": ["구현 단계 1", "구현 단계 2", "구현 단계 3", "구현 단계 4"],
    "Estimated Time": "예상 소요 시간 (예: 2-3주, 1-2개월)",
    "Difficulty Level": "난이도 (초급/중급/고급)",
    "Required Libraries": ["필요한 라이브러리 1", "필요한 라이브러리 2"],
    "Learning Resources": ["학습 리소스 1", "학습 리소스 2"],
    "Potential Challenges": ["도전 과제 1", "도전 과제 2"]
  }
]

**중요:**
- 기술 용어(Node.js, API, React, Vue 등)는 영어 그대로 표기
- 설명 문장은 한국어로 작성
- 응답은 위와 같은 JSON 배열로만 시작하고 끝나야 하며, 다른 텍스트를 포함하지 마세요`;

    return prompt;
  }

  /**
   * Parse OpenAI response
   * @param {string} response - Raw response from OpenAI
   */
  parseResponse(response) {
    try {
      // Remove markdown code blocks if present
      let cleanedResponse = response.replace(/```json\s*/g, '').replace(/```\s*/g, '');

      // Try to extract JSON array from response
      const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        let jsonStr = jsonMatch[0];

        // Try to parse the JSON
        try {
          const parsed = JSON.parse(jsonStr);
          console.log('✅ Successfully parsed JSON with', parsed.length, 'ideas');
          return parsed;
        } catch (parseError) {
          console.error('❌ JSON parse error:', parseError.message);
          console.log('📄 Attempting to fix JSON...');

          // Aggressive JSON fixing
          let fixedJson = jsonStr
            // Remove trailing commas
            .replace(/,(\s*[}\]])/g, '$1')
            // Fix unescaped quotes in strings (simple heuristic)
            .replace(/:\s*"([^"]*)"([^",\]\}])/g, (_match, p1, p2) => {
              // If there's a character after the quote that's not a comma or bracket, it might be unescaped
              return `: "${p1}\\"${p2}`;
            })
            // Normalize whitespace
            .replace(/\s+/g, ' ')
            .trim();

          // If JSON is truncated (doesn't end properly), try to close it
          if (!fixedJson.endsWith(']')) {
            console.log('⚠️ JSON appears truncated, attempting to close arrays and objects...');

            // Count open braces and brackets
            const openBraces = (fixedJson.match(/{/g) || []).length;
            const closeBraces = (fixedJson.match(/}/g) || []).length;
            const openBrackets = (fixedJson.match(/\[/g) || []).length;
            const closeBrackets = (fixedJson.match(/\]/g) || []).length;

            // Close unclosed objects and arrays
            for (let i = 0; i < (openBraces - closeBraces); i++) {
              fixedJson += '}';
            }
            for (let i = 0; i < (openBrackets - closeBrackets); i++) {
              fixedJson += ']';
            }
          }

          try {
            const parsed = JSON.parse(fixedJson);
            console.log('✅ Successfully parsed fixed JSON with', parsed.length, 'ideas');
            return parsed;
          } catch (fixError) {
            console.error('❌ Could not fix JSON:', fixError.message);
            console.log('📄 Saving first 1000 chars to debug:', fixedJson.substring(0, 1000));
          }
        }
      }

      // If no JSON found, return raw response
      console.warn('⚠️ No JSON found in response, returning raw text');
      return [{ rawResponse: response }];
    } catch (error) {
      console.error('❌ Unexpected error parsing response:', error.message);
      return [{ rawResponse: response }];
    }
  }

  /**
   * Analyze a specific project idea
   * @param {string} ideaDescription - Description of the project idea
   */
  async analyzeIdea(ideaDescription) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an experienced software architect who evaluates project feasibility and provides technical recommendations."
          },
          {
            role: "user",
            content: `Analyze this project idea and provide feedback:\n\n${ideaDescription}\n\nProvide:\n1. Feasibility score (1-10)\n2. Potential challenges\n3. Technology recommendations\n4. Similar existing projects\n5. Differentiation strategies`
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error analyzing idea:', error.message);
      throw error;
    }
  }

  /**
   * Chat with AI about selected ideas
   * @param {Array} ideas - Array of selected ideas
   * @param {string} message - User's message
   * @param {Array} conversationHistory - Previous conversation messages
   */
  async chatWithIdeas(ideas, message, conversationHistory = []) {
    try {
      // Build context from selected ideas
      const ideasContext = ideas.map((idea, index) => {
        return `아이디어 ${index + 1}: ${idea['Project Name'] || '제목 없음'}
설명: ${idea['Description'] || '설명 없음'}
기술 스택: ${idea['Tech Stack'] || '없음'}
타겟: ${idea['Target Audience'] || '없음'}
핵심 기능: ${Array.isArray(idea['Key Features']) ? idea['Key Features'].join(', ') : '없음'}`;
      }).join('\n\n');

      const systemPrompt = `당신은 소프트웨어 프로젝트 아이디어를 구체화하는 전문 컨설턴트입니다.
사용자가 선택한 프로젝트 아이디어들에 대해 구체적이고 실용적인 조언을 제공합니다.

다음 아이디어들에 대해 논의하고 있습니다:

${ideasContext}

답변 시 다음을 유의하세요:
- 구체적이고 실행 가능한 조언 제공
- 기술적인 세부사항 포함
- 구현 단계별 가이드 제시
- 잠재적인 도전과제와 해결방안 제시
- 마크다운 형식으로 보기 좋게 작성 (제목, 리스트, 코드 블록 등 활용)
- 한국어로 답변하되, 기술 용어는 영어로 표기`;

      // Build messages array
      const messages = [
        { role: "system", content: systemPrompt },
        ...conversationHistory,
        { role: "user", content: message }
      ];

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error in chat:', error.message);
      throw error;
    }
  }

  /**
   * Analyze running photo using OpenAI Vision API
   * @param {string} base64Image - Base64 encoded image
   * @param {string} keywords - Optional keywords from user
   * @returns {Promise<Object>} Analysis result
   */
  async analyzeRunningPhoto(base64Image, keywords = '') {
    try {
      const prompt = `이 러닝 사진을 분석해주세요.
${keywords ? `키워드: ${keywords}` : ''}

다음 정보를 JSON 형식으로 추출해주세요:
{
  "location": "장소/배경 (예: 해변, 공원, 도심 등)",
  "timeOfDay": "시간대 (예: 일출, 낮, 일몰, 야경 등)",
  "mood": "분위기/느낌 (예: 상쾌한, 활기찬, 평화로운 등)",
  "landmarks": ["눈에 띄는 랜드마크나 특징 1", "특징 2"],
  "activityType": "러닝 활동 종류 (예: 조깅, 스피드런, 산책 등)",
  "weather": "날씨 상태 (예: 맑음, 흐림 등)",
  "scenery": "주요 경치 요소"
}`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini", // Use gpt-4o-mini for vision (cost-effective)
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: "low" // Use low detail for faster processing
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.3 // Lower temperature for more factual analysis
      });

      const response = completion.choices[0].message.content;

      // Try to parse JSON from response
      try {
        // Extract JSON if wrapped in markdown code blocks
        const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonStr = jsonMatch[1] || jsonMatch[0];
          return JSON.parse(jsonStr);
        }
        // Try to parse directly
        return JSON.parse(response);
      } catch (parseError) {
        console.warn('Could not parse Vision API response as JSON, returning raw text:', parseError.message);
        return {
          rawAnalysis: response,
          location: '분석 결과 텍스트 참조',
          timeOfDay: '알 수 없음',
          mood: '알 수 없음',
          landmarks: [],
          activityType: '러닝'
        };
      }
    } catch (error) {
      console.error('Error analyzing running photo:', error.message);
      // Return fallback analysis
      return {
        error: error.message,
        location: '해변 또는 도시',
        timeOfDay: '낮',
        mood: '활기찬',
        landmarks: ['러닝 코스'],
        activityType: '조깅',
        rawAnalysis: `이미지 분석 중 오류가 발생했습니다: ${error.message}`
      };
    }
  }
}

const openaiServiceInstance = new OpenAIService();

export const getOpenAIService = () => openaiServiceInstance;
export default openaiServiceInstance;
