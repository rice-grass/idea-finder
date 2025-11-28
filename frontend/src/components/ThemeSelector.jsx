import React from 'react';
import './ThemeSelector.css';

function ThemeSelector({ selectedTheme, onThemeSelect, themes }) {
  return (
    <div className="theme-selector">
      <h2>어떤 테마로 달릴까요?</h2>
      <p className="subtitle">코스의 분위기를 선택하세요</p>

      <div className="theme-grid">
        {themes.map(theme => (
          <button
            key={theme.id}
            className={`theme-card ${selectedTheme === theme.id ? 'selected' : ''}`}
            onClick={() => onThemeSelect(theme.id)}
            style={{
              '--theme-color': theme.color || '#FF6B6B'
            }}
          >
            <div className="theme-icon">{theme.icon}</div>
            <div className="theme-label">{theme.label}</div>
            <div className="theme-desc">{theme.description}</div>
            {theme.keywords && (
              <div className="theme-keywords">
                {theme.keywords.slice(0, 3).map((keyword, idx) => (
                  <span key={idx} className="keyword-tag">#{keyword}</span>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ThemeSelector;
