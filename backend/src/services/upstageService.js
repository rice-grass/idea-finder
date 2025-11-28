import OpenAI from 'openai';

class UpstageService {
  constructor() {
    this._client = null;
    this.model = process.env.UPSTAGE_MODEL || 'solar-pro2';
  }

  get client() {
    if (!this._client) {
      if (!process.env.UPSTAGE_API_KEY) {
        console.warn('UPSTAGE_API_KEY is not set. Upstage features will not work.');
        // Return a dummy client that will fail gracefully
        throw new Error('UPSTAGE_API_KEY is not configured');
      }
      this._client = new OpenAI({
        apiKey: process.env.UPSTAGE_API_KEY,
        baseURL: process.env.UPSTAGE_BASE_URL || 'https://api.upstage.ai/v1'
      });
    }
    return this._client;
  }

  /**
   * 러닝 코스 설명 생성
   * @param {Object} courseData - 코스 기본 정보
   * @param {Object} theme - 선택된 테마
   * @param {Array} landmarks - 주요 명소 리스트
   * @returns {Promise<string>} 코스 설명
   */
  async generateCourseDescription(courseData, theme, landmarks = []) {
    try {
      const prompt = `
당신은 부산의 러닝 코스를 소개하는 전문가입니다.
다음 정보를 바탕으로 매력적인 코스 소개를 작성해주세요:

- 지역: ${courseData.district}
- 테마: ${theme.label}
- 거리: ${courseData.distance}
- 난이도: ${courseData.difficulty}
- 주요 명소: ${landmarks.length > 0 ? landmarks.join(', ') : '해변과 도시 경관'}

200자 이내로 코스의 특징과 매력을 설명해주세요.
친근하고 활기찬 톤으로 작성하되, 구체적인 장소와 특징을 언급해주세요.
      `.trim();

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: '당신은 부산 러닝 코스 추천 전문가입니다. 러너들에게 영감을 주는 코스 소개를 작성합니다.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating course description:', error);
      // Fallback description
      return `${courseData.district}의 ${theme.label} 테마 러닝 코스입니다. ${courseData.distance} 거리로 ${courseData.difficulty} 러너에게 적합합니다.`;
    }
  }

  /**
   * 릴스/숏폼 대본 생성
   * @param {Object} imageAnalysis - OpenAI Vision으로 분석한 이미지 정보
   * @param {string} keywords - 사용자 입력 키워드
   * @param {Object} runData - 러닝 데이터
   * @returns {Promise<string>} 릴스 대본
   */
  async generateReelsScript(imageAnalysis, keywords = '', runData = {}) {
    try {
      const prompt = `
러닝 사진을 분석한 결과와 키워드를 바탕으로 Instagram 릴스/YouTube 숏폼용 콘텐츠를 작성해주세요.

**이미지 분석 결과:**
${typeof imageAnalysis === 'object' ? JSON.stringify(imageAnalysis, null, 2) : imageAnalysis}

**키워드:** ${keywords || '없음'}

**러닝 정보:**
- 거리: ${runData.distance || '미상'}km
- 시간: ${runData.duration || '미상'}
- 코스: ${runData.courseName || '부산'}

**콘텐츠 요구사항:**
1. 제목 (짧고 임팩트 있게, 15자 이내)
2. 본문 내용 (친근하고 에너지 넘치는 톤, 150-200자, 이모지 활용)
3. 해시태그 3-5개 (부산 런케이션 홍보 요소 포함)

**응답 형식 (반드시 이 형식으로만 작성):**
{
  "title": "여기에 제목",
  "content": "여기에 본문 내용",
  "hashtags": ["해시태그1", "해시태그2", "해시태그3"]
}

JSON 형식으로만 응답해주세요. 다른 설명은 필요 없습니다.
      `.trim();

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: '당신은 SNS 콘텐츠 제작 전문가입니다. 러닝을 즐기는 2030 세대를 타겟으로 한 매력적인 콘텐츠를 JSON 형식으로 작성합니다.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 800,
        response_format: { type: "json_object" }
      });

      const generatedText = response.choices[0].message.content.trim();
      const parsed = JSON.parse(generatedText);

      return {
        title: parsed.title || '오늘의 러닝',
        content: parsed.content || `부산에서 ${runData.distance || '5'}km 러닝을 완주했어요! 🏃‍♂️`,
        hashtags: parsed.hashtags || ['부산러닝', 'RunWave', '런케이션']
      };
    } catch (error) {
      console.error('Error generating reels script:', error);
      // Fallback
      return {
        title: '오늘의 러닝 기록',
        content: `오늘 부산에서 ${runData.distance || '5'}km 러닝했어요! 🏃‍♂️\n${keywords ? keywords + '와 함께한 ' : ''}최고의 런케이션이었습니다 ✨`,
        hashtags: ['부산러닝', 'RunWave', '런케이션', '부산여행']
      };
    }
  }

  /**
   * RAG 기반 AI 컨시어지 챗봇
   * @param {string} query - 사용자 질문
   * @param {Object} ragContext - RAG 컨텍스트 (공공데이터)
   * @param {Array} conversationHistory - 대화 히스토리
   * @returns {Promise<string>} 챗봇 응답
   */
  async chatWithRAG(query, ragContext = {}, conversationHistory = []) {
    try {
      const { restaurants = [], touristSpots = [] } = ragContext;

      // RAG 컨텍스트 구성
      let contextStr = '';

      if (restaurants.length > 0) {
        contextStr += '**부산 맛집 정보:**\n';
        restaurants.forEach(r => {
          contextStr += `- ${r.name} (${r.district}): ${r.description || '부산 맛집'}\n`;
          if (r.address) contextStr += `  주소: ${r.address}\n`;
        });
        contextStr += '\n';
      }

      if (touristSpots.length > 0) {
        contextStr += '**부산 관광지 정보:**\n';
        touristSpots.forEach(t => {
          contextStr += `- ${t.name} (${t.district}): ${t.description || '부산 관광지'}\n`;
          if (t.address) contextStr += `  주소: ${t.address}\n`;
        });
      }

      const systemPrompt = `
당신은 부산 런케이션 여행을 돕는 AI 컨시어지입니다.
러너들에게 친절하고 정확한 정보를 제공하며, 부산의 매력을 알립니다.

${contextStr ? `다음은 부산의 실제 데이터입니다:\n\n${contextStr}\n` : ''}

**응답 가이드:**
1. 친근하고 친절한 톤으로 답변하세요
2. 위 데이터에 있는 정보를 우선적으로 활용하세요
3. 데이터에 없는 내용은 일반적인 조언을 제공하세요
4. 이모지를 적절히 활용하세요
5. 러닝과 관련된 팁도 함께 제공하면 좋습니다
      `.trim();

      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: query }
      ];

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: messages,
        temperature: 0.3,  // 정확한 정보 전달을 위해 낮은 temperature
        max_tokens: 1000
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error in chatWithRAG:', error);
      return '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요. 🙏';
    }
  }

  /**
   * 오아시스 혜택 요약 생성
   * @param {Array} oasisData - 오아시스 정보 배열
   * @returns {Promise<string>} 오아시스 혜택 요약
   */
  async summarizeOasisBenefits(oasisData = []) {
    try {
      if (oasisData.length === 0) {
        return '코스 주변에서 다양한 편의시설을 이용할 수 있습니다.';
      }

      const oasisList = oasisData.map(o =>
        `- ${o.name} (${o.type}): ${o.benefits || '휴식 공간 제공'}`
      ).join('\n');

      const prompt = `
다음 오아시스(급수대/휴식처) 정보를 러너들에게 한 문장으로 매력적으로 요약해주세요:

${oasisList}

50자 이내로 작성해주세요.
      `.trim();

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: '당신은 러닝 코스 안내 전문가입니다.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 200
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error summarizing oasis benefits:', error);
      return `코스 내 ${oasisData.length}곳의 오아시스에서 휴식과 물 보충이 가능합니다.`;
    }
  }
}

// Singleton pattern
let upstageServiceInstance = null;

export const getUpstageService = () => {
  if (!upstageServiceInstance) {
    upstageServiceInstance = new UpstageService();
  }
  return upstageServiceInstance;
};

export default getUpstageService;
