import React, { useState, useEffect, useRef } from 'react';
import './CourseResult.css';
import runwaveLogo from "../../image/image.png";
import image212 from "../../image/image-212.png";
import imageA from "../../image/a.png";
import imageB from "../../image/b.png";
import { runningAPI } from '../services/api';

export const CourseResult = () => {
  const [selectedCourse, setSelectedCourse] = useState(0);
  const mapContainer = useRef(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const polylinesRef = useRef([]);
  const markersRef = useRef([]);

  // localStorage에서 사용자 설정 가져오기
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);

        // localStorage에서 사용자가 선택한 정보 가져오기
        const location = JSON.parse(localStorage.getItem('userLocation') || 'null');
        const theme = localStorage.getItem('selectedTheme');
        const distance = parseFloat(localStorage.getItem('selectedDistance') || '5.0');
        const difficulty = localStorage.getItem('selectedDifficulty') || 'intermediate';

        if (!location) {
          setError('위치 정보를 찾을 수 없습니다.');
          setLoading(false);
          return;
        }

        // 백엔드 API 호출
        const response = await runningAPI.generateCourse({
          startLocation: location,
          theme: theme || 'healing',
          distance: `${distance}km`,
          difficulty: difficulty
        });

        if (response.data && response.data.courses) {
          setCourses(response.data.courses);
        }

        setLoading(false);
      } catch (err) {
        console.error('코스 생성 실패:', err);
        setError('코스를 생성하는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Kakao Maps SDK 로딩 및 초기화
  useEffect(() => {
    const checkSDK = setInterval(() => {
      if (window.kakao && window.kakao.maps) {
        clearInterval(checkSDK);
        setIsMapReady(true);
        initMap();
      }
    }, 100);

    return () => clearInterval(checkSDK);
  }, [courses]);

  const initMap = () => {
    if (!mapContainer.current || !window.kakao || courses.length === 0) return;

    const firstCourse = courses[0];

    // route 또는 waypoints에서 중심 좌표 가져오기
    let centerLat, centerLng;
    if (firstCourse.route && firstCourse.route.length > 0) {
      centerLat = firstCourse.route[0].lat;
      centerLng = firstCourse.route[0].lng;
    } else if (firstCourse.waypoints && firstCourse.waypoints.length > 0) {
      centerLat = firstCourse.waypoints[0].lat;
      centerLng = firstCourse.waypoints[0].lng;
    } else {
      // localStorage에서 사용자 위치 가져오기
      const userLocation = JSON.parse(localStorage.getItem('userLocation') || 'null');
      if (userLocation) {
        centerLat = userLocation.lat;
        centerLng = userLocation.lng;
      } else {
        return; // 위치 정보가 없으면 지도 초기화 불가
      }
    }

    const mapOption = {
      center: new window.kakao.maps.LatLng(centerLat, centerLng),
      level: 5
    };

    const map = new window.kakao.maps.Map(mapContainer.current, mapOption);
    mapRef.current = map;

    // 줌 컨트롤
    const zoomControl = new window.kakao.maps.ZoomControl();
    map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

    // 첫 번째 코스 표시
    displayCourseOnMap(0);
  };

  // 선택된 코스를 지도에 표시
  const displayCourseOnMap = (courseIndex) => {
    if (!mapRef.current || !courses[courseIndex]) return;

    // 기존 폴리라인과 마커 제거
    polylinesRef.current.forEach(polyline => polyline.setMap(null));
    markersRef.current.forEach(marker => marker.setMap(null));
    polylinesRef.current = [];
    markersRef.current = [];

    const course = courses[courseIndex];
    const map = mapRef.current;
    const bounds = new window.kakao.maps.LatLngBounds();

    // 경로 그리기
    if (course.route && course.route.length > 0) {
      const linePath = course.route.map(point =>
        new window.kakao.maps.LatLng(point.lat, point.lng)
      );

      const polyline = new window.kakao.maps.Polyline({
        path: linePath,
        strokeWeight: 6,
        strokeColor: '#ff784c',
        strokeOpacity: 0.9,
        strokeStyle: 'solid'
      });

      polyline.setMap(map);
      polylinesRef.current.push(polyline);

      // 경로 포인트를 bounds에 추가
      linePath.forEach(point => bounds.extend(point));
    } else if (course.waypoints && course.waypoints.length > 0) {
      // route가 없으면 waypoints만으로 직선 경로 표시
      const linePath = course.waypoints.map(wp =>
        new window.kakao.maps.LatLng(wp.lat, wp.lng)
      );

      const polyline = new window.kakao.maps.Polyline({
        path: linePath,
        strokeWeight: 6,
        strokeColor: '#ff784c',
        strokeOpacity: 0.9,
        strokeStyle: 'dashed' // 직선 경로는 점선으로 표시
      });

      polyline.setMap(map);
      polylinesRef.current.push(polyline);

      // waypoints를 bounds에 추가
      linePath.forEach(point => bounds.extend(point));
    }

    // 오아시스(waypoints) 마커 표시
    if (course.waypoints && course.waypoints.length > 0) {
      course.waypoints.forEach(waypoint => {
        const position = new window.kakao.maps.LatLng(waypoint.lat, waypoint.lng);

        const marker = new window.kakao.maps.Marker({
          position: position,
          map: map
        });

        // waypoint를 bounds에 추가
        bounds.extend(position);

        // 인포윈도우
        const infowindow = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:5px;font-size:12px;">${waypoint.name}</div>`
        });

        window.kakao.maps.event.addListener(marker, 'mouseover', () => {
          infowindow.open(map, marker);
        });

        window.kakao.maps.event.addListener(marker, 'mouseout', () => {
          infowindow.close();
        });

        markersRef.current.push(marker);
      });
    }

    // bounds가 유효하면 지도를 해당 영역에 맞춤
    if (!bounds.isEmpty()) {
      map.setBounds(bounds);
    }
  };

  const handleStartRun = () => {
    if (courses.length === 0) return;
    const course = courses[selectedCourse];

    // Save selected course to localStorage
    localStorage.setItem('selectedRunningCourse', JSON.stringify(course));

    // Navigate to Oasis matching page
    window.location.href = '/oasis';
  };

  const handleCourseSelect = (index) => {
    setSelectedCourse(index);
    displayCourseOnMap(index);
  };

  if (loading) {
    return (
      <div className="course-result-container">
        <div className="header-section">
          <img className="runwave-logo" alt="Runwave" src={runwaveLogo} />
          <img className="profile-icon" alt="Profile" src={image212} />
        </div>
        <div className="loading-message">
          <p>코스를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-result-container">
        <div className="header-section">
          <img className="runwave-logo" alt="Runwave" src={runwaveLogo} />
          <img className="profile-icon" alt="Profile" src={image212} />
        </div>
        <div className="error-message">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="course-result-container">
      {/* 헤더 */}
      <div className="header-section">
        <img className="runwave-logo" alt="Runwave" src={runwaveLogo} />
        <img className="profile-icon" alt="Profile" src={image212} />
      </div>

      <div className="divider" />

      {/* 진행 바 */}
      <div className="progress-bar">
        <div className="progress-step active"></div>
        <div className="progress-step active"></div>
        <div className="progress-step active"></div>
        <div className="progress-step active"></div>
      </div>

      {/* 제목 */}
      <div className="page-title">
        <div className="step-label">Step3</div>
        <div className="step-description">Course Recommendation</div>
      </div>

      {/* 카카오맵 */}
      <div className="map-section">
        <div ref={mapContainer} className="kakao-map">
          {!isMapReady && (
            <div className="map-loading">
              <p>지도 로딩 중...</p>
            </div>
          )}
        </div>
      </div>

      {/* 코스 카드 슬라이더 */}
      <div className="course-slider">
        {courses.map((course, index) => (
          <div
            key={course.id || index}
            className={`course-card ${selectedCourse === index ? 'active' : ''}`}
            onClick={() => handleCourseSelect(index)}
          >
            <h3 className="course-name">{course.name}</h3>
            <div className="course-stats">
              <span className="stat-item">⏱️ {course.time}</span>
              <span className="stat-item">📍 {course.distance}</span>
              <span className="stat-item">💧 오아시스 {course.waypoints?.length || 0}곳</span>
            </div>
            <div className="course-tags">
              {course.tags && course.tags.map((tag, idx) => (
                <span key={idx} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 페이지네이션 dots */}
      <div className="pagination-dots">
        {courses.map((_, index) => (
          <span
            key={index}
            className={`dot ${selectedCourse === index ? 'active' : ''}`}
            onClick={() => handleCourseSelect(index)}
          ></span>
        ))}
      </div>

      {/* START 버튼 */}
      <button className="start-button" onClick={handleStartRun}>
        이 코스로 RUN START!
      </button>

      {/* 하단 네비게이션 */}
      <div className="bottom-nav">
        <div className="nav-tabs">
          <div className="nav-tab active">
            <img src={image212} alt="Run" className="nav-icon" />
            <div className="nav-label">RUN</div>
          </div>
          <div className="nav-tab">
            <img src={imageA} alt="Oasis" className="nav-icon" />
            <div className="nav-label">OASIS</div>
          </div>
          <div className="nav-tab">
            <img src={imageB} alt="Log" className="nav-icon" />
            <div className="nav-label">OASIS</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseResult;
