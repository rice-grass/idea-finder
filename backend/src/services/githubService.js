import { Octokit } from '@octokit/rest';

class GitHubService {
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });
  }

  /**
   * Get trending repositories
   * @param {string} language - Programming language filter
   * @param {number} days - Number of days to look back (default: 7)
   */
  async getTrendingRepos(language = '', days = 7) {
    try {
      const date = new Date();
      date.setDate(date.getDate() - days);
      const formattedDate = date.toISOString().split('T')[0];

      const query = `created:>${formattedDate}${language ? ` language:${language}` : ''} stars:>10`;

      const response = await this.octokit.rest.search.repos({
        q: query,
        sort: 'stars',
        order: 'desc',
        per_page: 30
      });

      return response.data.items;
    } catch (error) {
      console.error('Error fetching trending repos:', error.message);
      throw error;
    }
  }

  /**
   * Analyze repository topics and languages
   * @param {Array} repos - Array of repository objects
   */
  analyzeRepoTrends(repos) {
    const topicCount = {};
    const languageCount = {};
    const descriptionKeywords = {};

    repos.forEach(repo => {
      // Count topics
      if (repo.topics) {
        repo.topics.forEach(topic => {
          topicCount[topic] = (topicCount[topic] || 0) + 1;
        });
      }

      // Count languages
      if (repo.language) {
        languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
      }

      // Extract keywords from description
      if (repo.description) {
        const words = repo.description.toLowerCase().split(/\s+/);
        words.forEach(word => {
          if (word.length > 4) {
            descriptionKeywords[word] = (descriptionKeywords[word] || 0) + 1;
          }
        });
      }
    });

    return {
      topics: Object.entries(topicCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
      languages: Object.entries(languageCount)
        .sort((a, b) => b[1] - a[1]),
      keywords: Object.entries(descriptionKeywords)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
    };
  }

  /**
   * Search repositories by topic
   * @param {string} topic - Topic to search for
   */
  async searchByTopic(topic) {
    try {
      const response = await this.octokit.rest.search.repos({
        q: `topic:${topic}`,
        sort: 'stars',
        order: 'desc',
        per_page: 10
      });

      return response.data.items;
    } catch (error) {
      console.error('Error searching by topic:', error.message);
      throw error;
    }
  }
}

export default new GitHubService();
