import { useState } from 'react';
import './IdeaCard.css';

const IdeaCard = ({ idea }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Debug: Log the idea data
  console.log('IdeaCard received idea:', idea);

  // Handle both structured and raw responses from OpenAI
  const projectName = idea['Project Name'] || idea.name || 'Unnamed Project';
  const description = idea['Description'] || idea.description || '';
  const targetAudience = idea['Target Audience'] || idea.audience || '';
  const features = idea['Key Features'] || idea.features || [];
  const techStack = idea['Tech Stack'] || idea.stack || '';
  const whyNeeded = idea['Why it\'s needed'] || idea.why || '';
  const gapScore = idea['Gap Score'] || idea.gapScore || 0;

  // New detailed fields - ensure arrays
  const implementationPlan = Array.isArray(idea['Implementation Plan'])
    ? idea['Implementation Plan']
    : (idea['Implementation Plan'] ? [idea['Implementation Plan']] : []);
  const estimatedTime = idea['Estimated Time'] || '';
  const difficultyLevel = idea['Difficulty Level'] || '';
  const requiredLibraries = Array.isArray(idea['Required Libraries'])
    ? idea['Required Libraries']
    : (idea['Required Libraries'] ? [idea['Required Libraries']] : []);
  const learningResources = Array.isArray(idea['Learning Resources'])
    ? idea['Learning Resources']
    : (idea['Learning Resources'] ? [idea['Learning Resources']] : []);
  const potentialChallenges = Array.isArray(idea['Potential Challenges'])
    ? idea['Potential Challenges']
    : (idea['Potential Challenges'] ? [idea['Potential Challenges']] : []);

  // Determine gap level for styling
  const getGapLevel = (score) => {
    if (score >= 8) return 'high';
    if (score >= 5) return 'medium';
    return 'low';
  };

  // Get difficulty badge color
  const getDifficultyClass = (level) => {
    const normalized = level.toLowerCase();
    if (normalized.includes('beginner')) return 'beginner';
    if (normalized.includes('advanced')) return 'advanced';
    return 'intermediate';
  };

  const gapLevel = getGapLevel(gapScore);

  // Debug: Check if detailed fields have data
  console.log('Detailed fields:', {
    implementationPlan,
    estimatedTime,
    difficultyLevel,
    requiredLibraries,
    learningResources,
    potentialChallenges
  });

  return (
    <div className={`idea-card ${isExpanded ? 'expanded' : ''}`}>
      <div className="idea-card-header">
        {gapScore > 0 && (
          <div className={`gap-badge ${gapLevel}`}>
            Gap Score: {gapScore}/10
          </div>
        )}
        {difficultyLevel && (
          <div className={`difficulty-badge ${getDifficultyClass(difficultyLevel)}`}>
            {difficultyLevel}
          </div>
        )}
        {estimatedTime && (
          <div className="time-badge">
            ⏱️ {estimatedTime}
          </div>
        )}
      </div>

      <h3 className="idea-title">{projectName}</h3>

      <p className="idea-description">{description}</p>

      {targetAudience && (
        <div className="idea-section">
          <h4>🎯 Target Audience</h4>
          <p>{targetAudience}</p>
        </div>
      )}

      {features && features.length > 0 && (
        <div className="idea-section">
          <h4>✨ Key Features</h4>
          <ul className="features-list">
            {features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
      )}

      {techStack && (
        <div className="idea-section">
          <h4>🛠️ Tech Stack</h4>
          <p className="tech-stack">{techStack}</p>
        </div>
      )}

      {whyNeeded && (
        <div className="idea-section why-needed">
          <h4>💡 Market Gap</h4>
          <p>{whyNeeded}</p>
        </div>
      )}

      {/* Expandable detailed section */}
      {isExpanded && (
        <div className="idea-details">
          {implementationPlan && implementationPlan.length > 0 && (
            <div className="idea-section">
              <h4>📋 Implementation Plan</h4>
              <ol className="implementation-list">
                {implementationPlan.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          )}

          {requiredLibraries && requiredLibraries.length > 0 && (
            <div className="idea-section">
              <h4>📦 Required Libraries</h4>
              <ul className="libraries-list">
                {requiredLibraries.map((lib, index) => (
                  <li key={index}>{lib}</li>
                ))}
              </ul>
            </div>
          )}

          {learningResources && learningResources.length > 0 && (
            <div className="idea-section">
              <h4>📚 Learning Resources</h4>
              <ul className="resources-list">
                {learningResources.map((resource, index) => (
                  <li key={index}>{resource}</li>
                ))}
              </ul>
            </div>
          )}

          {potentialChallenges && potentialChallenges.length > 0 && (
            <div className="idea-section challenges">
              <h4>⚠️ Potential Challenges</h4>
              <ul className="challenges-list">
                {potentialChallenges.map((challenge, index) => (
                  <li key={index}>{challenge}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <button
        className="expand-button"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? '▲ 간단히 보기' : '▼ 상세 정보 보기'}
      </button>
    </div>
  );
};

export default IdeaCard;
