import React, { useState } from 'react';
import './DistanceDifficulty.css';
import runwaveLogo from "../../image/image.png";
import image212 from "../../image/image-212.png";
import imageA from "../../image/a.png";
import imageB from "../../image/b.png";

export const DistanceDifficulty = () => {
  const [distance, setDistance] = useState(5.0);

  const handleDistanceChange = (e) => {
    setDistance(parseFloat(e.target.value));
  };

  const handleNext = () => {
    localStorage.setItem('selectedDistance', distance.toString());
    localStorage.setItem('selectedDifficulty', 'intermediate'); // 기본값: 중급
    console.log('✅ 거리:', distance, 'km');
    console.log('✅ 난이도: intermediate (자동 설정)');
    // 로딩 페이지로 이동
    window.location.href = '/course-loading';
  };

  return (
    <div className="distance-difficulty-container">
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
        <div className="progress-step active"></div>
        <div className="progress-step"></div>
      </div>

      {/* 제목 */}
      <div className="page-title">
        <div className="step-label">Step2</div>
        <div className="step-description">거리 선택</div>
      </div>

      {/* 거리 슬라이더 */}
      <div className="distance-section" style={{ marginTop: '60px', marginBottom: '60px' }}>
        <div className="distance-display">
          <span className="distance-value">{distance.toFixed(1)}</span>
          <span className="distance-unit">Km</span>
        </div>
        <div className="slider-wrapper">
          <div
            className="slider-fill"
            style={{ width: `${((distance - 1) / 9) * 100}%` }}
          ></div>
          <input
            type="range"
            min="1.0"
            max="10.0"
            step="0.1"
            value={distance}
            onChange={handleDistanceChange}
            className="distance-slider"
          />
        </div>
        <div className="distance-marks">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(mark => (
            <span key={mark} className="distance-mark">|</span>
          ))}
        </div>
      </div>

      {/* Next 버튼 */}
      <button
        className="next-button"
        onClick={handleNext}
      >
        결과확인
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

export default DistanceDifficulty;
