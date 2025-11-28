import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './OasisMatching.css';
import runwaveLogo from '../../image/image.png';
import image212 from '../../image/image-212.png';
import imageA from '../../image/a.png';
import imageB from '../../image/b.png';

const keywordOptions = [
  '힐링',
  '상쾌함',
  '해운대해변',
  '자유로움',
  '러닝 후 맥주 한 잔',
  '인증샷',
  '일몰뷰',
];

const formatTime = (ms) => {
  const totalSec = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
  const s = String(totalSec % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const OasisRunResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const distanceKm = location.state?.distanceKm ?? 3.4;
  const durationMs = location.state?.durationMs ?? 1360000;
  const courseName = location.state?.courseName || '해운대 해변 런싱';

  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [memo, setMemo] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);

  const handleToggleKeyword = (word) => {
    setSelectedKeywords((prev) =>
      prev.includes(word)
        ? prev.filter((w) => w !== word)
        : [...prev, word]
    );
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateClick = () => {
    console.log('생성 요청', {
      distanceKm,
      durationMs,
      courseName,
      selectedKeywords,
      memo,
    });
    alert('Solar AI 연동 예정입니다 🙂');
  };

  return (
    <div className="course-result-container oasis-matching-page">
      <div className="header-section">
        <img className="runwave-logo" alt="Runwave" src={runwaveLogo} />
        <img className="profile-icon" alt="Profile" src={image212} />
      </div>

      <div className="divider" />

      <div className="page-title">
        <div className="step-label">오늘의 러닝을 AI가 기록해 드려요</div>
      </div>

      <p className="oasis-subtitle">
        🎉 <span className="highlight-count">러닝 완료!</span> 수고하셨습니다.
      </p>

      <div className="run-result-section">
        <h3 className="category-title">📝 오늘의 기록</h3>
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

      <div className="run-result-section">
        <h3 className="category-title">📷 오늘의 인증샷 업로드</h3>
        <label className="photo-upload-box">
          {photoPreview ? (
            <img
              src={photoPreview}
              alt="인증샷"
              className="photo-preview"
            />
          ) : (
            <div className="photo-placeholder">
              <span className="upload-icon">＋</span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handlePhotoChange}
          />
        </label>
        <p className="upload-help">▲오늘의 러닝 인증샷을 업로드 하세요</p>
      </div>

      <div className="run-result-section">
        <h3 className="category-title">📍 키워드 선택</h3>
        <div className="keyword-list">
          {keywordOptions.map((word) => (
            <button
              key={word}
              type="button"
              className={`keyword-pill ${selectedKeywords.includes(word) ? 'selected' : ''}`}
              onClick={() => handleToggleKeyword(word)}
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      <div className="run-result-section">
        <input
          className="memo-input"
          placeholder="자유 메모 (러닝에 대한 감정 메모 등)"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </div>

      <button className="start-running-button" onClick={handleGenerateClick}>
        ✨ Solar AI로 글 생성하기
      </button>

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

export default OasisRunResult;
