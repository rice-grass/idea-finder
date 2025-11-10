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
        temperature: 0.8,
        max_tokens: 1500
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
    const basePrompt = "You are a creative software engineer who specializes in identifying market gaps and generating innovative open-source project ideas.";

    const typeSpecificPrompts = {
      frontend: "You have deep expertise in frontend development, UI/UX design, and creating engaging user experiences. Focus on client-side applications, component libraries, and developer tools for frontend developers.",
      backend: "You have deep expertise in backend development, API design, database optimization, and scalable architectures. Focus on server-side applications, microservices, and developer tools for backend developers.",
      fullstack: "You have comprehensive expertise in both frontend and backend development, with a focus on end-to-end solutions. Focus on complete applications that showcase full-stack capabilities."
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

    let prompt = `Based on current GitHub trends, I've found the following data:

Popular Topics: ${topTopics}
Popular Languages: ${topLanguages}
Common Keywords: ${topKeywords}
`;

    // Add developer type context
    if (context.devType) {
      const devTypeLabels = {
        frontend: 'Frontend Developer',
        backend: 'Backend Developer',
        fullstack: 'Fullstack Developer'
      };
      prompt += `\nDeveloper Type: ${devTypeLabels[context.devType] || context.devType}`;
    }

    // Add tech stack context
    if (context.techStacks && context.techStacks.length > 0) {
      prompt += `\nSelected Tech Stacks: ${context.techStacks.join(', ')}`;
    }

    // Add gap analysis context
    if (context.gapAnalysis && context.gapAnalysis.summary) {
      prompt += `\n\nGap Analysis Results:
- High Demand Areas: ${context.gapAnalysis.summary.highDemandCount} projects
- Medium Demand Areas: ${context.gapAnalysis.summary.mediumDemandCount} projects
- Average Gap Score: ${context.gapAnalysis.summary.avgGapScore}

This indicates areas where there is high demand (many issues/problems) but limited existing solutions.`;
    }

    prompt += `\n\nPlease analyze these trends and suggest 3 innovative open-source project ideas that:
1. Fill SPECIFIC gaps in the current ecosystem (focus on high-demand, low-supply areas)
2. Are tailored to the developer type and selected tech stacks
3. Solve real-world problems that developers are facing
4. Are feasible for individual developers or small teams
5. Have clear differentiation from existing solutions

For each idea, provide:
- Project Name (catchy and descriptive)
- Description (2-3 sentences explaining what it does)
- Target Audience (who will use this)
- Key Features (3-5 bullet points of core functionality)
- Tech Stack (specific technologies to use, matching the selected stacks)
- Why it's needed (explain the market gap with specific evidence)
- Gap Score (estimate from 1-10, where 10 means highest demand and lowest competition)

Format the response as a JSON array with these exact keys: "Project Name", "Description", "Target Audience", "Key Features", "Tech Stack", "Why it's needed", "Gap Score"`;

    return prompt;
  }

  /**
   * Parse OpenAI response
   * @param {string} response - Raw response from OpenAI
   */
  parseResponse(response) {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // If no JSON found, return raw response
      return { rawResponse: response };
    } catch (error) {
      console.error('Error parsing OpenAI response:', error.message);
      return { rawResponse: response };
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
