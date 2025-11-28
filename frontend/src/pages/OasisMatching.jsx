import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { runningAPI } from '../services/api';
import KakaoMapDisplay from '../components/KakaoMapDisplay';
import runwaveLogo from '../../image/image.png';
import image212 from '../../image/image-212.png';
import imageA from '../../image/a.png';
import imageB from '../../image/b.png';
import './OasisMatching.css';

function OasisMatching() {
  const navigate = useNavigate();
  const [generatedCourse, setGeneratedCourse] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [nearbyOasis, setNearbyOasis] = useState([]);
  const [oasisFilter, setOasisFilter] = useState('all');

  useEffect(() => {
    // 현재 위치 가져오기
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          console.log('✅ Real-time location:', location);
        },
        (error) => {
          console.error('❌ Location error:', error);
          // Fallback to saved location
          const savedLocation = localStorage.getItem('userLocation');
          if (savedLocation) {
            setCurrentLocation(JSON.parse(savedLocation));
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }

    // 이전 페이지에서 저장한 코스 불러오기
    const savedCourse = localStorage.getItem('selectedRunningCourse');
    if (savedCourse) {
      const course = JSON.parse(savedCourse);
      setGeneratedCourse(course);

      if (course.waypoints && course.waypoints.length > 0) {
        loadNearbyOasis(course.waypoints);
      }

      // 한 번만 쓰고 비우기
      localStorage.removeItem('selectedRunningCourse');
    }
  }, []);

  // Kakao Places Fallback 검색
  const searchOasisWithKakao = (centerLat, centerLng) => {
    return new Promise((resolve) => {
      if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
        resolve([]);
        return;
      }

      const places = new window.kakao.maps.services.Places();
      const location = new window.kakao.maps.LatLng(centerLat, centerLng);
      const radius = 1000; // 1km

      const keywordSearch = (keyword) =>
        new Promise((innerResolve) => {
          places.keywordSearch(
            keyword,
            (data, status) => {
              if (status === window.kakao.maps.services.Status.OK) {
                innerResolve(data);
              } else {
                innerResolve([]);
              }
            },
            { location, radius }
          );
        });

      Promise.all([
        keywordSearch('급수대'),
        keywordSearch('보관함'),
        keywordSearch('마트 할인'),
      ]).then(([fountains, lockers, discounts]) => {
        const mapped = [
          ...fountains.map((place) => ({
            name: place.place_name,
            lat: parseFloat(place.y),
            lng: parseFloat(place.x),
            type: 'fountain',
            address: place.road_address_name || place.address_name,
          })),
          ...lockers.map((place) => ({
            name: place.place_name,
            lat: parseFloat(place.y),
            lng: parseFloat(place.x),
            type: 'touristSpot', // 집 보관 카테고리로 사용
            address: place.road_address_name || place.address_name,
          })),
          ...discounts.map((place) => ({
            name: place.place_name,
            lat: parseFloat(place.y),
            lng: parseFloat(place.x),
            type: 'restaurant', // 할인매장 카테고리로 사용
            address: place.road_address_name || place.address_name,
          })),
        ];
        resolve(mapped);
      });
    });
  };

  const loadNearbyOasis = async (waypoints) => {
    try {
      const centerLat = waypoints.reduce((sum, p) => sum + p.lat, 0) / waypoints.length;
      const centerLng = waypoints.reduce((sum, p) => sum + p.lng, 0) / waypoints.length;

      const response = await runningAPI.searchNearbyOasis({
        lat: centerLat,
        lng: centerLng,
        radius: 1000,
        route: waypoints
      });

      if (response.data && response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
        setNearbyOasis(response.data.data);
      } else {
        // ✅ 백엔드 결과가 없을 때 Kakao Map Places Fallback
        const kakaoOasis = await searchOasisWithKakao(centerLat, centerLng);
        setNearbyOasis(kakaoOasis);
      }
    } catch (error) {
      console.error('Error loading nearby oasis:', error);
    }
  };


  if (!generatedCourse) {
    return (
      <div className="course-result-container oasis-matching-page">
        <div className="header-section">
          <img className="runwave-logo" alt="Runwave" src={runwaveLogo} />
          <img className="profile-icon" alt="Profile" src={image212} />
        </div>
        <div className="divider" />
        <p className="oasis-loading-text">Oasis 매칭 정보를 불러오는 중...</p>
      </div>
    );
  }

  // 코스 기준 중심 좌표 (경로 또는 웨이포인트)
  let routeCenter = null;
  if (generatedCourse.route && generatedCourse.route.length > 0) {
    const first = generatedCourse.route[0];
    routeCenter = { lat: first.lat, lng: first.lng };
  } else if (generatedCourse.waypoints && generatedCourse.waypoints.length > 0) {
    const first = generatedCourse.waypoints[0];
    routeCenter = { lat: first.lat, lng: first.lng };
  }

  return (
    <div className="course-result-container oasis-matching-page">
      {/* 헤더 (기존 페이지 스타일 유지) */}
      <div className="header-section">
        <img className="runwave-logo" alt="Runwave" src={runwaveLogo} />
        <img className="profile-icon" alt="Profile" src={image212} />
      </div>

      <div className="divider" />

      {/* 제목 영역 */}
      <div className="page-title">
        <div className="step-label">Step4</div>
        <div className="step-description">Oasis Matching</div>
      </div>

      <p className="oasis-subtitle">
        선택한 코스 주변에서{' '}
        <span className="highlight-count">{nearbyOasis.length}개 Oasis</span>를 찾았어요!
      </p>

      {/* 필터 버튼 */}
      <div className="oasis-filter-buttons">
        <button
          className={`filter-button ${oasisFilter === 'all' ? 'active' : ''}`}
          onClick={() => setOasisFilter('all')}
        >
          전체
        </button>
        <button
          className={`filter-button ${oasisFilter === 'cafe' ? 'active' : ''}`}
          onClick={() => setOasisFilter('cafe')}
        >
          ☕ 카페(급수대)
        </button>
     
      
        <button
          className={`filter-button ${oasisFilter === 'discount' ? 'active' : ''}`}
          onClick={() => setOasisFilter('discount')}
        >
          💸 할인매장
        </button>
      </div>

      {/* 지도 섹션 */}
      <div className="map-section oasis-map-container">
        <KakaoMapDisplay
          route={{
            waypoints: generatedCourse.route || generatedCourse.waypoints || []
          }}
          height="280px"
          center={routeCenter || currentLocation}
          showMarkers={true}
          oasisLocations={nearbyOasis.filter(oasis => {
            if (oasisFilter === 'all') return true;
            if (oasisFilter === 'cafe') return oasis.type === 'fountain' || oasis.type === 'cafe';
            if (oasisFilter === 'home') return oasis.type === 'touristSpot';
            if (oasisFilter === 'discount') return oasis.type === 'restaurant';
            return true;
          })}
        />
      </div>

      {/* 카테고리별 작은 컨테이너 카드들 */}
      <div className="oasis-category-section">
        <h3 className="category-title">☕ 카페(급수대)</h3>
        <div className="oasis-cards-scroll">
          {nearbyOasis
            .filter(o => o.type === 'fountain' || o.type === 'cafe')
            .map((oasis, idx) => (
              <div key={idx} className="oasis-mini-card">
                <h4>{oasis.name}</h4>
                <p>{oasis.description || oasis.address || '물 보충이 필요할 때 들르기 좋은 곳'}</p>
              </div>
            ))}
        </div>
      </div>

      <div className="oasis-category-section">

        <div className="oasis-cards-scroll">
          {nearbyOasis
            .filter(o => o.type === 'touristSpot')
            .map((oasis, idx) => (
              <div key={idx} className="oasis-mini-card">
                <h4>{oasis.name}</h4>
                <p>{oasis.description || oasis.address || '짐을 잠시 보관하거나 쉬어가기 좋은 스팟'}</p>
              </div>
            ))}
        </div>
      </div>

      <div className="oasis-category-section">
        <h3 className="category-title">💸 할인매장</h3>
        <div className="oasis-cards-scroll">
          {nearbyOasis
            .filter(o => o.type === 'restaurant')
            .map((oasis, idx) => (
              <div key={idx} className="oasis-mini-card">
                <h4>{oasis.name}</h4>
                <p>{oasis.description || oasis.address || '가성비 좋은 간식/식사 해결 스팟'}</p>
              </div>
            ))}
        </div>
      </div>

      {/* 런닝 시작 버튼 */}
      <button
        className="start-running-button"
        onClick={() => navigate('/oasis/run', {
          state: {
            courseName: generatedCourse.name || '나의 러닝 코스',
            route: generatedCourse
          }
        })}
      >
        🏃 런닝 시작하기
      </button>

      {/* 하단 네비게이션 – 기존 스타일 유지, OASIS 탭 active */}
      <div className="bottom-nav">
        <div className="nav-tabs">
          <div className="nav-tab" onClick={() => navigate('/course-result')}>
            <img src={image212} alt="Run" className="nav-icon" />
            <div className="nav-label">RUN</div>
          </div>
          <div className="nav-tab active">
            <img src={imageA} alt="Oasis" className="nav-icon" />
            <div className="nav-label">OASIS</div>
          </div>
          <div className="nav-tab">
            <img src={imageB} alt="Log" className="nav-icon" />
            <div className="nav-label">LOG</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OasisMatching;
