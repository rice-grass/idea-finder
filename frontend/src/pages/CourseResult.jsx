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

  // 카카오 API로 좌표를 동 단위 주소로 변환
  const getAddressFromCoords = async (lat, lng) => {
    return new Promise((resolve, reject) => {
      if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
        reject(new Error('카카오맵 서비스를 사용할 수 없습니다.'));
        return;
      }

      const geocoder = new window.kakao.maps.services.Geocoder();

      geocoder.coord2Address(lng, lat, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const address = result[0].address;
          const dong = address.region_3depth_name; // 동 단위
          const fullAddress = address.address_name;

          console.log('✅ 주소 변환 성공:', {
            fullAddress,
            dong,
            region_1depth_name: address.region_1depth_name, // 시/도
            region_2depth_name: address.region_2depth_name, // 구/군
            region_3depth_name: address.region_3depth_name  // 동
          });

          resolve({
            fullAddress,
            dong,
            region_1depth: address.region_1depth_name,
            region_2depth: address.region_2depth_name,
            region_3depth: address.region_3depth_name
          });
        } else {
          reject(new Error('주소 변환 실패'));
        }
      });
    });
  };

  // 위치 권한 요청 및 현재 위치 가져오기
  const requestLocationPermission = async () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('이 브라우저는 위치 서비스를 지원하지 않습니다.'));
        return;
      }

      console.log('📍 위치 권한 요청 중...');

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          console.log('✅ 위치 수신 성공:', { lat, lng, accuracy: position.coords.accuracy });

          try {
            // 카카오 API로 동 단위 주소 변환
            const addressInfo = await getAddressFromCoords(lat, lng);

            const location = {
              lat,
              lng,
              accuracy: position.coords.accuracy,
              address: addressInfo.fullAddress,
              dong: addressInfo.dong,
              region_1depth: addressInfo.region_1depth,
              region_2depth: addressInfo.region_2depth,
              region_3depth: addressInfo.region_3depth,
              name: `${addressInfo.region_2depth} ${addressInfo.dong}` // 예: "해운대구 중동"
            };

            console.log('✅ 최종 위치 정보:', location);
            localStorage.setItem('userLocation', JSON.stringify(location));
            resolve(location);
          } catch (err) {
            console.warn('⚠️ 주소 변환 실패, 좌표만 사용:', err);
            // 주소 변환 실패해도 좌표는 사용
            const location = {
              lat,
              lng,
              accuracy: position.coords.accuracy,
              name: '현재 위치'
            };
            localStorage.setItem('userLocation', JSON.stringify(location));
            resolve(location);
          }
        },
        (error) => {
          console.error('❌ 위치 오류:', error);
          let errorMessage = '위치 정보를 가져올 수 없습니다.';

          if (error.code === 1) {
            errorMessage = '위치 권한이 거부되었습니다.\n브라우저 설정에서 위치 권한을 허용해주세요.';
          } else if (error.code === 2) {
            errorMessage = '위치 정보를 사용할 수 없습니다.\nGPS가 꺼져있거나 신호가 약할 수 있습니다.';
          } else if (error.code === 3) {
            errorMessage = '위치 요청 시간이 초과되었습니다.';
          }

          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  // localStorage에서 사용자 설정 가져오기
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);

        // localStorage에서 사용자가 선택한 정보 가져오기
        let location = JSON.parse(localStorage.getItem('userLocation') || 'null');
        const theme = localStorage.getItem('selectedTheme');
        const distance = parseFloat(localStorage.getItem('selectedDistance') || '5.0');
        const difficulty = localStorage.getItem('selectedDifficulty') || 'intermediate';

        // 위치 정보가 없으면 자동으로 요청
        if (!location || !location.lat || !location.lng) {
          console.log('⚠️ 위치 정보 없음. 자동 요청 시작...');
          try {
            location = await requestLocationPermission();
            console.log('✅ 위치 자동 획득 성공:', location);
          } catch (err) {
            console.error('❌ 위치 자동 획득 실패:', err);
            setError(err.message + '\n\n처음부터 다시 시작하려면 홈으로 돌아가세요.');
            setLoading(false);
            return;
          }
        } else {
          console.log('✅ 저장된 위치 사용:', location);
        }

        // 백엔드 API 호출
        console.log('🚀 코스 생성 API 호출:', { location, theme, distance, difficulty });
        const response = await runningAPI.generateCourse({
          startLocation: location,
          theme: theme || 'healing',
          distance: `${distance}km`,
          difficulty: difficulty
        });

        if (response.data && response.data.courses) {
          console.log('✅ 코스 생성 성공:', response.data.courses.length + '개');
          setCourses(response.data.courses);
        } else {
          setError('코스를 생성할 수 없습니다.');
        }

        setLoading(false);
      } catch (err) {
        console.error('❌ 코스 생성 실패:', err);
        setError('코스를 생성하는 중 오류가 발생했습니다.\n' + (err.response?.data?.error || err.message));
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

    // localStorage에서 사용자의 실제 현재 위치 가져오기 (최우선)
    const userLocation = JSON.parse(localStorage.getItem('userLocation') || 'null');
    let centerLat, centerLng;

    if (userLocation && userLocation.lat && userLocation.lng) {
      // 사용자의 실제 현재 위치를 지도 중심으로
      centerLat = userLocation.lat;
      centerLng = userLocation.lng;
      console.log('✅ 지도 중심: 사용자 현재 위치', { centerLat, centerLng });
    } else {
      // fallback: 첫 번째 코스의 시작점
      const firstCourse = courses[0];
      if (firstCourse.route && firstCourse.route.length > 0) {
        centerLat = firstCourse.route[0].lat;
        centerLng = firstCourse.route[0].lng;
      } else if (firstCourse.waypoints && firstCourse.waypoints.length > 0) {
        centerLat = firstCourse.waypoints[0].lat;
        centerLng = firstCourse.waypoints[0].lng;
      } else {
        console.error('❌ 위치 정보를 찾을 수 없습니다.');
        return;
      }
      console.log('⚠️ 지도 중심: 첫 번째 코스 시작점 (fallback)', { centerLat, centerLng });
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

    console.log(`🗺️ 코스 ${courseIndex + 1} 표시 중...`);

    // 기존 폴리라인과 마커 제거
    polylinesRef.current.forEach(polyline => polyline.setMap(null));
    markersRef.current.forEach(marker => marker.setMap(null));
    polylinesRef.current = [];
    markersRef.current = [];

    const course = courses[courseIndex];
    const map = mapRef.current;
    const bounds = new window.kakao.maps.LatLngBounds();

    // 시작 위치 마커 추가 (사용자 현재 위치)
    const userLocation = JSON.parse(localStorage.getItem('userLocation') || 'null');
    if (userLocation && userLocation.lat && userLocation.lng) {
      const startPosition = new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng);

      // 시작점 마커
      const startMarker = new window.kakao.maps.Marker({
        position: startPosition,
        map: map,
        title: '출발지 (현재 위치)'
      });

      // 시작점 인포윈도우
      const infoWindow = new window.kakao.maps.InfoWindow({
        content: '<div style="padding:8px 12px;font-size:13px;font-weight:600;color:#ff784c;">🏃 출발지</div>'
      });
      infoWindow.open(map, startMarker);

      markersRef.current.push(startMarker);
      bounds.extend(startPosition);
    }

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

      console.log(`✅ 코스 ${courseIndex + 1} 경로: ${linePath.length}개 포인트`);
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

      console.log(`✅ 코스 ${courseIndex + 1} 경유지: ${linePath.length}개 포인트 (점선)`);
    }

    // ✅ 오아시스(waypoints) 마커는 더 이상 찍지 않고,
    //    지도의 bounds 계산에만 사용
      if (course.waypoints && course.waypoints.length > 0) {
        course.waypoints.forEach(waypoint => {
          const position = new window.kakao.maps.LatLng(waypoint.lat, waypoint.lng);
          bounds.extend(position);
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
    console.log(`🎯 코스 카드 클릭: ${index + 1}번 (${courses[index]?.name})`);
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
          <div className="loading-spinner"></div>
          <p>📍 위치 정보 확인 중...</p>
          <p>🗺️ 최적의 러닝 코스를 생성하고 있습니다...</p>
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
