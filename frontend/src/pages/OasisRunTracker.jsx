import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './OasisMatching.css';
import runwaveLogo from '../../image/image.png';
import image212 from '../../image/image-212.png';
import imageA from '../../image/a.png';
import imageB from '../../image/b.png';

const OasisRunTracker = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const polylineRef = useRef(null);
  const watchIdRef = useRef(null);
  const timerRef = useRef(null);

  const [pathPoints, setPathPoints] = useState([]);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [startTime] = useState(() => Date.now());
  const [currentLatLng, setCurrentLatLng] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const courseName = location.state?.courseName || '나의 러닝 코스';

  const formatTime = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const s = String(totalSec % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const calcTotalDistanceKm = (points) => {
    if (points.length < 2) return 0;
    const R = 6371000;
    const toRad = (deg) => (deg * Math.PI) / 180;
    let d = 0;
    for (let i = 1; i < points.length; i++) {
      const p1 = points[i - 1];
      const p2 = points[i];
      const dLat = toRad(p2.lat - p1.lat);
      const dLng = toRad(p2.lng - p1.lng);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(p1.lat)) *
          Math.cos(toRad(p2.lat)) *
          Math.sin(dLng / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      d += R * c;
    }
    return d / 1000;
  };

  useEffect(() => {
    if (!window.kakao || !window.kakao.maps || !mapContainerRef.current) return;

    const kakao = window.kakao;
    const initialCenter = new kakao.maps.LatLng(35.1595, 129.1600);
    const map = new kakao.maps.Map(mapContainerRef.current, {
      center: initialCenter,
      level: 5,
    });
    mapRef.current = map;

    const polyline = new kakao.maps.Polyline({
      map,
      path: [],
      strokeWeight: 6,
      strokeColor: '#ff784c',
      strokeOpacity: 0.9,
      strokeStyle: 'solid',
    });
    polylineRef.current = polyline;

    return () => {
      polyline.setMap(null);
    };
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTime);
    }, 1000);

    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCurrentLatLng({ lat: latitude, lng: longitude });

          setPathPoints((prev) => {
            const next = [...prev, { lat: latitude, lng: longitude }];

            if (mapRef.current && window.kakao && window.kakao.maps) {
              const kakao = window.kakao;
              const latLngs = next.map(
                (p) => new kakao.maps.LatLng(p.lat, p.lng)
              );
              if (polylineRef.current) {
                polylineRef.current.setPath(latLngs);
              }
              const latest = latLngs[latLngs.length - 1];
              mapRef.current.setCenter(latest);
            }

            return next;
          });
        },
        (err) => {
          console.error('Geolocation error:', err);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (watchIdRef.current && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [startTime]);

  const handleFinishRun = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (watchIdRef.current && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    const totalTimeMs = Date.now() - startTime;
    const totalDistanceKm = calcTotalDistanceKm(pathPoints);

    navigate('/oasis/result', {
      state: {
        distanceKm: totalDistanceKm,
        durationMs: totalTimeMs,
        courseName,
      },
    });
  };

  return (
    <div className="course-result-container oasis-matching-page">
      <div className="header-section">
        <img className="runwave-logo" alt="Runwave" src={runwaveLogo} />
        <img className="profile-icon" alt="Profile" src={image212} />
      </div>

      <div className="divider" />

      <div className="page-title">
        <div className="step-label">OASIS Run</div>
        <div className="step-description">러닝 중입니다</div>
      </div>

      <div className="run-tracker-info">
        <div className="run-tracker-course">{courseName}</div>
        <div className="run-tracker-stats">
          <div className="stat-item">
            <div className="stat-label">경과 시간</div>
            <div className="stat-value">{formatTime(elapsedMs)}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">현재 거리</div>
            <div className="stat-value">{calcTotalDistanceKm(pathPoints).toFixed(2)} km</div>
          </div>
        </div>
      </div>

      <div className="map-section oasis-map-container">
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }}>
          {!currentLatLng && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: '#666'
            }}>
              <p>현재 위치를 불러오는 중...</p>
            </div>
          )}
        </div>
      </div>

      <button className="start-running-button" onClick={handleFinishRun}>
        ⏹️ 런닝 중지
      </button>

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
};

export default OasisRunTracker;
