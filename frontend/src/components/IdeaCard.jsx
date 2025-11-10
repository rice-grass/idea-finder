import { useState, useEffect } from 'react';
import './IdeaCard.css';
import { saveIdea, removeSavedIdea, isIdeaSaved } from '../utils/savedIdeasStorage';

const IdeaCard = ({ idea, onRefine }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showRefineMenu, setShowRefineMenu] = useState(false);

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

  // Check if idea is saved on mount and when idea changes
  useEffect(() => {
    const savedIdea = isIdeaSaved(projectName);
    setIsSaved(!!savedIdea);
  }, [projectName]);

  // Handle save/unsave
  const handleSaveToggle = () => {
    if (isSaved) {
      const savedIdea = isIdeaSaved(projectName);
      if (savedIdea && savedIdea.savedId) {
        removeSavedIdea(savedIdea.savedId);
        setIsSaved(false);
      }
    } else {
      const success = saveIdea(idea);
      if (success) {
        setIsSaved(true);
      }
    }
  };

  // Handle refine options
  const handleRefine = (refinementType) => {
    setShowRefineMenu(false);
    if (onRefine) {
      onRefine(idea, refinementType);
    }
  };

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
      <div className="idea-card-actions">
        <button
          className={`save-button ${isSaved ? 'saved' : ''}`}
          onClick={handleSaveToggle}
          title={isSaved ? '저장됨' : '저장하기'}
        >
          {isSaved ? '★' : '☆'}
        </button>

        <div className="refine-menu-container">
          <button
            className="refine-button"
            onClick={() => setShowRefineMenu(!showRefineMenu)}
            title="아이디어 개선 옵션"
          >
            ⚡
          </button>

          {showRefineMenu && (
            <div className="refine-menu">
              <button onClick={() => handleRefine('similar')}>
                🔄 비슷한 아이디어
              </button>
              <button onClick={() => handleRefine('easier')}>
                📉 더 쉽게
              </button>
              <button onClick={() => handleRefine('harder')}>
                📈 더 어렵게
              </button>
              <button onClick={() => handleRefine('focus')}>
                🎯 특정 기능 집중
              </button>
            </div>
          )}
        </div>
      </div>

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
