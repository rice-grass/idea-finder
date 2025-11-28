import React, { useEffect, useState } from 'react';
import './CourseLoading.css';
import runwaveLogo from "../../image/image.png";

const loadingMessages = [
  {
    emoji: '🏃',
    title: '테마 기반 코스를 준비하고 있어요',
    subtitle: '주변 포토 스팟을 분석하는 중이에요...'
  },
  {
    emoji: '🏃',
    title: '당신에게 딱 맞는 러닝 분위기를 분석 중이에요',
    subtitle: '달리기 성향에 맞춰 추천 코스를 정렬하고 있어요...'
  },
  {
    emoji: '✨',
    title: '최적의 러닝 루트를 완성하고 있어요',
    subtitle: '나만의 커스텀 코스가 곧 완성됩니다...'
  }
];

export const CourseLoading = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 로딩 메시지 변경 (2.5초마다)
    const messageInterval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2500);

    // 프로그레스 바 증가
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          // 완료 후 결과 페이지로 이동
          setTimeout(() => {
            window.location.href = '/course-result';
          }, 500);
          return 100;
        }
        return prev + 1.33; // 7.5초 동안 100%까지 (100 / 75 steps)
      });
    }, 100);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="course-loading-container">
      {/* 헤더 */}
      <div className="loading-header">
        <img className="runwave-logo" alt="Runwave" src={runwaveLogo} />
      </div>

      {/* 메인 로딩 영역 */}
      <div className="loading-content">
        <div className="loading-spinner-circle">
          <div className="spinner-inner"></div>
        </div>

        <div className="loading-message">
          <div className="message-emoji">{loadingMessages[currentIndex].emoji}</div>
          <h2 className="message-title">{loadingMessages[currentIndex].title}</h2>
          <p className="message-subtitle">{loadingMessages[currentIndex].subtitle}</p>
        </div>

        {/* 프로그레스 바 */}
        <div className="progress-container">
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLoading;
