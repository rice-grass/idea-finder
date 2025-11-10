import express from 'express';
import githubService from '../services/githubService.js';
import openaiService from '../services/openaiService.js';
import {
  getDeveloperTypes,
  getAvailableStacks,
  createSearchQuery,
  filterAndScoreRepos
} from '../services/developerProfileService.js';

const router = express.Router();

/**
 * GET /api/ideas/developer-types
 * Get all available developer types
 */
router.get('/developer-types', (req, res) => {
  try {
    const types = getDeveloperTypes();
    res.json({
      success: true,
      data: types
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/ideas/tech-stacks/:devType
 * Get available tech stacks for a developer type
 */
router.get('/tech-stacks/:devType', (req, res) => {
  try {
    const { devType } = req.params;
    const stacks = getAvailableStacks(devType);
    res.json({
      success: true,
      data: stacks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/ideas/generate
 * Generate project ideas based on GitHub trends (Enhanced version)
 */
router.post('/generate', async (req, res) => {
  console.log('📥 [API] Received generate ideas request:', req.body);
  try {
    const { language, days, devType, techStacks } = req.body;

    let repos;
    let gapAnalysis = null;

    // NEW: Use developer profile if provided
    if (devType && techStacks && techStacks.length > 0) {
      console.log(`👤 [Profile] Generating for ${devType} developer with stacks:`, techStacks);

      // Create optimized search query
      const searchContext = createSearchQuery(devType, techStacks, days || 7);
      console.log('🔍 [Search] Query:', searchContext.query);

      // Get repos using custom query
      repos = await githubService.searchRepos(searchContext.query);

      // Filter and score based on relevance
      repos = filterAndScoreRepos(repos, searchContext.metadata);
      console.log(`✅ [Filter] Found ${repos.length} relevant repos`);

      // Perform gap analysis
      console.log('📊 [Gap] Analyzing market gaps...');
      gapAnalysis = await githubService.findGaps(searchContext.query);
      console.log(`📊 [Gap] High demand: ${gapAnalysis.summary.highDemandCount}, Medium: ${gapAnalysis.summary.mediumDemandCount}`);

    } else {
      // LEGACY: Use old method for backward compatibility
      console.log('📚 [Legacy] Using language-based search');
      repos = await githubService.getTrendingRepos(language, days || 7);
    }

    // Analyze trends
    const trends = githubService.analyzeRepoTrends(repos);

    // Generate ideas using OpenAI with context
    console.log('🤖 [OpenAI] Generating ideas...');
    const context = {
      devType,
      techStacks,
      gapAnalysis
    };
    const ideas = await openaiService.generateIdeas(trends, context);

    console.log('✅ [API] Successfully generated ideas');
    res.json({
      success: true,
      data: {
        trends,
        ideas,
        gapAnalysis: gapAnalysis ? gapAnalysis.summary : null,
        relevantRepos: repos.slice(0, 10).map(r => ({
          name: r.name,
          description: r.description,
          stars: r.stargazers_count,
          url: r.html_url,
          relevanceScore: r.relevanceScore,
          gapMetrics: r.gapMetrics
        }))
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
