import express from 'express';
import githubService from '../services/githubService.js';

const router = express.Router();

/**
 * GET /api/github/trending
 * Get trending repositories
 */
router.get('/trending', async (req, res) => {
  try {
    const { language, days } = req.query;
    const repos = await githubService.getTrendingRepos(language, days ? parseInt(days) : 7);

    res.json({
      success: true,
      count: repos.length,
      data: repos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/github/analyze
 * Analyze GitHub trends
 */
router.get('/analyze', async (req, res) => {
  try {
    const { language, days } = req.query;
    const repos = await githubService.getTrendingRepos(language, days ? parseInt(days) : 7);
    const analysis = githubService.analyzeRepoTrends(repos);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/github/search
 * Search repositories by topic
 */
router.get('/search', async (req, res) => {
  try {
    const { topic } = req.query;

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Topic parameter is required'
      });
    }

    const repos = await githubService.searchByTopic(topic);

    res.json({
      success: true,
      count: repos.length,
      data: repos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
