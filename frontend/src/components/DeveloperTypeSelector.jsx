import React from 'react';
import './DeveloperTypeSelector.css';

const DeveloperTypeSelector = ({ selectedType, onTypeSelect, developerTypes }) => {
  const typeIcons = {
    frontend: '🎨',
    backend: '⚙️',
    fullstack: '🚀'
  };

  return (
    <div className="developer-type-selector">
      <h2>어떤 개발자신가요?</h2>
      <p className="subtitle">당신의 개발 분야를 선택해주세요</p>

      <div className="type-options">
        {developerTypes.map((type) => (
          <div
            key={type.id}
            className={`type-card ${selectedType === type.id ? 'selected' : ''}`}
            onClick={() => onTypeSelect(type.id)}
          >
            <div className="type-icon">{typeIcons[type.id] || '💻'}</div>
            <h3>{type.label}</h3>
            <div className="check-mark">{selectedType === type.id && '✓'}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeveloperTypeSelector;
