import { useState, useRef, useEffect } from 'react';
import { ideasAPI } from '../services/api';
import ReactMarkdown from 'react-markdown';
import './IdeaChatbot.css';

const IdeaChatbot = ({ ideas, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(true);
  const [currentStep, setCurrentStep] = useState('start');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message
    const ideasSummary = ideas.map((idea, index) =>
      `${index + 1}. ${idea['Project Name'] || '제목 없음'}`
    ).join('\n');

    setMessages([{
      role: 'assistant',
      content: `선택하신 ${ideas.length}개의 프로젝트 아이디어에 대한 컨설팅을 시작합니다.\n\n**선택된 프로젝트:**\n${ideasSummary}\n\n어떤 방향으로 도와드릴까요?`,
      options: [
        { id: 'implementation', label: '구현 계획 수립', emoji: '📋' },
        { id: 'tech-stack', label: '기술 스택 추천', emoji: '🛠️' },
        { id: 'architecture', label: '아키텍처 설계', emoji: '🏗️' },
        { id: 'mvp', label: 'MVP 전략', emoji: '🚀' },
        { id: 'challenges', label: '기술적 과제 분석', emoji: '⚠️' }
      ]
    }]);
  }, [ideas]);

  const handleOptionSelect = async (option, optionLabel) => {
    // Add user selection as message
    setMessages(prev => [...prev, { role: 'user', content: optionLabel }]);
    setShowOptions(false);
    setLoading(true);

    // Build prompt based on selected option
    let prompt = '';
    switch(option) {
      case 'implementation':
        prompt = '선택한 프로젝트들의 구현 계획을 단계별로 상세히 작성해주세요. 각 단계별로 필요한 작업, 예상 소요 시간, 우선순위를 포함해주세요.';
        break;
      case 'tech-stack':
        prompt = '각 프로젝트에 최적화된 기술 스택과 라이브러리를 추천해주세요. 선택 이유와 대안도 함께 설명해주세요.';
        break;
      case 'architecture':
        prompt = '프로젝트의 시스템 아키텍처를 설계해주세요. 컴포넌트 구조, 데이터 흐름, API 설계를 포함해주세요.';
        break;
      case 'mvp':
        prompt = 'MVP(최소 기능 제품)를 2-4주 내에 개발하기 위한 전략을 제시해주세요. 핵심 기능만 추려서 우선순위를 정해주세요.';
        break;
      case 'challenges':
        prompt = '개발 중 예상되는 기술적 과제와 해결 방안을 분석해주세요. 성능, 확장성, 보안 측면을 고려해주세요.';
        break;
      default:
        prompt = optionLabel;
    }

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await ideasAPI.chatWithIdeas(ideas, prompt, conversationHistory);
      const assistantMessage = response.data?.data?.response || response.data?.response;

      // Determine next options based on current step
      let nextOptions = [];
      if (option === 'implementation') {
        nextOptions = [
          { id: 'tech-stack', label: '이제 기술 스택을 선택하고 싶어요', emoji: '🛠️' },
          { id: 'timeline', label: '개발 일정을 조정하고 싶어요', emoji: '📅' },
          { id: 'team', label: '팀 구성에 대해 알고 싶어요', emoji: '👥' }
        ];
      } else if (option === 'tech-stack') {
        nextOptions = [
          { id: 'architecture', label: '아키텍처를 설계하고 싶어요', emoji: '🏗️' },
          { id: 'alternatives', label: '다른 기술 스택도 보고 싶어요', emoji: '🔄' },
          { id: 'learning', label: '학습 리소스를 추천받고 싶어요', emoji: '📚' }
        ];
      } else if (option === 'architecture') {
        nextOptions = [
          { id: 'database', label: '데이터베이스 설계를 도와주세요', emoji: '💾' },
          { id: 'api', label: 'API 설계를 구체화하고 싶어요', emoji: '🔌' },
          { id: 'security', label: '보안 고려사항을 알고 싶어요', emoji: '🔒' }
        ];
      } else if (option === 'mvp') {
        nextOptions = [
          { id: 'features', label: '추가할 기능을 논의하고 싶어요', emoji: '✨' },
          { id: 'marketing', label: '출시 전략을 세우고 싶어요', emoji: '📢' },
          { id: 'metrics', label: '성공 지표를 정하고 싶어요', emoji: '📊' }
        ];
      } else {
        nextOptions = [
          { id: 'implementation', label: '다시 구현 계획으로', emoji: '📋' },
          { id: 'custom', label: '직접 질문하기', emoji: '✍️' }
        ];
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: assistantMessage || '응답을 받지 못했습니다.',
        options: nextOptions
      }]);
      setShowOptions(true);
      setCurrentStep(option);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `오류가 발생했습니다: ${error.response?.data?.error || error.message}`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setShowOptions(false);
    setLoading(true);

    try {
      // Build conversation history for API
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await ideasAPI.chatWithIdeas(ideas, userMessage, conversationHistory);
      const assistantMessage = response.data?.data?.response || response.data?.response;

      // Always show options after free-form question
      const generalOptions = [
        { id: 'implementation', label: '구현 계획 보기', emoji: '📋' },
        { id: 'tech-stack', label: '기술 스택 추천', emoji: '🛠️' },
        { id: 'architecture', label: '아키텍처 설계', emoji: '🏗️' },
        { id: 'custom', label: '계속 질문하기', emoji: '✍️' }
      ];

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: assistantMessage || '응답을 받지 못했습니다.',
        options: generalOptions
      }]);
      setShowOptions(true);
    } catch (error) {
      console.error('Chat error:', error);
      console.error('Error details:', error.response?.data);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `오류가 발생했습니다: ${error.response?.data?.error || error.message}`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chatbot-overlay" onClick={onClose}>
      <div className="chatbot-container" onClick={(e) => e.stopPropagation()}>
        <div className="chatbot-header">
          <div>
            <h3>AI 아이디어 컨설팅</h3>
            <p className="chatbot-subtitle">{ideas.length}개 프로젝트 분석중</p>
          </div>
          <button className="chatbot-close" onClick={onClose}>✕</button>
        </div>

        <div className="chatbot-messages">
          {messages.map((message, index) => (
            <div key={index}>
              <div className={`message ${message.role}`}>
                <div className="message-avatar">
                  {message.role === 'user' ? '👤' : '🤖'}
                </div>
                <div className="message-content">
                  {message.role === 'assistant' ? (
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  ) : (
                    <p>{message.content}</p>
                  )}
                </div>
              </div>

              {/* Show options if this is the last assistant message and has options */}
              {message.role === 'assistant' &&
               message.options &&
               index === messages.length - 1 &&
               !loading &&
               showOptions && (
                <div className="options-container">
                  {message.options.map((option) => (
                    <button
                      key={option.id}
                      className="option-button"
                      onClick={() => handleOptionSelect(option.id, option.label)}
                    >
                      <span className="option-emoji">{option.emoji}</span>
                      <span className="option-label">{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="message assistant">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chatbot-input-area">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="질문을 입력하세요 (Shift+Enter로 줄바꿈)"
            disabled={loading}
            rows={2}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="send-button"
          >
            {loading ? '⏳' : '➤'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IdeaChatbot;
