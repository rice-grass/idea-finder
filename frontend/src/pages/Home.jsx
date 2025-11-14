import React, { useState, useEffect } from 'react';
import { ideasAPI } from '../services/api';
import WizardSteps from '../components/WizardSteps';
import StudentLevelSelector from '../components/StudentLevelSelector';
import DeveloperTypeSelector from '../components/DeveloperTypeSelector';
import TechStackSelector from '../components/TechStackSelector';
import IdeaCard from '../components/IdeaCard';
import SavedIdeas from '../components/SavedIdeas';
import { getSavedIdeas } from '../utils/savedIdeasStorage';

function Home() {
  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const wizardSteps = ['학생 신분 선택', '개발자 유형 선택', '기술 스택 선택', '아이디어 생성'];

  // Form data
  const [studentLevels, setStudentLevels] = useState([]);
  const [selectedStudentLevel, setSelectedStudentLevel] = useState('');
  const [developerTypes, setDeveloperTypes] = useState([]);
  const [selectedDevType, setSelectedDevType] = useState('');
  const [availableTechStacks, setAvailableTechStacks] = useState([]);
  const [selectedTechStacks, setSelectedTechStacks] = useState([]);
  const [customTechStacks, setCustomTechStacks] = useState([]);
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

  // Load student levels and developer types on mount
  useEffect(() => {
    loadStudentLevels();
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

  const loadStudentLevels = async () => {
    try {
      console.log('🔄 Loading student levels...');
      const response = await ideasAPI.getStudentLevels();
      console.log('✅ Student levels loaded:', response.data.data);
      setStudentLevels(response.data.data);
      setError('');
    } catch (err) {
      console.error('❌ Error loading student levels:', err);
      setError(`학생 레벨을 불러올 수 없습니다. ${err.message}`);
    }
  };

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
      setCustomTechStacks([]); // Reset custom stacks
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

  const handleCustomStacksChange = (customStacks) => {
    setCustomTechStacks(customStacks);
  };

  const handleNextStep = () => {
    // Step 1: 학생 신분 선택
    if (currentStep === 1 && !selectedStudentLevel) {
      setError('학생 신분을 선택해주세요.');
      return;
    }

    // Step 2: 개발자 유형 선택
    if (currentStep === 2 && !selectedDevType) {
      setError('개발자 유형을 선택해주세요.');
      return;
    }

    // Step 3: 기술 스택 선택
    if (currentStep === 3 && selectedTechStacks.length === 0) {
      setTechError('최소 1개 이상의 기술 스택을 선택해주세요.');
      return;
    }

    setError('');

    if (currentStep < 4) {
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
      // Build tech stacks array including custom stack names
      const allTechStacks = selectedTechStacks.map(id => {
        const standardStack = availableTechStacks.find(s => s.id === id);
        if (standardStack) return id;
        const customStack = customTechStacks.find(s => s.id === id);
        return customStack ? customStack.name : id;
      });

      const response = await ideasAPI.generateIdeas({
        devType: selectedDevType,
        techStacks: allTechStacks,
        days,
        studentLevel: selectedStudentLevel
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
        techStacks: selectedTechStacks,
        studentLevel: selectedStudentLevel
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
    setSelectedStudentLevel('');
    setSelectedDevType('');
    setSelectedTechStacks([]);
    setCustomTechStacks([]);
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
            <img
              src="/pigeon-logo.png"
              alt="Pigeon"
              className="logo logo-clickable"
              onClick={handleReset}
              style={{ cursor: 'pointer' }}
            />
          </div>
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
              <h2>트렌딩 토픽</h2>
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

          {/* Filter Section */}
          <div className="filter-section">
            <div className="filter-row-top">
              <div className="filter-group">
                <label className="filter-label">개발자 유형</label>
                <select
                  value={selectedDevType}
                  onChange={(e) => setSelectedDevType(e.target.value)}
                  className="filter-select"
                >
                  {developerTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group filter-group-period">
                <label className="filter-label">분석 기간</label>
                <select
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="filter-select"
                >
                  <option value={7}>최근 7일</option>
                  <option value={14}>최근 14일</option>
                  <option value={30}>최근 30일</option>
                </select>
              </div>
            </div>

            <div className="filter-row-middle">
              <div className="filter-group filter-group-full">
                <label className="filter-label">기술 스택</label>
                <div className="tech-stack-chips">
                  {availableTechStacks.map(stack => (
                    <button
                      key={stack.id}
                      onClick={() => handleTechStackToggle(stack.id)}
                      className={`tech-chip ${selectedTechStacks.includes(stack.id) ? 'selected' : ''}`}
                    >
                      {stack.name}
                    </button>
                  ))}
                  {customTechStacks.map(stack => (
                    <button
                      key={stack.id}
                      onClick={() => handleTechStackToggle(stack.id)}
                      className={`tech-chip ${selectedTechStacks.includes(stack.id) ? 'selected' : ''}`}
                    >
                      {stack.name}
                    </button>
                  ))}
                  <button
                    className="tech-chip tech-chip-add"
                    onClick={() => {
                      const input = document.getElementById('filter-custom-stack-input');
                      if (input) {
                        input.style.display = input.style.display === 'none' ? 'inline-block' : 'none';
                        if (input.style.display !== 'none') input.focus();
                      }
                    }}
                  >
                    + 기타
                  </button>
                  <input
                    id="filter-custom-stack-input"
                    type="text"
                    placeholder="기술 스택 입력 후 Enter"
                    className="filter-custom-stack-input"
                    style={{ display: 'none' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        const customId = `custom-${Date.now()}`;
                        const newStack = { id: customId, name: e.target.value.trim() };
                        const updatedCustomStacks = [...customTechStacks, newStack];
                        setCustomTechStacks(updatedCustomStacks);
                        handleTechStackToggle(customId);
                        e.target.value = '';
                        e.target.style.display = 'none';
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="filter-row-bottom">
              <button
                onClick={handleGenerateIdeas}
                disabled={loading || selectedTechStacks.length === 0}
                className="filter-generate-btn"
              >
                {loading ? '생성 중...' : '아이디어 다시 생성'}
              </button>
            </div>
          </div>

          {/* Saved Ideas Button - Independent */}
          <div className="saved-ideas-section">
            <button
              className="saved-ideas-btn"
              onClick={() => {
                setShowSavedIdeas(true);
                updateSavedIdeasCount();
              }}
            >
              <div className="saved-ideas-header-info">
                <span className="saved-ideas-title">저장된 아이디어</span>
                {savedIdeasCount > 0 && <span className="saved-ideas-count">{savedIdeasCount}개</span>}
              </div>
              {savedIdeasCount > 0 && (
                <div className="saved-ideas-list-preview">
                  {getSavedIdeas().slice(0, 3).map((idea, index) => {
                    const title = idea['Project Name'] || idea.title || '제목 없음';
                    const devTypeLabel = developerTypes.find(t => t.id === selectedDevType)?.label || '';

                    return (
                      <div key={index} className="saved-idea-preview-item">
                        <span className="preview-bullet">•</span>
                        <span className="preview-idea-title">{title}</span>
                      </div>
                    );
                  })}
                  {savedIdeasCount > 3 && (
                    <div className="saved-idea-preview-more">
                      외 {savedIdeasCount - 3}개
                    </div>
                  )}
                </div>
              )}
            </button>
          </div>

          <div className="ideas-grid">
            {ideas.map((idea, index) => (
              <IdeaCard
                key={index}
                idea={idea}
                onRefine={handleRefineIdea}
                onSaveChange={updateSavedIdeasCount}
                metadata={{
                  studentLevel: selectedStudentLevel,
                  studentLevelLabel: studentLevels.find(l => l.id === selectedStudentLevel)?.label || '',
                  devType: selectedDevType,
                  devTypeLabel: developerTypes.find(t => t.id === selectedDevType)?.label || '',
                  days: days,
                  techStacks: selectedTechStacks.map(id => {
                    const standardStack = availableTechStacks.find(s => s.id === id);
                    if (standardStack) return standardStack.name;
                    const customStack = customTechStacks.find(s => s.id === id);
                    return customStack ? customStack.name : '';
                  }).filter(name => name)
                }}
              />
            ))}
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
          <img
            src="/pigeon-logo.png"
            alt="Pigeon"
            className="logo logo-clickable"
            onClick={handleReset}
            style={{ cursor: 'pointer' }}
          />
        </div>
      </header>

      <WizardSteps currentStep={currentStep} steps={wizardSteps} />

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      <div className={`wizard-content ${isTransitioning ? 'exiting' : ''}`}>
        {/* Step 1: Student Level Selection */}
        {currentStep === 1 && (
          loading && studentLevels.length === 0 ? (
            <div className="loading-container">
              <div className="loader"></div>
              <p>학생 신분 옵션을 불러오는 중...</p>
            </div>
          ) : error && !loading ? (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={loadStudentLevels} className="btn btn-primary">다시 시도</button>
            </div>
          ) : (
            <StudentLevelSelector
              selectedLevel={selectedStudentLevel}
              onLevelSelect={setSelectedStudentLevel}
              studentLevels={studentLevels}
            />
          )
        )}

        {/* Step 2: Developer Type Selection */}
        {currentStep === 2 && (
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

        {/* Step 3: Tech Stack Selection */}
        {currentStep === 3 && (
          <TechStackSelector
            techStacks={availableTechStacks}
            selectedStacks={selectedTechStacks}
            onStackToggle={handleTechStackToggle}
            devType={selectedDevType}
            error={techError}
            onCustomStacksChange={handleCustomStacksChange}
          />
        )}

        {/* Step 4: Generate Ideas */}
        {currentStep === 4 && (
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
                <span className="label">학생 신분:</span>
                <span className="value">
                  {studentLevels.find(l => l.id === selectedStudentLevel)?.label}
                </span>
              </div>
              <div className="summary-item">
                <span className="label">개발자 유형:</span>
                <span className="value">
                  {developerTypes.find(t => t.id === selectedDevType)?.label}
                </span>
              </div>
              <div className="summary-item">
                <span className="label">기술 스택:</span>
                <span className="value">
                  {selectedTechStacks.map(id => {
                    const standardStack = availableTechStacks.find(s => s.id === id);
                    if (standardStack) return standardStack.name;
                    const customStack = customTechStacks.find(s => s.id === id);
                    return customStack ? customStack.name : '';
                  }).filter(name => name).join(', ')}
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

        {currentStep < 4 && (
          <button onClick={handleNextStep} className="btn btn-primary">
            다음
          </button>
        )}

        {currentStep === 4 && ideas.length === 0 && (
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
