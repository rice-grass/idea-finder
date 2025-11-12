import React from 'react';
import './DeveloperTypeSelector.css';

const DeveloperTypeSelector = ({ selectedType, onTypeSelect, developerTypes }) => {
  console.log('🎯 DeveloperTypeSelector rendered with:', { selectedType, developerTypes });

  return (
    <div className="developer-type-selector">
      <p className="subtitle">당신의 개발 분야를 선택해주세요</p>

      {!developerTypes || developerTypes.length === 0 ? (
        <div className="loading-message">개발자 유형을 불러오는 중...</div>
      ) : (
        <div className="type-options">
          {developerTypes.map((type) => (
            <div
              key={type.id}
              className={`type-card ${selectedType === type.id ? 'selected' : ''}`}
              onClick={() => onTypeSelect(type.id)}
            >
              <h3>{type.label}</h3>
              {selectedType === type.id && <div className="check-mark">✓</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeveloperTypeSelector;
