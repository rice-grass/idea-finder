import React, { useState, useEffect } from 'react';
import { ideasAPI } from '../services/api';
import WizardSteps from '../components/WizardSteps';
import DeveloperTypeSelector from '../components/DeveloperTypeSelector';
import TechStackSelector from '../components/TechStackSelector';
import IdeaCard from '../components/IdeaCard';
import SavedIdeas from '../components/SavedIdeas';
import { getSavedIdeas } from '../utils/savedIdeasStorage';

function Home() {
  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const wizardSteps = ['개발자 유형 선택', '기술 스택 선택', '아이디어 생성'];

  // Form data
  const [developerTypes, setDeveloperTypes] = useState([]);
  const [selectedDevType, setSelectedDevType] = useState('');
  const [availableTechStacks, setAvailableTechStacks] = useState([]);
  const [selectedTechStacks, setSelectedTechStacks] = useState([]);
  const [days, setDays] = useState(7);

  // Results
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [techError, setTechError] = useState('');
  const [ideas, setIdeas] = useState([]);
  const [trends, setTrends] = useState(null);

  // Saved Ideas modal
  const [showSavedIdeas, setShowSavedIdeas] = useState(false);
  const [savedIdeasCount, setSavedIdeasCount] = useState(0);

  // Page transition state
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Load developer types on mount
  useEffect(() => {
    loadDeveloperTypes();
    updateSavedIdeasCount();
  }, []);

  // Update saved ideas count
  const updateSavedIdeasCount = () => {
    const saved = getSavedIdeas();
    setSavedIdeasCount(saved.length);
  };

  // Load tech stacks when developer type changes
  useEffect(() => {
    if (selectedDevType) {
      loadTechStacks(selectedDevType);
    }
  }, [selectedDevType]);

  const loadDeveloperTypes = async () => {
    setLoading(true);
    try {
      console.log('🔄 Loading developer types...');
      const response = await ideasAPI.getDeveloperTypes();
      console.log('✅ Developer types loaded:', response.data.data);
      setDeveloperTypes(response.data.data);
      setError('');
    } catch (err) {
      console.error('❌ Error loading developer types:', err);
      console.error('Error details:', err.response || err.message);
      setError(`개발자 유형을 불러올 수 없습니다. ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadTechStacks = async (devType) => {
    try {
      const response = await ideasAPI.getTechStacks(devType);
      setAvailableTechStacks(response.data.data);
      setSelectedTechStacks([]); // Reset selection
      setTechError('');
    } catch (err) {
      console.error('Error loading tech stacks:', err);
      setError('기술 스택을 불러올 수 없습니다.');
    }
  };

  const handleDevTypeSelect = (type) => {
    setSelectedDevType(type);
    setError('');
  };

  const handleTechStackToggle = (stackId) => {
    setSelectedTechStacks(prev => {
      if (prev.includes(stackId)) {
        return prev.filter(id => id !== stackId);
      } else {
        return [...prev, stackId];
      }
    });
    setError('');
    setTechError('');
  };

  const handleNextStep = () => {
    // Validation
    if (currentStep === 1 && !selectedDevType) {
      setError('개발자 유형을 선택해주세요.');
      return;
    }

    if (currentStep === 2 && selectedTechStacks.length === 0) {
      // Show a local, inline error for tech stack selection rather than the global error banner.
      setTechError('최소 1개 이상의 기술 스택을 선택해주세요.');
      return;
    }

    setError('');

    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleGenerateIdeas();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setError('');
      setTechError('');
    }
  };

  const handleGenerateIdeas = async () => {
    // Start transition animation
    setIsTransitioning(true);
    setLoading(true);
    setError('');

    // Wait for exit animation to complete
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      const response = await ideasAPI.generateIdeas({
        devType: selectedDevType,
        techStacks: selectedTechStacks,
        days
      });

      const data = response.data.data;

      // Handle both array and object responses
      const ideasData = Array.isArray(data.ideas) ? data.ideas :
                       (data.ideas.rawResponse ? [{ rawResponse: data.ideas.rawResponse }] : []);

      setIdeas(ideasData);
      setTrends(data.trends);
      setIsTransitioning(false);

      // 결과 섹션으로 부드럽게 스크롤
      setTimeout(() => {
        const resultsSection = document.querySelector('.results-section');
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err) {
      console.error('Error generating ideas:', err);
      setError(err.response?.data?.error || '아이디어 생성 중 오류가 발생했습니다.');
      setIsTransitioning(false);
    } finally {
      setLoading(false);
    }
  };

  const handleRefineIdea = async (originalIdea, refinementType) => {
    setLoading(true);
    setError('');

    try {
      const response = await ideasAPI.refineIdea(originalIdea, refinementType, {
        devType: selectedDevType,
        techStacks: selectedTechStacks
      });

      const refinedIdeas = response.data.data.ideas;

      // Add refined ideas to the existing list
      setIdeas(prevIdeas => [...prevIdeas, ...refinedIdeas]);

      // Scroll to the new idea
      setTimeout(() => {
        const allCards = document.querySelectorAll('.idea-card');
        if (allCards.length > 0) {
          const lastCard = allCards[allCards.length - 1];
          lastCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } catch (err) {
      console.error('Error refining idea:', err);
      setError(err.response?.data?.error || '아이디어 개선 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setSelectedDevType('');
    setSelectedTechStacks([]);
    setIdeas([]);
    setTrends(null);
    setError('');
    setTechError('');
  };

  // Show loading screen during transition
  if (loading && isTransitioning) {
    return (
      <div className="container">
        <div className="fullscreen-loading">
          <div className="loader"></div>
          <p>아이디어를 생성하고 있습니다...</p>
        </div>
      </div>
    );
  }

  // Show results page independently
  if (ideas.length > 0) {
    return (
      <div className="container">
        <header className="header">
          <div className="header-content">
            <h1>Open Source Project Idea Generator</h1>
            <p>개발자 맞춤형 오픈소스 프로젝트 아이디어를 AI가 찾아드립니다</p>
          </div>
          <button
            className="saved-ideas-button"
            onClick={() => {
              setShowSavedIdeas(true);
              updateSavedIdeasCount();
            }}
          >
            저장된 아이디어 {savedIdeasCount > 0 && `(${savedIdeasCount})`}
          </button>
        </header>

        {showSavedIdeas && (
          <SavedIdeas
            onClose={() => {
              setShowSavedIdeas(false);
              updateSavedIdeasCount();
            }}
          />
        )}

        <div className="results-section">
          {trends && trends.topics && trends.topics.length > 0 && (
            <div className="trends-section">
              <h2>🔥 트렌딩 토픽</h2>
              <div className="topics-grid">
                {trends.topics.slice(0, 8).map(([topic, count]) => (
                  <div key={topic} className="topic-tag">
                    <span className="topic-name">{topic}</span>
                    <span className="topic-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="ideas-header">
            <h2>맞춤형 프로젝트 아이디어</h2>
            <p className="ideas-count">총 {ideas.length}개의 아이디어</p>
          </div>

          <div className="ideas-grid">
            {ideas.map((idea, index) => (
              <IdeaCard
                key={index}
                idea={idea}
                onRefine={handleRefineIdea}
              />
            ))}
          </div>

          <div className="wizard-actions">
            <button onClick={handleReset} className="btn btn-secondary">
              ← 새로운 아이디어 생성
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show wizard/generation page
  return (
    <div className="container">
      <header className="header">
        <div className="header-content">
          <h1>Open Source Project Idea Generator</h1>
          <p>개발자 맞춤형 오픈소스 프로젝트 아이디어를 AI가 찾아드립니다</p>
        </div>
        <button
          className="saved-ideas-button"
          onClick={() => {
            setShowSavedIdeas(true);
            updateSavedIdeasCount();
          }}
        >
          💾 저장된 아이디어 {savedIdeasCount > 0 && `(${savedIdeasCount})`}
        </button>
      </header>

      {showSavedIdeas && (
        <SavedIdeas
          onClose={() => {
            setShowSavedIdeas(false);
            updateSavedIdeasCount();
          }}
        />
      )}

      <WizardSteps currentStep={currentStep} steps={wizardSteps} />

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      <div className={`wizard-content ${isTransitioning ? 'exiting' : ''}`}>
        {/* Step 1: Developer Type Selection */}
        {currentStep === 1 && (
          loading && developerTypes.length === 0 ? (
            <div className="loading-container">
              <div className="loader"></div>
              <p>개발자 유형을 불러오는 중...</p>
            </div>
          ) : error && !loading ? (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={loadDeveloperTypes} className="btn btn-primary">다시 시도</button>
            </div>
          ) : (
            <DeveloperTypeSelector
              selectedType={selectedDevType}
              onTypeSelect={handleDevTypeSelect}
              developerTypes={developerTypes}
            />
          )
        )}

        {/* Step 2: Tech Stack Selection */}
        {currentStep === 2 && (
          <TechStackSelector
            techStacks={availableTechStacks}
            selectedStacks={selectedTechStacks}
            onStackToggle={handleTechStackToggle}
            devType={selectedDevType}
            error={techError}
          />
        )}

        {/* Step 3: Generate Ideas */}
        {currentStep === 3 && (
          <div className="generate-section">
            <h2>아이디어 생성 설정</h2>
            <p className="subtitle">GitHub에서 최근 몇 일의 데이터를 분석할까요?</p>

            <div className="days-selector">
              <label htmlFor="days">분석 기간:</label>
              <select
                id="days"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="days-select"
              >
                <option value={7}>최근 7일</option>
                <option value={14}>최근 14일</option>
                <option value={30}>최근 30일</option>
              </select>
            </div>

            <div className="summary-box">
              <h3>선택 요약</h3>
              <div className="summary-item">
                <span className="label">개발자 유형:</span>
                <span className="value">
                  {developerTypes.find(t => t.id === selectedDevType)?.label}
                </span>
              </div>
              <div className="summary-item">
                <span className="label">기술 스택:</span>
                <span className="value">
                  {selectedTechStacks.map(id =>
                    availableTechStacks.find(s => s.id === id)?.name
                  ).join(', ')}
                </span>
              </div>
              <div className="summary-item">
                <span className="label">분석 기간:</span>
                <span className="value">최근 {days}일</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="wizard-actions">
        {currentStep > 1 && !loading && ideas.length === 0 && (
          <button onClick={handlePrevStep} className="btn btn-secondary">
            이전
          </button>
        )}

        {currentStep < 3 && (
          <button onClick={handleNextStep} className="btn btn-primary">
            다음
          </button>
        )}

        {currentStep === 3 && ideas.length === 0 && (
          <button
            onClick={handleGenerateIdeas}
            disabled={loading}
            className="btn btn-primary btn-generate"
          >
            {loading ? '생성 중...' : '아이디어 생성하기'}
          </button>
        )}

        {ideas.length > 0 && (
          <button onClick={handleReset} className="btn btn-secondary">
            다시 시작
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="loader"></div>
          <p>AI가 당신을 위한 프로젝트 아이디어를 생성하고 있습니다...</p>
        </div>
      )}

    </div>
  );
}

export default Home;
