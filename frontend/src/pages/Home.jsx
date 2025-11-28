import React, { useState, useEffect, useRef } from 'react';
import { runningAPI } from '../services/api';
import KakaoMapDisplay from '../components/KakaoMapDisplay';
import './Home.css';

function Home() {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  // Step-based navigation
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Running state (Step 4-2)
  const [isRunningStarted, setIsRunningStarted] = useState(false);
  const [selectedOasis, setSelectedOasis] = useState([]);
  const [nearbyOasis, setNearbyOasis] = useState([]);
  const [oasisFilter, setOasisFilter] = useState('all'); // 'all', 'fountain', 'tourist', 'restaurant'

  // Form data
  const [themes, setThemes] = useState([]);
  const [selectedThemeIndex, setSelectedThemeIndex] = useState(0);

  const [distances, setDistances] = useState([]);
  const [selectedDistanceIndex, setSelectedDistanceIndex] = useState(1); // Default to middle option

  const [difficulties, setDifficulties] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  // Results
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedCourse, setGeneratedCourse] = useState(null);

  // Touch handling for swipe
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Load SDK and check permission status
  useEffect(() => {
    console.log('🚀 RunWave App Starting...');

    // Check if returning from course selection - DO NOTHING, let normal flow handle it
    // The check will happen after SDK loads in the getUserLocation callback

    // Function to initialize map with location
    const setupMapWithLocation = (location) => {
      if (window.kakao && window.kakao.maps) {
        console.log('✅ Kakao SDK available, initializing map...');
        setIsSDKLoaded(true);
        setTimeout(() => initializeMap(location), 100);
      } else {
        console.warn('⚠️ Kakao SDK not available');
        setIsSDKLoaded(false);
      }
    };

    // Function to get user location
    const getUserLocation = () => {
      // First, try to get saved location from LocationStart page
      const savedLocation = localStorage.getItem('userLocation');
      if (savedLocation) {
        try {
          const location = JSON.parse(savedLocation);
          console.log('✅ Using saved location from LocationStart:', location);
          setCurrentLocation(location);
          setLocationPermissionDenied(false);
          setShowLocationPrompt(false);
          setupMapWithLocation(location);
          return;
        } catch (error) {
          console.error('Failed to parse saved location:', error);
        }
      }

      // If no saved location, request GPS
      if (!navigator.geolocation) {
        console.error('❌ Geolocation API not supported by this browser');
        alert('이 브라우저는 위치 서비스를 지원하지 않습니다.');
        return;
      }

      console.log('🔍 Requesting REAL-TIME GPS location with HIGH ACCURACY...');

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const realLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          console.log('✅ ✅ ✅ REAL GPS LOCATION RECEIVED:', realLocation);
          console.log(`   Accuracy: ${position.coords.accuracy} meters`);
          console.log(`   Latitude: ${realLocation.lat}`);
          console.log(`   Longitude: ${realLocation.lng}`);

          setCurrentLocation(realLocation);
          setLocationPermissionDenied(false);
          setShowLocationPrompt(false);
          setupMapWithLocation(realLocation);
        },
        (error) => {
          console.error('❌ GPS LOCATION ERROR:', error);
          console.error('   Error code:', error.code);
          console.error('   Error message:', error.message);

          if (error.code === 1) {
            alert('위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.');
          } else if (error.code === 2) {
            alert('위치 정보를 사용할 수 없습니다.');
          } else if (error.code === 3) {
            alert('위치 요청 시간이 초과되었습니다.');
          }

          setLocationPermissionDenied(true);
          setShowLocationPrompt(true);
        },
        {
          enableHighAccuracy: true,  // Use GPS instead of network location
          timeout: 15000,            // Wait up to 15 seconds
          maximumAge: 0              // Don't use cached location
        }
      );
    };

    // Wait for Kakao SDK to load from index.html
    let attempts = 0;
    const maxAttempts = 50;

    const checkSDK = setInterval(() => {
      attempts++;
      if (window.kakao && window.kakao.maps) {
        console.log('✅ Kakao Maps SDK ready');
        clearInterval(checkSDK);
        getUserLocation();
      } else if (attempts >= maxAttempts) {
        console.error('❌ Kakao Maps SDK failed to load');
        clearInterval(checkSDK);
        setIsSDKLoaded(false);
      }
    }, 100);

    return () => clearInterval(checkSDK);
  }, []);

  // Load initial data
  useEffect(() => {
    loadThemes();
    loadDistances();
    loadDifficulties();

    // Check if returning from course selection
    const savedCourse = localStorage.getItem('selectedRunningCourse');
    if (savedCourse) {
      try {
        const course = JSON.parse(savedCourse);
        console.log('✅ Loading saved course for Oasis matching:', course);

        // Load location
        const savedLocation = localStorage.getItem('userLocation');
        if (savedLocation) {
          const location = JSON.parse(savedLocation);
          setCurrentLocation(location);
        }

        // Set course and start running mode
        setGeneratedCourse(course);
        setIsRunningStarted(true);

        // Load nearby oasis
        if (course.waypoints) {
          loadNearbyOasis(course.waypoints);
        }

        // Clean up
        localStorage.removeItem('selectedRunningCourse');
      } catch (error) {
        console.error('Failed to parse saved course:', error);
      }
    }
  }, []);

  const initializeMap = (location) => {
    if (!mapContainer.current) {
      console.warn('⚠️ Map container ref is not available');
      return;
    }

    if (!window.kakao || !window.kakao.maps) {
      console.warn('⚠️ Kakao Maps SDK is not loaded');
      return;
    }

    try {
      console.log('🗺️ Initializing map with REAL-TIME location:', location);

      // Clear any existing map
      if (mapInstance.current) {
        console.log('♻️ Clearing existing map instance');
        mapContainer.current.innerHTML = '';
      }

      // Kakao 공식 방식: 지도 생성
      const mapOption = {
        center: new window.kakao.maps.LatLng(location.lat, location.lng),
        level: 3
      };

      const map = new window.kakao.maps.Map(mapContainer.current, mapOption);
      mapInstance.current = map;

      // Kakao 공식 방식: displayMarker 함수를 사용한 마커 표시
      const displayMarker = (locPosition, message) => {
        // 마커 생성
        const marker = new window.kakao.maps.Marker({
          map: map,
          position: locPosition
        });

        const iwContent = message;
        const iwRemoveable = true;

        // 인포윈도우 생성
        const infowindow = new window.kakao.maps.InfoWindow({
          content: iwContent,
          removable: iwRemoveable
        });

        // 인포윈도우를 마커위에 표시
        infowindow.open(map, marker);

        // 지도 중심좌표를 접속위치로 변경
        map.setCenter(locPosition);
      };

      const locPosition = new window.kakao.maps.LatLng(location.lat, location.lng);
      const message = `<div style="padding:10px;font-size:14px;font-weight:600;color:#667eea;">📍 실시간 현재 위치<br/><small style="color:#666;">${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}</small></div>`;

      displayMarker(locPosition, message);

      // 컨트롤 추가
      const zoomControl = new window.kakao.maps.ZoomControl();
      map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

      const mapTypeControl = new window.kakao.maps.MapTypeControl();
      map.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT);

      console.log('✅ Map initialized with Kakao official geolocation method');
    } catch (error) {
      console.error('❌ Error initializing map:', error);
    }
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      console.warn('⚠️ 브라우저가 위치 서비스를 지원하지 않습니다.');
      return;
    }

    console.log('🔄 Requesting real-time location update...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        console.log('✅ Real-time location updated:', location);
        setCurrentLocation(location);
        setLocationPermissionDenied(false);
        setShowLocationPrompt(false);

        // Update map with new location
        if (mapInstance.current && window.kakao) {
          const moveLatLon = new window.kakao.maps.LatLng(location.lat, location.lng);
          mapInstance.current.setCenter(moveLatLon);

          // Clear existing markers and add new one
          mapInstance.current.setLevel(4);

          // Add new marker
          const markerPosition = new window.kakao.maps.LatLng(location.lat, location.lng);
          const marker = new window.kakao.maps.Marker({
            position: markerPosition,
            map: mapInstance.current
          });

          const infoWindow = new window.kakao.maps.InfoWindow({
            content: '<div style="padding:10px;font-size:14px;">📍 현재 위치</div>'
          });
          infoWindow.open(mapInstance.current, marker);
        }

        console.log('✅ 실시간 위치가 업데이트되었습니다:', location);
      },
      (error) => {
        console.error('⚠️ 위치 권한이 거부되었거나 오류 발생:', error.message);
        setLocationPermissionDenied(true);
        setShowLocationPrompt(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const loadThemes = async () => {
    try {
      const response = await runningAPI.getThemes();
      setThemes(response.data.data);
    } catch (err) {
      console.error('Error loading themes:', err);
    }
  };

  const loadDistances = async () => {
    try {
      const response = await runningAPI.getDistances();
      setDistances(response.data.data);
    } catch (err) {
      console.error('Error loading distances:', err);
    }
  };

  const loadDifficulties = async () => {
    try {
      const response = await runningAPI.getDifficulties();
      const diffs = response.data.data;
      setDifficulties(diffs);
      // Default to beginner
      if (diffs.length > 0) {
        setSelectedDifficulty(diffs[0].id);
      }
    } catch (err) {
      console.error('Error loading difficulties:', err);
    }
  };

  // Theme navigation with arrows
  const handlePrevTheme = () => {
    setSelectedThemeIndex((prev) =>
      prev === 0 ? themes.length - 1 : prev - 1
    );
  };

  const handleNextTheme = () => {
    setSelectedThemeIndex((prev) =>
      prev === themes.length - 1 ? 0 : prev + 1
    );
  };

  // Distance swipe handling
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    const swipeDistance = touchStart - touchEnd;
    const minSwipeDistance = 50; // Reduced for easier swiping

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        // Swipe left - increase distance
        if (selectedDistanceIndex < distances.length - 1) {
          setSelectedDistanceIndex(prev => prev + 1);
        }
      } else {
        // Swipe right - decrease distance
        if (selectedDistanceIndex > 0) {
          setSelectedDistanceIndex(prev => prev - 1);
        }
      }
    }

    // Reset touch positions
    setTouchStart(0);
    setTouchEnd(0);
  };

  const handleGenerateCourse = async () => {
    if (!currentLocation) {
      setError('현재 위치를 가져올 수 없습니다.');
      return;
    }

    if (themes.length === 0 || distances.length === 0 || difficulties.length === 0) {
      setError('설정 정보를 불러오는 중입니다. 잠시만 기다려주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const district = 'haeundae';

      const response = await runningAPI.generateCourse({
        district: district,
        theme: themes[selectedThemeIndex].id,
        distance: distances[selectedDistanceIndex].id,
        difficulty: selectedDifficulty,
        startLocation: currentLocation
      });

      const courseData = response.data.data;

      const course = {
        ...courseData,
        theme: themes[selectedThemeIndex].label,
        distance: distances[selectedDistanceIndex].label,
        difficulty: difficulties.find(d => d.id === selectedDifficulty)?.label
      };

      setGeneratedCourse(course);
      setIsRunningStarted(false); // 초기화
      setSelectedOasis([]); // 초기화
    } catch (err) {
      console.error('Error generating course:', err);
      setError(err.response?.data?.error || '코스 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartRunning = () => {
    setIsRunningStarted(true);
    // 경로 주변 오아시스 로드
    if (generatedCourse && generatedCourse.waypoints) {
      loadNearbyOasis(generatedCourse.waypoints);
    }
  };

  const loadNearbyOasis = async (waypoints) => {
    try {
      // 경로의 중심점 계산
      const centerLat = waypoints.reduce((sum, p) => sum + p.lat, 0) / waypoints.length;
      const centerLng = waypoints.reduce((sum, p) => sum + p.lng, 0) / waypoints.length;

      // 오아시스 검색 (실제로는 백엔드 API 호출)
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
    // 오아시스 선택/해제 토글
    const isSelected = selectedOasis.find(o => o.name === oasis.name);
    if (isSelected) {
      setSelectedOasis(selectedOasis.filter(o => o.name !== oasis.name));
    } else {
      setSelectedOasis([...selectedOasis, oasis]);
    }
  };

  const handleReset = () => {
    setGeneratedCourse(null);
    setError('');
    setSelectedThemeIndex(0);
    setSelectedDistanceIndex(1);
    setCurrentStep(1);
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return currentLocation !== null;
      case 2:
        return themes.length > 0;
      case 3:
        return distances.length > 0 && selectedDifficulty !== '';
      default:
        return true;
    }
  };

  // Show results page
  if (generatedCourse) {
    return (
      <div className="home-container">
        <header className="home-header">
          <h1 className="home-logo" onClick={handleReset}>🏃 RunWave</h1>
          <button onClick={handleReset} className="home-back-btn">
            ← 새 코스
          </button>
        </header>

        <div className="home-results">
          {!isRunningStarted ? (
            /* Step 4-1: 경로만 표시 + Start 버튼 */
            <div className="course-preview">
              <h2 className="course-title">코스가 준비되었습니다!</h2>
              <p className="course-subtitle">Start 버튼을 눌러 주변 오아시스를 확인하세요</p>

              <div className="course-map-preview">
                <KakaoMapDisplay
                  route={generatedCourse.route || { waypoints: generatedCourse.waypoints }}
                  height="500px"
                  center={currentLocation}
                  showMarkers={false}
                />
              </div>

              <div className="course-info-brief">
                <span>📏 {generatedCourse.distance}</span>
                <span>⏱️ {generatedCourse.duration || '약 30분'}</span>
                <span>🏃 {generatedCourse.difficulty}</span>
              </div>

              <button className="btn-start-running" onClick={handleStartRunning}>
                🏃 Start 런닝
              </button>
            </div>
          ) : (
            /* Step 4-2: 오아시스 표시 + 선택 */
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
                    .slice(0, 3)
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
                    .slice(0, 3)
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
                    .slice(0, 3)
                    .map((oasis, idx) => (
                      <div key={idx} className="oasis-mini-card" onClick={() => handleOasisClick(oasis)}>
                        <h4>{oasis.name}</h4>
                        <p>{oasis.description || '러닝 후 식사는 5-30분 뒤'}</p>
                      </div>
                    ))}
                </div>
              </div>

              {/* Bottom Navigation */}
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

              <button className="btn-finish-running">
                ✓ 런닝 완료
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main generation page with step-based UI
  return (
    <div className="home-container-mobile">
      {/* Progress Indicator */}
      <div className="step-progress">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`step-dot ${currentStep >= step ? 'active' : ''}`}
          />
        ))}
      </div>

      {/* Step 1: Location */}
      {currentStep === 1 && (
        <div className="step-card">
          <div className="step-icon">📍</div>
          <h2 className="step-title">반가워요 러너님!</h2>
          <p className="step-subtitle">오늘 어디서 달리시나요?</p>

          <div className="step-content">
            {!currentLocation ? (
              <div className="location-loading">
                <div className="loader"></div>
                <p>실시간 위치 정보를 가져오는 중...</p>
                <p style={{ fontSize: '13px', color: '#999', marginTop: '8px' }}>
                  위치 권한을 허용해주세요
                </p>
              </div>
            ) : (
              <>
                {isSDKLoaded ? (
                  <div className="map-preview">
                    <div ref={mapContainer} className="mini-map"></div>

                    {showLocationPrompt && (
                      <div className="location-prompt-overlay">
                        <button className="btn-primary" onClick={requestLocation}>
                          📍 실시간 위치 사용하기
                        </button>
                        <button className="btn-secondary" onClick={() => setShowLocationPrompt(false)}>
                          기본 위치 사용
                        </button>
                      </div>
                    )}

                    {!showLocationPrompt && (
                      <button className="location-refresh-btn" onClick={requestLocation}>
                        🔄 실시간 위치 갱신
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="location-placeholder">
                    <div className="location-icon-large">📍</div>
                    <p className="location-coords">
                      {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                    </p>
                    <p style={{ fontSize: '13px', color: '#999', marginTop: '12px' }}>
                      {locationPermissionDenied ? '기본 위치 (부산)' : '현재 실시간 위치'}
                    </p>
                  </div>
                )}

                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  background: '#f0f9ff',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#0369a1',
                  textAlign: 'center'
                }}>
                  ✅ 위도: {currentLocation.lat.toFixed(6)} / 경도: {currentLocation.lng.toFixed(6)}
                  <br />
                  {locationPermissionDenied ?
                    '⚠️ 위치 권한이 거부되었습니다' :
                    '✓ 실시간 위치가 설정되었습니다'
                  }
                </div>
              </>
            )}
          </div>

          <button
            className="btn-next"
            onClick={handleNextStep}
            disabled={!currentLocation}
          >
            다음 단계 →
          </button>
        </div>
      )}

      {/* Step 2: Theme Selection */}
      {currentStep === 2 && (
        <div className="step-card">
          <div className="step-icon">🎨</div>
          <h2 className="step-title">어떤 분위기로</h2>
          <p className="step-subtitle">달려볼까요?</p>

          <div className="step-content">
            <div className="theme-cards">
              {themes.map((theme, index) => (
                <div
                  key={theme.id}
                  className={`theme-card ${selectedThemeIndex === index ? 'selected' : ''}`}
                  onClick={() => setSelectedThemeIndex(index)}
                >
                  <div className="theme-card-icon">{theme.icon}</div>
                  <h3 className="theme-card-title">{theme.label}</h3>
                  <p className="theme-card-desc">{theme.description || ''}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="step-navigation">
            <button className="btn-back" onClick={handlePrevStep}>
              ← 이전
            </button>
            <button
              className="btn-next"
              onClick={handleNextStep}
              disabled={themes.length === 0}
            >
              다음 단계 →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Distance & Difficulty */}
      {currentStep === 3 && (
        <div className="step-card">
          <div className="step-icon">⚡</div>
          <h2 className="step-title">거리와 난이도를</h2>
          <p className="step-subtitle">선택해주세요</p>

          <div className="step-content">
            {/* Distance Selector */}
            <div className="setting-group">
              <h3 className="setting-label">거리</h3>
              <div
                className="distance-slider"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {distances.length > 0 && (
                  <>
                    <div className="distance-value">
                      {distances[selectedDistanceIndex].label}
                    </div>
                    <div className="distance-time">
                      {distances[selectedDistanceIndex].duration || '약 30분'}
                    </div>
                    <div className="distance-dots">
                      {distances.map((_, index) => (
                        <span
                          key={index}
                          className={`dot ${index === selectedDistanceIndex ? 'active' : ''}`}
                          onClick={() => setSelectedDistanceIndex(index)}
                        />
                      ))}
                    </div>
                    <p className="swipe-hint">← 스와이프로 변경 →</p>
                  </>
                )}
              </div>
            </div>

            {/* Difficulty Selector */}
            <div className="setting-group">
              <h3 className="setting-label">난이도</h3>
              <div className="difficulty-buttons">
                {difficulties.map((diff) => (
                  <button
                    key={diff.id}
                    className={`difficulty-btn ${selectedDifficulty === diff.id ? 'selected' : ''}`}
                    onClick={() => setSelectedDifficulty(diff.id)}
                  >
                    {diff.icon} {diff.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="step-navigation">
            <button className="btn-back" onClick={handlePrevStep}>
              ← 이전
            </button>
            <button
              className="btn-next"
              onClick={handleNextStep}
              disabled={!selectedDifficulty || distances.length === 0}
            >
              다음 단계 →
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Generate Course */}
      {currentStep === 4 && (
        <div className="step-card">
          <div className="step-icon">🎯</div>
          <h2 className="step-title">모든 준비 완료!</h2>
          <p className="step-subtitle">맞춤 코스를 생성해드릴게요</p>

          <div className="step-content">
            <div className="summary-box">
              <div className="summary-item">
                <span className="summary-label">테마</span>
                <span className="summary-value">
                  {themes[selectedThemeIndex]?.icon} {themes[selectedThemeIndex]?.label}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">거리</span>
                <span className="summary-value">
                  {distances[selectedDistanceIndex]?.label}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">난이도</span>
                <span className="summary-value">
                  {difficulties.find(d => d.id === selectedDifficulty)?.icon}{' '}
                  {difficulties.find(d => d.id === selectedDifficulty)?.label}
                </span>
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
          </div>

          <div className="step-navigation">
            <button className="btn-back" onClick={handlePrevStep}>
              ← 이전
            </button>
            <button
              className="btn-generate"
              onClick={handleGenerateCourse}
              disabled={loading || !currentLocation}
            >
              {loading ? (
                <>
                  <div className="btn-loader"></div>
                  생성 중...
                </>
              ) : (
                '🏃 코스 생성하기'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
