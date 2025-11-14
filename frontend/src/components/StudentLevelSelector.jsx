import React from 'react';
import './StudentLevelSelector.css';

const StudentLevelSelector = ({ selectedLevel, onLevelSelect, studentLevels }) => {
  console.log('🎓 StudentLevelSelector rendered with:', { selectedLevel, studentLevels });

  return (
    <div className="student-level-selector">
      <p className="subtitle">학생 신분을 선택해주세요</p>

      {!studentLevels || studentLevels.length === 0 ? (
        <div className="loading-message">학생 레벨을 불러오는 중...</div>
      ) : (
        <div className="level-options">
          {studentLevels.map((level) => (
            <div
              key={level.id}
              className={`level-card ${selectedLevel === level.id ? 'selected' : ''}`}
              onClick={() => onLevelSelect(level.id)}
            >
              <h3>{level.label}</h3>
              <p className="level-description">{level.description}</p>
              {selectedLevel === level.id && <div className="check-mark">✓</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentLevelSelector;
