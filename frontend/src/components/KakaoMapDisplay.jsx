import { useEffect, useRef, useState } from 'react';
import './KakaoMapDisplay.css';

function KakaoMapDisplay({
  route = null,
  height = '500px',
  center = null,
  showMarkers = true, // 마커 표시 여부
  oasisLocations = [] // 오아시스 위치
}) {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const currentLocationMarkerRef = useRef(null);
  const watchIdRef = useRef(null);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [, setCurrentLocation] = useState(null);
  const [isTrackingLocation] = useState(true);

  // SDK loading detection
  useEffect(() => {
    let checkCount = 0;
    const maxChecks = 50; // 5 seconds total (100ms * 50)

    const checkKakaoLoaded = setInterval(() => {
      checkCount++;

      if (window.kakao && window.kakao.maps) {
        clearInterval(checkKakaoLoaded);
        setIsSDKLoaded(true);
        console.log('✅ Kakao Maps SDK loaded successfully');
      } else if (checkCount >= maxChecks) {
        clearInterval(checkKakaoLoaded);
        setLoadError(true);
        console.error('❌ Kakao Maps SDK failed to load after 5 seconds');
      }
    }, 100);

    return () => clearInterval(checkKakaoLoaded);
  }, []);

  // Map initialization
  useEffect(() => {
    if (!isSDKLoaded || !mapContainer.current) return;

    // Direct initialization as per Kakao official guide
    const mapOption = {
      center: center
        ? new window.kakao.maps.LatLng(center.lat, center.lng)
        : new window.kakao.maps.LatLng(35.1595, 129.1600), // Default: Busan
      level: 5
    };

    const map = new window.kakao.maps.Map(mapContainer.current, mapOption);
    mapInstance.current = map;

    // Add map controls
    const zoomControl = new window.kakao.maps.ZoomControl();
    map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

    const mapTypeControl = new window.kakao.maps.MapTypeControl();
    map.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT);

    return () => {
      // Cleanup
      clearMarkers();
      clearPolyline();
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isSDKLoaded, center]);

  // 실시간 위치 추적
  useEffect(() => {
    if (!isSDKLoaded || !mapInstance.current || !isTrackingLocation) return;

    if (navigator.geolocation) {
      // 실시간 위치 추적 시작
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const newLocation = { lat, lng };

          setCurrentLocation(newLocation);
          console.log('📍 실시간 위치 업데이트:', newLocation);

          // 현재 위치 마커 업데이트
          updateCurrentLocationMarker(lat, lng);
        },
        (error) => {
          console.error('❌ 위치 추적 오류:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );

      // 초기 위치 가져오기
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const locPosition = new window.kakao.maps.LatLng(lat, lng);

          setCurrentLocation({ lat, lng });
          mapInstance.current.setCenter(locPosition);
          updateCurrentLocationMarker(lat, lng);

          console.log('✅ 초기 위치 설정:', { lat, lng });
        },
        (error) => {
          console.error('❌ 초기 위치 가져오기 실패:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isSDKLoaded, isTrackingLocation]);

  // 현재 위치 마커 업데이트
  const updateCurrentLocationMarker = (lat, lng) => {
    if (!mapInstance.current) return;

    // 기존 마커 제거
    if (currentLocationMarkerRef.current) {
      currentLocationMarkerRef.current.setMap(null);
    }

    // 현재 위치 마커 이미지 (빨간색 핀)
    const imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png';
    const imageSize = new window.kakao.maps.Size(35, 45);
    const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize);

    const markerPosition = new window.kakao.maps.LatLng(lat, lng);
    const marker = new window.kakao.maps.Marker({
      position: markerPosition,
      map: mapInstance.current,
      image: markerImage,
      zIndex: 100
    });

    const infoWindow = new window.kakao.maps.InfoWindow({
      content: '<div style="padding:8px 12px;font-size:13px;font-weight:600;color:#ff4444;">📍 현재 위치</div>'
    });
    infoWindow.open(mapInstance.current, marker);

    currentLocationMarkerRef.current = marker;
  };

  // 위치 새로고침 핸들러
  const handleRefreshLocation = () => {
    if (!navigator.geolocation) {
      alert('위치 서비스를 사용할 수 없습니다.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const locPosition = new window.kakao.maps.LatLng(lat, lng);

        setCurrentLocation({ lat, lng });
        mapInstance.current.setCenter(locPosition);
        updateCurrentLocationMarker(lat, lng);

        console.log('🔄 위치 새로고침 완료:', { lat, lng });
      },
      (error) => {
        console.error('❌ 위치 새로고침 실패:', error);
        alert('위치를 가져올 수 없습니다. 위치 서비스를 확인해주세요.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  useEffect(() => {
    if (!isSDKLoaded || !mapInstance.current || !route || !route.waypoints) return;

    // Clear previous route and markers
    clearMarkers();
    clearPolyline();

    const waypoints = route.waypoints;
    if (waypoints.length === 0) return;

    // Create polyline for route
    const linePath = waypoints.map(point =>
      new window.kakao.maps.LatLng(point.lat, point.lng)
    );

    // Draw running path
    const polyline = new window.kakao.maps.Polyline({
      path: linePath,
      strokeWeight: 5,
      strokeColor: '#667eea',
      strokeOpacity: 0.8,
      strokeStyle: 'solid'
    });

    polyline.setMap(mapInstance.current);
    polylineRef.current = polyline;

    // showMarkers가 true일 때만 마커 표시
    if (showMarkers) {
      // Add start marker (기본 마커 사용)
      const startMarker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(waypoints[0].lat, waypoints[0].lng),
        map: mapInstance.current
      });

      const startInfoWindow = new window.kakao.maps.InfoWindow({
        content: '<div style="padding:8px 12px;font-size:13px;font-weight:600;color:#3b82f6;">🏁 출발지</div>'
      });
      startInfoWindow.open(mapInstance.current, startMarker);
      markersRef.current.push(startMarker);

      // Add end marker (기본 마커 사용)
      const endPoint = waypoints[waypoints.length - 1];
      const endMarker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(endPoint.lat, endPoint.lng),
        map: mapInstance.current
      });

      const endInfoWindow = new window.kakao.maps.InfoWindow({
        content: '<div style="padding:8px 12px;font-size:13px;font-weight:600;color:#3b82f6;">🏁 도착지</div>'
      });
      endInfoWindow.open(mapInstance.current, endMarker);
      markersRef.current.push(endMarker);
    }

    // Adjust map bounds to show entire route
    const bounds = new window.kakao.maps.LatLngBounds();
    waypoints.forEach(point => {
      bounds.extend(new window.kakao.maps.LatLng(point.lat, point.lng));
    });
    mapInstance.current.setBounds(bounds);

  }, [isSDKLoaded, route, showMarkers]);

  // 오아시스 마커 표시 (Start 버튼 클릭 후)
  useEffect(() => {
    if (!isSDKLoaded || !mapInstance.current || !oasisLocations || oasisLocations.length === 0) return;

    console.log('🏪 Displaying oasis markers:', oasisLocations.length);

    // Clear previous oasis markers only
    const oasisMarkers = markersRef.current.filter(item => item.isOasis);
    oasisMarkers.forEach(item => {
      if (item.marker) {
        item.marker.setMap(null);
        if (item.infoWindow) item.infoWindow.close();
      }
    });
    markersRef.current = markersRef.current.filter(item => !item.isOasis);

    // Add oasis markers
    oasisLocations.forEach((oasis) => {
      const markerPosition = new window.kakao.maps.LatLng(oasis.lat, oasis.lng);

      // 오아시스 마커 이미지 (별 모양)
      const imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png';
      const imageSize = new window.kakao.maps.Size(30, 35);
      const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize);

      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
        map: mapInstance.current,
        image: markerImage
      });

      // Info window
      const icon = oasis.type === 'restaurant' ? '🍽️' : oasis.type === 'cafe' ? '☕' : '🏛️';
      const infoContent = `
        <div style="padding:10px;min-width:150px;">
          <h4 style="margin:0 0 5px 0;font-size:14px;">${icon} ${oasis.name || '오아시스'}</h4>
          <p style="margin:0;font-size:12px;color:#666;">${oasis.address || oasis.description || ''}</p>
        </div>
      `;

      const infoWindow = new window.kakao.maps.InfoWindow({
        content: infoContent
      });

      // Add click event
      window.kakao.maps.event.addListener(marker, 'click', function() {
        infoWindow.open(mapInstance.current, marker);
      });

      markersRef.current.push({ marker, infoWindow, isOasis: true });
    });

  }, [isSDKLoaded, oasisLocations]);

  const clearMarkers = () => {
    markersRef.current.forEach(item => {
      if (item.marker) {
        item.marker.setMap(null);
        if (item.infoWindow) {
          item.infoWindow.close();
        }
      } else {
        item.setMap(null);
      }
    });
    markersRef.current = [];
  };


  const clearPolyline = () => {
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }
  };

  return (
    <div className="kakao-map-display">
      {!isSDKLoaded && !loadError && (
        <div className="map-loading">
          <p>🗺️ 지도를 불러오는 중...</p>
        </div>
      )}
      {loadError && (
        <div className="map-error">
          <p>⚠️ 지도를 불러올 수 없습니다</p>
          <button onClick={() => window.location.reload()}>새로고침</button>
        </div>
      )}
      <div
        ref={mapContainer}
        className="map-container"
        style={{
          height,
          display: isSDKLoaded ? 'block' : 'none'
        }}
      />
      {isSDKLoaded && (
        <button
          className="location-refresh-btn"
          onClick={handleRefreshLocation}
          title="현재 위치로 이동"
        >
          📍
        </button>
      )}
      {isSDKLoaded && (!route || !route.waypoints || route.waypoints.length === 0) && (
        <div className="map-placeholder">
          <p>🗺️ 코스를 생성하면 지도에 표시됩니다</p>
        </div>
      )}
    </div>
  );
}

export default KakaoMapDisplay;
