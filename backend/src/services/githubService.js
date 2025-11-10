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

  /**
   * Get issue count for a repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Object} Issue statistics
   */
  async getRepoIssues(owner, repo) {
    try {
      // Get open issues
      const openIssues = await this.octokit.rest.issues.listForRepo({
        owner,
        repo,
        state: 'open',
        per_page: 1 // We only need the count
      });

      // Get closed issues
      const closedIssues = await this.octokit.rest.issues.listForRepo({
        owner,
        repo,
        state: 'closed',
        per_page: 1
      });

      return {
        open: openIssues.data.length > 0 ? parseInt(openIssues.headers.link?.match(/page=(\d+)>; rel="last"/)?.[1] || openIssues.data.length) : 0,
        closed: closedIssues.data.length > 0 ? parseInt(closedIssues.headers.link?.match(/page=(\d+)>; rel="last"/)?.[1] || closedIssues.data.length) : 0
      };
    } catch (error) {
      console.error(`Error fetching issues for ${owner}/${repo}:`, error.message);
      // Return 0 if we can't fetch issues (might be rate limited or repo doesn't exist)
      return { open: 0, closed: 0 };
    }
  }

  /**
   * Calculate gap metrics for repositories
   * Gap = 많은 이슈가 있지만 해결책(저장소)이 적은 영역
   * @param {Array} repos - Array of repository objects
   * @returns {Array} Repositories with gap metrics
   */
  async calculateGapMetrics(repos) {
    try {
      const reposWithMetrics = await Promise.all(
        repos.slice(0, 15).map(async (repo) => { // Limit to 15 to avoid rate limits
          try {
            const issues = await this.getRepoIssues(repo.owner.login, repo.name);
            const totalIssues = issues.open + issues.closed;

            // Gap Score 계산:
            // - 이슈가 많을수록 높은 점수
            // - 스타가 적을수록 높은 점수 (경쟁이 적음)
            // - 열린 이슈 비율이 높을수록 높은 점수 (미해결 문제가 많음)
            const issueRatio = totalIssues > 0 ? issues.open / totalIssues : 0;
            const starPenalty = Math.min(repo.stargazers_count / 1000, 10); // 스타가 많으면 페널티
            const gapScore = (issues.open * 0.5) + (issueRatio * 30) - starPenalty;

            return {
              ...repo,
              gapMetrics: {
                openIssues: issues.open,
                closedIssues: issues.closed,
                totalIssues,
                issueRatio: issueRatio.toFixed(2),
                gapScore: Math.max(gapScore, 0).toFixed(2),
                demand: this.categorizeDemand(gapScore)
              }
            };
          } catch (error) {
            console.error(`Error processing ${repo.full_name}:`, error.message);
            return {
              ...repo,
              gapMetrics: {
                openIssues: 0,
                closedIssues: 0,
                totalIssues: 0,
                issueRatio: 0,
                gapScore: 0,
                demand: 'unknown'
              }
            };
          }
        })
      );

      return reposWithMetrics.sort((a, b) =>
        parseFloat(b.gapMetrics.gapScore) - parseFloat(a.gapMetrics.gapScore)
      );
    } catch (error) {
      console.error('Error calculating gap metrics:', error.message);
      throw error;
    }
  }

  /**
   * Categorize demand level based on gap score
   * @param {number} gapScore - Gap score
   * @returns {string} Demand level
   */
  categorizeDemand(gapScore) {
    if (gapScore >= 20) return 'high';
    if (gapScore >= 10) return 'medium';
    if (gapScore > 0) return 'low';
    return 'none';
  }

  /**
   * Find gaps in the ecosystem
   * 특정 기술 스택에서 수요는 많지만 공급이 적은 영역 찾기
   * @param {string} query - GitHub search query
   * @returns {Object} Gap analysis results
   */
  async findGaps(query) {
    try {
      const response = await this.octokit.rest.search.repos({
        q: query,
        sort: 'stars',
        order: 'desc',
        per_page: 30
      });

      const repos = response.data.items;
      const reposWithGaps = await this.calculateGapMetrics(repos);
      const trends = this.analyzeRepoTrends(repos);

      // Gap 분석 결과
      const gapAnalysis = {
        highDemandAreas: reposWithGaps
          .filter(r => r.gapMetrics.demand === 'high')
          .slice(0, 5),
        mediumDemandAreas: reposWithGaps
          .filter(r => r.gapMetrics.demand === 'medium')
          .slice(0, 5),
        trends,
        summary: {
          totalRepos: repos.length,
          highDemandCount: reposWithGaps.filter(r => r.gapMetrics.demand === 'high').length,
          mediumDemandCount: reposWithGaps.filter(r => r.gapMetrics.demand === 'medium').length,
          avgGapScore: (reposWithGaps.reduce((sum, r) => sum + parseFloat(r.gapMetrics.gapScore), 0) / reposWithGaps.length).toFixed(2)
        }
      };

      return gapAnalysis;
    } catch (error) {
      console.error('Error finding gaps:', error.message);
      throw error;
    }
  }

  /**
   * Search repositories with custom query
   * @param {string} query - Custom GitHub search query
   * @param {number} perPage - Results per page
   * @returns {Array} Repository items
   */
  async searchRepos(query, perPage = 30) {
    try {
      const response = await this.octokit.rest.search.repos({
        q: query,
        sort: 'stars',
        order: 'desc',
        per_page: perPage
      });

      return response.data.items;
    } catch (error) {
      console.error('Error searching repos:', error.message);
      throw error;
    }
  }
}

export default new GitHubService();
