import React from 'react';
import './TechStackSelector.css';

const TechStackSelector = ({ techStacks, selectedStacks, onStackToggle, devType, error, onCustomStacksChange }) => {
  const [showOtherInput, setShowOtherInput] = React.useState(false);
  const [otherValue, setOtherValue] = React.useState('');
  const [customStacks, setCustomStacks] = React.useState([]);

  const devTypeLabels = {
    frontend: '프론트엔드',
    backend: '백엔드',
    fullstack: '풀스택',
    other: '기타'
  };

  const handleOtherClick = () => {
    setShowOtherInput(true);
  };

  const handleOtherInputChange = (e) => {
    setOtherValue(e.target.value);
  };

  const handleOtherInputKeyDown = (e) => {
    if (e.key === 'Enter' && otherValue.trim()) {
      const customId = `custom-${Date.now()}`;
      const newStack = { id: customId, name: otherValue.trim() };
      const updatedCustomStacks = [...customStacks, newStack];
      setCustomStacks(updatedCustomStacks);
      onStackToggle(customId);
      setOtherValue('');

      // Notify parent component of custom stacks change
      if (onCustomStacksChange) {
        onCustomStacksChange(updatedCustomStacks);
      }
    }
  };

  return (
    <div className="tech-stack-selector">
      <h2>{devTypeLabels[devType]} 개발자님,</h2>
      <p className="subtitle">어떤 기술 스택을 사용하시나요? (복수 선택 가능)</p>

      <div className="stack-grid">
        {techStacks.map((stack) => (
          <div
            key={stack.id}
            className={`stack-card ${selectedStacks.includes(stack.id) ? 'selected' : ''}`}
            onClick={() => onStackToggle(stack.id)}
          >
            <h3>{stack.name}</h3>
            {selectedStacks.includes(stack.id) && <div className="check-mark">✓</div>}
          </div>
        ))}

        {customStacks.map((stack) => (
          <div
            key={stack.id}
            className={`stack-card ${selectedStacks.includes(stack.id) ? 'selected' : ''}`}
            onClick={() => onStackToggle(stack.id)}
          >
            <h3>{stack.name}</h3>
            {selectedStacks.includes(stack.id) && <div className="check-mark">✓</div>}
          </div>
        ))}

        <div
          className="stack-card"
          onClick={handleOtherClick}
        >
          <h3>기타</h3>
        </div>
      </div>

      {showOtherInput && (
        <div className="other-input-container">
          <input
            type="text"
            value={otherValue}
            onChange={handleOtherInputChange}
            onKeyDown={handleOtherInputKeyDown}
            placeholder="기술 스택을 입력하고 Enter를 누르세요 (예: Docker, Kubernetes 등)"
            className="other-input"
            autoFocus
          />
        </div>
      )}

      {selectedStacks.length > 0 && (
        <div className="selection-summary">
          <p>선택된 스택: <strong>{selectedStacks.length}개</strong></p>
        </div>
      )}

      {/* Only show a warning if a parent explicitly passes an error (e.g., after attempting to proceed) */}
      {error && (
        <div className="selection-warning">
          {error}
        </div>
      )}
    </div>
  );
};

export default TechStackSelector;
