import React from 'react';
import './CourseSettings.css';

function CourseSettings({
  selectedDistance,
  selectedDifficulty,
  onDistanceSelect,
  onDifficultySelect,
  distances,
  difficulties
}) {
  return (
    <div className="course-settings">
      <h2>코스 설정</h2>
      <p className="subtitle">거리와 난이도를 선택하세요</p>

      <div className="settings-container">
        {/* Distance Selection */}
        <div className="setting-section">
          <h3>🏃‍♂️ 거리</h3>
          <div className="options-grid">
            {distances.map(distance => (
              <button
                key={distance.id}
                className={`option-card ${selectedDistance === distance.id ? 'selected' : ''}`}
                onClick={() => onDistanceSelect(distance.id)}
              >
                <div className="option-icon">{distance.icon || '📏'}</div>
                <div className="option-label">{distance.label}</div>
                <div className="option-detail">{distance.duration}</div>
                <div className="option-meta">{distance.calories}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="setting-section">
          <h3>⛰️ 난이도</h3>
          <div className="options-grid">
            {difficulties.map(difficulty => (
              <button
                key={difficulty.id}
                className={`option-card difficulty-${difficulty.id} ${selectedDifficulty === difficulty.id ? 'selected' : ''}`}
                onClick={() => onDifficultySelect(difficulty.id)}
              >
                <div className="option-icon">{difficulty.icon}</div>
                <div className="option-label">{difficulty.label}</div>
                <div className="option-detail">{difficulty.description}</div>
                <div className="option-meta">{difficulty.elevation}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseSettings;
