import { useLocation, useNavigate } from 'react-router-dom';
import './OasisMatching.css';
import runwaveLogo from '../../image/image.png';
import image212 from '../../image/image-212.png';
import imageA from '../../image/a.png';
import imageB from '../../image/b.png';

const formatTime = (ms) => {
  const totalSec = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
  const s = String(totalSec % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const SolarAIResult = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    generatedContent = {},
    distanceKm = 0,
    durationMs = 0,
    courseName = '',
    photoPreview = null
  } = location.state || {};

  const {
    title = '',
    content = '',
    hashtags = []
  } = generatedContent;

  return (
    <div className="course-result-container oasis-matching-page">
      {/* 헤더 */}
      <div className="header-section">
        <img className="runwave-logo" alt="Runwave" src={runwaveLogo} />
        <img className="profile-icon" alt="Profile" src={image212} />
      </div>

      <div className="divider" />

      {/* 제목 영역 */}
      <div className="page-title">
        <div className="step-label">✨ Solar AI 생성 완료</div>
      </div>

      <p className="oasis-subtitle">
        AI가 <span className="highlight-count">당신의 러닝 스토리</span>를 만들었어요!
      </p>

      {/* 러닝 정보 */}
      <div className="run-result-section">
        <h3 className="category-title">📝 러닝 정보</h3>
        <div className="run-result-card">
          <div className="result-row">
            <span>총 거리:</span>
            <strong>{distanceKm.toFixed(1)}km</strong>
          </div>
          <div className="result-row">
            <span>총 시간:</span>
            <strong>{formatTime(durationMs)}</strong>
          </div>
          <div className="result-row">
            <span>코스:</span>
            <strong>{courseName}</strong>
          </div>
        </div>
      </div>

      {/* 업로드한 사진 */}
      {photoPreview && (
        <div className="run-result-section">
          <h3 className="category-title">📷 오늘의 인증샷</h3>
          <div className="solar-photo-container">
            <img
              src={photoPreview}
              alt="러닝 인증샷"
              className="solar-result-photo"
            />
          </div>
        </div>
      )}

      {/* Solar AI 생성 콘텐츠 */}
      <div className="run-result-section">
        <h3 className="category-title">✨ AI 생성 콘텐츠</h3>

        {title && (
          <div className="solar-content-card">
            <h2 className="solar-title">{title}</h2>
          </div>
        )}

        {content && (
          <div className="solar-content-card">
            <p className="solar-content">{content}</p>
          </div>
        )}

        {hashtags && hashtags.length > 0 && (
          <div className="solar-content-card">
            <div className="solar-hashtags">
              {hashtags.map((tag, idx) => (
                <span key={idx} className="solar-hashtag">#{tag}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 액션 버튼들 */}
      <div className="solar-action-buttons">
        <button
          className="start-running-button"
          onClick={() => {
            // Copy to clipboard
            const textToCopy = `${title}\n\n${content}\n\n${hashtags.map(tag => `#${tag}`).join(' ')}`;
            navigator.clipboard.writeText(textToCopy);
            alert('클립보드에 복사되었습니다!');
          }}
        >
          📋 복사하기
        </button>
        <button
          className="start-running-button"
          style={{ marginTop: '10px', backgroundColor: '#667eea' }}
          onClick={() => navigate('/course-result')}
        >
          🏃 새 러닝 시작하기
        </button>
      </div>

      {/* 하단 네비게이션 */}
      <div className="bottom-nav">
        <div className="nav-tabs">
          <div className="nav-tab" onClick={() => navigate('/course-result')}>
            <img src={image212} alt="Run" className="nav-icon" />
            <div className="nav-label">RUN</div>
          </div>
          <div className="nav-tab">
            <img src={imageA} alt="Oasis" className="nav-icon" />
            <div className="nav-label">OASIS</div>
          </div>
          <div className="nav-tab active">
            <img src={imageB} alt="Log" className="nav-icon" />
            <div className="nav-label">LOG</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolarAIResult;
