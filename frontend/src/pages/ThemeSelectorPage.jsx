import React, { useState } from 'react';
import './ThemeSelectorPage.css';
import runwaveLogo from "../../image/image.png";
import image212 from "../../image/image-212.png";
import imageA from "../../image/a.png";
import imageB from "../../image/b.png";
import theme1 from "../../image/1.webp";
import theme2 from "../../image/2.webp";
import theme3 from "../../image/3.jpg";
import theme4 from "../../image/4.webp";

export const ThemeSelectorPage = () => {
  const [selectedTheme, setSelectedTheme] = useState(null);

  const themes = [
    { id: 1, name: 'urban-healing', title: '도심 속\n힐링런', emoji: '🏙️', image: theme1 },
    { id: 2, name: 'night-view', title: '활홀한\n야경런', emoji: '✨', image: theme2 },
    { id: 3, name: 'view-food', title: '인생샷\n포토런', emoji: '📸', image: theme3 },
    { id: 4, name: 'beach', title: '뷰 맛집\n해변런', emoji: '🌊', image: theme4 }
  ];

  const handleThemeSelect = (themeId) => {
    setSelectedTheme(themeId);
  };

  const handleNext = () => {
    if (selectedTheme) {
      const theme = themes.find(t => t.id === selectedTheme);
      localStorage.setItem('selectedTheme', theme.name);
      console.log('✅ 선택된 테마:', theme.name);
      // Distance & Difficulty 페이지로 이동
      window.location.href = '/distance-difficulty';
    } else {
      alert('테마를 먼저 선택해주세요.');
    }
  };

  return (
    <div className="theme-page-container">
      {/* 헤더 영역 */}
      <div className="header-section">
        <img className="runwave-logo" alt="Runwave" src={runwaveLogo} />
        <img className="profile-icon" alt="Profile" src={image212} />
      </div>

      {/* 구분선 */}
      <div className="divider" />

      {/* 진행 바 */}
      <div className="progress-bar">
        <div className="progress-step active"></div>
        <div className="progress-step active"></div>
        <div className="progress-step"></div>
        <div className="progress-step"></div>
      </div>

      {/* 제목 */}
      <div className="page-title">
        <div className="step-label">Step1</div>
        <div className="step-description">Location</div>
      </div>

      {/* 테마 그리드 */}
      <div className="theme-grid">
        {themes.map((theme) => (
          <div
            key={theme.id}
            className={'theme-card ' + (selectedTheme === theme.id ? 'selected' : '')}
            onClick={() => handleThemeSelect(theme.id)}
          >
            <img src={theme.image} alt={theme.title} className="theme-bg-image" />
            <div className={'theme-overlay ' + (selectedTheme === theme.id ? '' : 'dimmed')}></div>
            <div className="theme-content">
              <div className="theme-text">
                <span className="theme-emoji">{theme.emoji}</span>
                <br />
                {theme.title.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < theme.title.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Next 버튼 */}
      <button
        className="next-button"
        onClick={handleNext}
        disabled={!selectedTheme}
      >
        Next
      </button>

      {/* 하단 네비게이션 */}
      <div className="bottom-nav">
        <div className="nav-tabs">
          <div className="nav-tab active">
            <img src={image212} alt="Run" className="nav-icon" />
            <div className="nav-label">RUN</div>
          </div>
          <div className="nav-tab">
            <img src={imageA} alt="Oasis" className="nav-icon" />
            <div className="nav-label">OASIS</div>
          </div>
          <div className="nav-tab">
            <img src={imageB} alt="Log" className="nav-icon" />
            <div className="nav-label">OASIS</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSelectorPage;
