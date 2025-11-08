import express from 'express';
import githubService from '../services/githubService.js';
import openaiService from '../services/openaiService.js';

const router = express.Router();

/**
 * POST /api/ideas/generate
 * Generate project ideas based on GitHub trends
 */
router.post('/generate', async (req, res) => {
  console.log('📥 [API] Received generate ideas request:', { language: req.body.language, days: req.body.days });
  try {
    const { language, days } = req.body;

    // Get trending repos
    const repos = await githubService.getTrendingRepos(language, days || 7);

    // Analyze trends
    const trends = githubService.analyzeRepoTrends(repos);

    // Generate ideas using OpenAI
    console.log('🤖 [OpenAI] Generating ideas...');
    const ideas = await openaiService.generateIdeas(trends);

    console.log('✅ [API] Successfully generated ideas');
    res.json({
      success: true,
      data: {
        trends,
        ideas
      }
    });
  } catch (error) {
    console.error('❌ [API] Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/ideas/analyze
 * Analyze a specific project idea
 */
router.post('/analyze', async (req, res) => {
  try {
    const { ideaDescription } = req.body;

    if (!ideaDescription) {
      return res.status(400).json({
        success: false,
        error: 'ideaDescription is required'
      });
    }

    const analysis = await openaiService.analyzeIdea(ideaDescription);

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

export default router;
