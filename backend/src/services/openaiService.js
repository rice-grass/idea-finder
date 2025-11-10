import OpenAI from 'openai';

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
   * @param {Object} context - Additional context (devType, techStacks, gapAnalysis)
   */
  async generateIdeas(trends, context = {}) {
    try {
      const prompt = this.buildPrompt(trends, context);
      const systemPrompt = this.buildSystemPrompt(context.devType);

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
   * Build system prompt based on developer type
   * @param {string} devType - Developer type (frontend, backend, fullstack)
   */
  buildSystemPrompt(devType) {
    const basePrompt = "당신은 시장 격차를 식별하고 혁신적인 오픈소스 프로젝트 아이디어를 생성하는 전문 소프트웨어 엔지니어입니다. 모든 응답은 한국어로 작성해야 합니다.";

    const typeSpecificPrompts = {
      frontend: "프론트엔드 개발, UI/UX 디자인, 사용자 경험 개선에 대한 깊은 전문성을 보유하고 있습니다. 클라이언트 측 애플리케이션, 컴포넌트 라이브러리, 프론트엔드 개발자를 위한 도구에 중점을 둡니다.",
      backend: "백엔드 개발, API 설계, 데이터베이스 최적화, 확장 가능한 아키텍처에 대한 깊은 전문성을 보유하고 있습니다. 서버 측 애플리케이션, 마이크로서비스, 백엔드 개발자를 위한 도구에 중점을 둡니다.",
      fullstack: "프론트엔드와 백엔드 개발 모두에 대한 포괄적인 전문성을 보유하고 있으며, 엔드투엔드 솔루션에 중점을 둡니다. 풀스택 역량을 보여주는 완전한 애플리케이션에 집중합니다."
    };

    return `${basePrompt} ${typeSpecificPrompts[devType] || typeSpecificPrompts.fullstack}`;
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

    let prompt = `현재 GitHub 트렌드를 기반으로 다음 데이터를 발견했습니다:

📊 인기 주제: ${topTopics}
💻 인기 언어: ${topLanguages}
🔑 주요 키워드: ${topKeywords}
`;

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

위 트렌드를 분석하여 다음 조건을 만족하는 **3개의 혁신적인 오픈소스 프로젝트 아이디어**를 제안해주세요:

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
- **Estimated Time**: 예상 개발 시간 (예: "2-3주", "1개월", "2-3개월")
- **Difficulty Level**: 난이도 ("초급", "중급", "고급" 중 하나)

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
}

export default new OpenAIService();
