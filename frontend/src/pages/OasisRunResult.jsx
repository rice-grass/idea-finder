import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { runningAPI } from '../services/api';
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
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [photoAnalysis, setPhotoAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleToggleKeyword = (word) => {
    setSelectedKeywords((prev) =>
      prev.includes(word)
        ? prev.filter((w) => w !== word)
        : [...prev, word]
    );
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Store file and analyze with OpenAI Vision
    setUploadedPhoto(file);
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await runningAPI.analyzePhoto(formData);
      if (response.data && response.data.success) {
        setPhotoAnalysis(response.data.data);
        console.log('✅ Photo analysis:', response.data.data);
      }
    } catch (error) {
      console.error('❌ Photo analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateClick = async () => {
    if (!uploadedPhoto) {
      alert('인증샷을 먼저 업로드해주세요!');
      return;
    }

    setIsGenerating(true);

    try {
      const formData = new FormData();
      formData.append('photo', uploadedPhoto);
      formData.append('keywords', selectedKeywords.join(', ') + (memo ? ', ' + memo : ''));

      const runData = {
        distance: distanceKm,
        duration: formatTime(durationMs),
        courseName: courseName
      };
      formData.append('runData', JSON.stringify(runData));

      console.log('🚀 Solar AI 생성 요청:', {
        distance: distanceKm,
        duration: durationMs,
        courseName,
        keywords: selectedKeywords.join(', '),
        memo,
        hasPhoto: !!uploadedPhoto,
        hasAnalysis: !!photoAnalysis
      });

      const response = await runningAPI.generateReelsScript(formData);
      console.log('✅ Solar AI 응답:', response.data);

      if (response.data && response.data.success) {
        // Navigate to Solar AI result page with generated content
        navigate('/solar-ai-result', {
          state: {
            generatedContent: response.data.data,
            distanceKm,
            durationMs,
            courseName,
            photoPreview
          }
        });
      } else {
        alert('콘텐츠 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('❌ Solar AI generation error:', error);
      alert('콘텐츠 생성 중 오류가 발생했습니다: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="course-result-container oasis-matching-page">
      {/* 로딩 오버레이 */}
      {isGenerating && (
        <div className="loading-overlay">
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">✨ Solar AI가 콘텐츠를 생성하고 있습니다...</p>
            <p className="loading-subtext">잠시만 기다려주세요</p>
          </div>
        </div>
      )}

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
        <p className="upload-help">
          ▲오늘의 러닝 인증샷을 업로드 하세요
          {isAnalyzing && ' (AI 분석 중...)'}
        </p>
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
