import { useState, useEffect } from 'react';
import IdeaCard from './IdeaCard';
import IdeaChatbot from './IdeaChatbot';
import { getSavedIdeas, removeSavedIdea, exportSavedIdeas } from '../utils/savedIdeasStorage';
import './SavedIdeas.css';

const SavedIdeas = ({ onClose }) => {
  const [savedIdeas, setSavedIdeas] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showChatbot, setShowChatbot] = useState(false);

  useEffect(() => {
    loadSavedIdeas();
  }, []);

  const loadSavedIdeas = () => {
    const ideas = getSavedIdeas();
    setSavedIdeas(ideas);
  };

  const handleToggleSelect = (savedId) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(savedId)) {
        newSet.delete(savedId);
      } else {
        newSet.add(savedId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === savedIdeas.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(savedIdeas.map(idea => idea.savedId)));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) {
      alert('삭제할 아이디어를 선택해주세요.');
      return;
    }

    if (window.confirm(`선택한 ${selectedIds.size}개의 아이디어를 삭제하시겠습니까?`)) {
      selectedIds.forEach(savedId => {
        removeSavedIdea(savedId);
      });
      setSelectedIds(new Set());
      loadSavedIdeas();
    }
  };

  const handleOpenChatbot = () => {
    if (selectedIds.size === 0) {
      alert('아이디어를 선택해주세요.');
      return;
    }
    setShowChatbot(true);
  };

  const getSelectedIdeas = () => {
    return savedIdeas.filter(idea => selectedIds.has(idea.savedId));
  };

  // Refresh when an idea is unsaved
  const handleIdeaChange = () => {
    loadSavedIdeas();
  };

  return (
    <div className="saved-ideas-overlay" onClick={onClose}>
      <div className="saved-ideas-modal" onClick={(e) => e.stopPropagation()}>
        <div className="saved-ideas-header">
          <h2>저장된 아이디어 ({savedIdeas.length})</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        {savedIdeas.length > 0 && (
          <>
            <div className="saved-ideas-selection">
              <label className="select-all-checkbox">
                <input
                  type="checkbox"
                  checked={selectedIds.size === savedIdeas.length && savedIdeas.length > 0}
                  onChange={handleSelectAll}
                />
                <span>전체 선택 ({selectedIds.size}/{savedIdeas.length})</span>
              </label>
            </div>

            {selectedIds.size > 0 && (
              <div className="selection-summary-box">
                <h3>선택한 아이디어 ({selectedIds.size}개)</h3>
                <div className="selected-ideas-preview">
                  {getSelectedIdeas().map((idea, index) => {
                    const title = idea['Project Name'] || idea.title || '제목 없음';
                    const description = idea['Description'] || idea.description || '';
                    return (
                      <div key={idea.savedId} className="preview-item">
                        <span className="preview-number">{index + 1}.</span>
                        <div className="preview-content">
                          <p className="preview-title">{title}</p>
                          {description && (
                            <p className="preview-description">
                              {description.length > 80
                                ? `${description.substring(0, 80)}...`
                                : description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="saved-ideas-actions">
              <button
                className="chat-button"
                onClick={handleOpenChatbot}
                disabled={selectedIds.size === 0}
              >
                아이디어 컨설팅 시작
              </button>
              <button
                className="clear-button"
                onClick={handleDeleteSelected}
                disabled={selectedIds.size === 0}
              >
                선택 삭제
              </button>
            </div>
          </>
        )}

        <div className="saved-ideas-content">
          {savedIdeas.length === 0 ? (
            <div className="empty-state">
              <p>💡 아직 저장된 아이디어가 없습니다.</p>
              <p>아이디어 카드의 ☆ 버튼을 클릭하여 저장하세요!</p>
            </div>
          ) : (
            <div className="saved-ideas-grid">
              {savedIdeas.map((idea) => (
                <div
                  key={idea.savedId}
                  className={`saved-idea-container ${selectedIds.has(idea.savedId) ? 'selected' : ''}`}
                  onClick={() => handleToggleSelect(idea.savedId)}
                  onContextMenu={handleIdeaChange}
                >
                  {idea.metadata && (
                    <div className="saved-idea-header">
                      {idea.metadata.devTypeLabel && (
                        <span className="metadata-text">{idea.metadata.devTypeLabel}</span>
                      )}
                      {idea.metadata.days && (
                        <>
                          {idea.metadata.devTypeLabel && <span className="metadata-dot">•</span>}
                          <span className="metadata-text">최근 {idea.metadata.days}일</span>
                        </>
                      )}
                      {idea.metadata.techStacks && idea.metadata.techStacks.length > 0 && (
                        <>
                          {(idea.metadata.devTypeLabel || idea.metadata.days) && <span className="metadata-dot">•</span>}
                          <span className="metadata-text">
                            {idea.metadata.techStacks.slice(0, 2).join(', ')}
                            {idea.metadata.techStacks.length > 2 && ` 외 ${idea.metadata.techStacks.length - 2}개`}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                  <div className="saved-idea-card">
                    <IdeaCard idea={idea} />
                  </div>
                  {selectedIds.has(idea.savedId) && (
                    <div className="selection-indicator">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" fill="currentColor"/>
                        <path d="M7 12L10.5 15.5L17 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {showChatbot && (
          <IdeaChatbot
            ideas={getSelectedIdeas()}
            onClose={() => setShowChatbot(false)}
          />
        )}
      </div>
    </div>
  );
};

export default SavedIdeas;
