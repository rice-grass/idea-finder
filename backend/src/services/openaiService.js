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
   */
  async generateIdeas(trends) {
    try {
      const prompt = this.buildPrompt(trends);

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a creative software engineer who specializes in identifying market gaps and generating innovative open-source project ideas."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1000
      });

      return this.parseResponse(completion.choices[0].message.content);
    } catch (error) {
      console.error('Error generating ideas:', error.message);
      throw error;
    }
  }

  /**
   * Build prompt for OpenAI based on trends
   * @param {Object} trends - Analyzed GitHub trends
   */
  buildPrompt(trends) {
    const topTopics = trends.topics.slice(0, 5).map(([topic]) => topic).join(', ');
    const topLanguages = trends.languages.slice(0, 3).map(([lang]) => lang).join(', ');
    const topKeywords = trends.keywords.slice(0, 10).map(([keyword]) => keyword).join(', ');

    return `Based on current GitHub trends, I've found the following data:

Popular Topics: ${topTopics}
Popular Languages: ${topLanguages}
Common Keywords: ${topKeywords}

Please analyze these trends and suggest 3-5 innovative open-source project ideas that:
1. Fill gaps in the current ecosystem
2. Combine trending technologies in novel ways
3. Solve real-world problems
4. Are feasible for individual developers or small teams

For each idea, provide:
- Project Name
- Description (2-3 sentences)
- Target Audience
- Key Features (3-5 bullet points)
- Tech Stack suggestion
- Why it's needed (market gap explanation)

Format the response as JSON array.`;
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
