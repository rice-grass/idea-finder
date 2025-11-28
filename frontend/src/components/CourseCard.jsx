import React, { useState } from 'react';
import KakaoMapDisplay from './KakaoMapDisplay';
import './CourseCard.css';

function CourseCard({ course, onSave, currentLocation }) {
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    if (onSave && !isSaved) {
      onSave(course);
      setIsSaved(true);
    }
  };

  if (!course) {
    return (
      <div className="course-card-empty">
        <p>코스 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const {
    name,
    description,
    distance,
    difficulty,
    duration,
    route,
    highlights = [],
    oasis = [],
    theme,
    district
  } = course;

  return (
    <div className="course-card">
      <div className="course-header">
        <h2 className="course-name">{name || '러닝 코스'}</h2>
        <button
          className={`save-button ${isSaved ? 'saved' : ''}`}
          onClick={handleSave}
          disabled={isSaved}
        >
          {isSaved ? '✓ 저장됨' : '💾 저장'}
        </button>
      </div>

      <div className="course-map">
        <KakaoMapDisplay
          route={route}
          oasisLocations={oasis}
          height="400px"
          center={currentLocation || (route?.center)}
        />
      </div>

      <div className="course-info">
        <div className="info-badges">
          <span className="badge badge-distance">📏 {distance}</span>
          <span className={`badge badge-difficulty badge-${difficulty}`}>
            {difficulty === 'beginner' && '⭐ 초급'}
            {difficulty === 'intermediate' && '⭐⭐ 중급'}
            {difficulty === 'advanced' && '⭐⭐⭐ 고급'}
          </span>
          <span className="badge badge-duration">⏱️ {duration || '약 30분'}</span>
        </div>

        <div className="course-description">
          <h3>코스 설명</h3>
          <p>{description || '아름다운 러닝 코스입니다.'}</p>
        </div>

        {highlights && highlights.length > 0 && (
          <div className="course-highlights">
            <h3>🌟 코스 하이라이트</h3>
            <ul>
              {highlights.map((highlight, index) => (
                <li key={index}>{highlight}</li>
              ))}
            </ul>
          </div>
        )}

        {oasis && oasis.length > 0 && (
          <div className="course-oasis">
            <h3>🏪 오아시스 정보</h3>
            <div className="oasis-list">
              {oasis.slice(0, 5).map((spot, index) => (
                <div key={index} className="oasis-item">
                  <div className="oasis-icon">🏪</div>
                  <div className="oasis-info">
                    <div className="oasis-name">{spot.name || '오아시스'}</div>
                    <div className="oasis-meta">
                      <span>{spot.type || '편의점'}</span>
                      {spot.distance && <span> • {spot.distance}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {oasis.length > 5 && (
              <p className="oasis-more">외 {oasis.length - 5}개 더보기</p>
            )}
          </div>
        )}

        <div className="course-metadata">
          {theme && <span className="meta-tag">테마: {theme}</span>}
          {district && <span className="meta-tag">지역: {district}</span>}
        </div>
      </div>
    </div>
  );
}

export default CourseCard;
