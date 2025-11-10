import React from 'react';
import './TechStackSelector.css';

const TechStackSelector = ({ techStacks, selectedStacks, onStackToggle, devType, error }) => {
  const devTypeLabels = {
    frontend: '프론트엔드',
    backend: '백엔드',
    fullstack: '풀스택'
  };

  return (
    <div className="tech-stack-selector">
      <h2>{devTypeLabels[devType]} 개발자님,</h2>
      <p className="subtitle">어떤 기술 스택을 사용하시나요? (복수 선택 가능)</p>

      <div className="stack-grid">
        {techStacks.map((stack) => (
          <div
            key={stack.id}
            className={`stack-chip ${selectedStacks.includes(stack.id) ? 'selected' : ''}`}
            onClick={() => onStackToggle(stack.id)}
          >
            <span className="stack-name">{stack.name}</span>
            {selectedStacks.includes(stack.id) && (
              <span className="check-icon">✓</span>
            )}
          </div>
        ))}
      </div>

      {selectedStacks.length > 0 && (
        <div className="selection-summary">
          <p>선택된 스택: <strong>{selectedStacks.length}개</strong></p>
        </div>
      )}

      {/* Only show a warning if a parent explicitly passes an error (e.g., after attempting to proceed) */}
      {error && (
        <div className="selection-warning">
          {error}
        </div>
      )}
    </div>
  );
};

export default TechStackSelector;
