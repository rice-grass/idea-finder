import { useState, useEffect } from 'react';
import { runningAPI } from '../services/api';
import KakaoMapDisplay from '../components/KakaoMapDisplay';
import runwaveLogo from '../../image/image.png';
import image212 from '../../image/image-212.png';
import './DistanceDifficulty.css';

function OasisMatching() {
  const [generatedCourse, setGeneratedCourse] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [nearbyOasis, setNearbyOasis] = useState([]);
  const [selectedOasis, setSelectedOasis] = useState([]);
  const [oasisFilter, setOasisFilter] = useState('all');

  useEffect(() => {
    // Get real-time location
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

    // Load saved course
    const savedCourse = localStorage.getItem('selectedRunningCourse');
    if (savedCourse) {
      const course = JSON.parse(savedCourse);
      setGeneratedCourse(course);

      if (course.waypoints) {
        loadNearbyOasis(course.waypoints);
      }

      localStorage.removeItem('selectedRunningCourse');
    }
  }, []);

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

      if (response.data.success) {
        setNearbyOasis(response.data.data);
      }
    } catch (error) {
      console.error('Error loading nearby oasis:', error);
    }
  };

  const handleOasisClick = (oasis) => {
    const isSelected = selectedOasis.find(o => o.name === oasis.name);
    if (isSelected) {
      setSelectedOasis(selectedOasis.filter(o => o.name !== oasis.name));
    } else {
      setSelectedOasis([...selectedOasis, oasis]);
    }
  };

  if (!generatedCourse) {
    return <div>Loading...</div>;
  }

  return (
    <div className="oasis-matching-page">
      <div className="oasis-header">
        <h1 className="runwave-title">Runwave🏃</h1>
      </div>

      <h2 className="oasis-main-title">Oasis 매칭</h2>
      <p className="oasis-subtitle">
        부산 해운대 주변 <span className="highlight-count">{nearbyOasis.length}개 Oasis</span> 발견!
      </p>

      <div className="oasis-filter-buttons">
        <button
          className={`filter-button ${oasisFilter === 'all' ? 'active' : ''}`}
          onClick={() => setOasisFilter('all')}
        >
          전체
        </button>
        <button
          className={`filter-button ${oasisFilter === 'fountain' ? 'active' : ''}`}
          onClick={() => setOasisFilter('fountain')}
        >
          💧 급수대/카페
        </button>
        <button
          className={`filter-button ${oasisFilter === 'tourist' ? 'active' : ''}`}
          onClick={() => setOasisFilter('tourist')}
        >
          🏛️ 정보관
        </button>
        <button
          className={`filter-button ${oasisFilter === 'restaurant' ? 'active' : ''}`}
          onClick={() => setOasisFilter('restaurant')}
        >
          🍽️ 밥안
        </button>
      </div>

      <div className="oasis-map-container">
        <KakaoMapDisplay
          route={generatedCourse.route || { waypoints: generatedCourse.waypoints }}
          height="400px"
          center={currentLocation}
          showMarkers={false}
          oasisLocations={nearbyOasis.filter(oasis => {
            if (oasisFilter === 'all') return true;
            if (oasisFilter === 'fountain') return oasis.type === 'fountain' || oasis.type === 'cafe';
            if (oasisFilter === 'tourist') return oasis.type === 'touristSpot';
            if (oasisFilter === 'restaurant') return oasis.type === 'restaurant';
            return true;
          })}
          onOasisClick={handleOasisClick}
          selectedOasis={selectedOasis}
        />
      </div>

      <div className="oasis-category-section">
        <h3 className="category-title">💧 급수대/카페</h3>
        <div className="oasis-cards-scroll">
          {nearbyOasis
            .filter(o => o.type === 'fountain' || o.type === 'cafe')
            .map((oasis, idx) => (
              <div key={idx} className="oasis-mini-card" onClick={() => handleOasisClick(oasis)}>
                <h4>{oasis.name}</h4>
                <p>{oasis.description || '물 부족할 때 방문'}</p>
              </div>
            ))}
        </div>
      </div>

      <div className="oasis-category-section">
        <h3 className="category-title">🏛️ 정보관</h3>
        <div className="oasis-cards-scroll">
          {nearbyOasis
            .filter(o => o.type === 'touristSpot')
            .map((oasis, idx) => (
              <div key={idx} className="oasis-mini-card" onClick={() => handleOasisClick(oasis)}>
                <h4>{oasis.name}</h4>
                <p>{oasis.description || '관광 정보 및 휴식'}</p>
              </div>
            ))}
        </div>
      </div>

      <div className="oasis-category-section">
        <h3 className="category-title">🍽️ 밥안</h3>
        <div className="oasis-cards-scroll">
          {nearbyOasis
            .filter(o => o.type === 'restaurant')
            .map((oasis, idx) => (
              <div key={idx} className="oasis-mini-card" onClick={() => handleOasisClick(oasis)}>
                <h4>{oasis.name}</h4>
                <p>{oasis.description || '러닝 후 식사는 5-30분 뒤'}</p>
              </div>
            ))}
        </div>
      </div>

      <div className="bottom-nav">
        <button className="nav-btn">
          <span className="nav-icon">🏃</span>
          <span className="nav-label">RUN</span>
        </button>
        <button className="nav-btn active">
          <span className="nav-icon">🔥</span>
          <span className="nav-label">OASIS</span>
        </button>
        <button className="nav-btn">
          <span className="nav-icon">📋</span>
          <span className="nav-label">OASIS</span>
        </button>
      </div>
    </div>
  );
}

export default OasisMatching;
