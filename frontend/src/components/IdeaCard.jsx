import React from 'react';
import './IdeaCard.css';

const IdeaCard = ({ idea }) => {
  // Handle both structured and raw responses from OpenAI
  const projectName = idea['Project Name'] || idea.name || 'Unnamed Project';
  const description = idea['Description'] || idea.description || '';
  const targetAudience = idea['Target Audience'] || idea.audience || '';
  const features = idea['Key Features'] || idea.features || [];
  const techStack = idea['Tech Stack'] || idea.stack || '';
  const whyNeeded = idea['Why it\'s needed'] || idea.why || '';
  const gapScore = idea['Gap Score'] || idea.gapScore || 0;

  // Determine gap level for styling
  const getGapLevel = (score) => {
    if (score >= 8) return 'high';
    if (score >= 5) return 'medium';
    return 'low';
  };

  const gapLevel = getGapLevel(gapScore);

  return (
    <div className="idea-card">
      {gapScore > 0 && (
        <div className={`gap-badge ${gapLevel}`}>
          Gap Score: {gapScore}/10
        </div>
      )}

      <h3 className="idea-title">{projectName}</h3>

      <p className="idea-description">{description}</p>

      {targetAudience && (
        <div className="idea-section">
          <h4>Target Audience</h4>
          <p>{targetAudience}</p>
        </div>
      )}

      {features && features.length > 0 && (
        <div className="idea-section">
          <h4>Key Features</h4>
          <ul className="features-list">
            {features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
      )}

      {techStack && (
        <div className="idea-section">
          <h4>Tech Stack</h4>
          <p className="tech-stack">{techStack}</p>
        </div>
      )}

      {whyNeeded && (
        <div className="idea-section why-needed">
          <h4>Market Gap</h4>
          <p>{whyNeeded}</p>
        </div>
      )}
    </div>
  );
};

export default IdeaCard;
