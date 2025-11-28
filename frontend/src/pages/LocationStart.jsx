import React, { useState, useEffect, useRef } from 'react';
import image212 from "../../image/image-212.png";
import image214 from "../../image/image-214.png";
import runwaveLogo from "../../image/image.png";
import './LocationStart.css';

export const LocationStart = () => {
  const mapContainer = useRef(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    // Wait for Kakao SDK
    const checkSDK = setInterval(() => {
      if (window.kakao && window.kakao.maps) {
        clearInterval(checkSDK);
        setIsMapReady(true);
        getCurrentLocation();
      }
    }, 100);

    return () => clearInterval(checkSDK);
  }, []);

  const getCurrentLocation = () => {
    // Kakao Maps SDK 확인
    if (!window.kakao || !window.kakao.maps) {
      console.error('카카오맵 SDK가 로드되지 않았습니다.');
      alert('지도 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    console.log('🔍 실시간 위치 요청 중...');

    // HTML5 Geolocation API로 위치 가져오기
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = position.coords.accuracy;

          console.log('✅ 위치 수신 성공:');
          console.log(`   위도: ${lat}`);
          console.log(`   경도: ${lng}`);
          console.log(`   정확도: ${accuracy}m`);

          // 카카오 Geocoder로 주소 확인 (선택사항)
          if (window.kakao.maps.services) {
            const geocoder = new window.kakao.maps.services.Geocoder();
            geocoder.coord2Address(lng, lat, (result, status) => {
              if (status === window.kakao.maps.services.Status.OK) {
                const address = result[0].address.address_name;
                console.log('📍 주소:', address);
              }
            });
          }

          setCurrentLocation({ lat, lng });
          displayMap(lat, lng);
        },
        (error) => {
          console.error('❌ 위치 오류:', error);

          if (error.code === 1) {
            alert('위치 권한이 필요합니다.\n브라우저 설정에서 위치 권한을 허용해주세요.');
          } else if (error.code === 2) {
            alert('위치 정보를 사용할 수 없습니다.\nGPS가 꺼져있거나 신호가 약할 수 있습니다.');
          } else if (error.code === 3) {
            alert('위치 요청 시간이 초과되었습니다.\n다시 시도해주세요.');
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      alert('이 브라우저는 위치 서비스를 지원하지 않습니다.');
    }
  };

  const displayMap = (lat, lng) => {
    if (!mapContainer.current || !window.kakao || !window.kakao.maps) return;

    const mapOption = {
      center: new window.kakao.maps.LatLng(lat, lng),
      level: 3
    };

    const map = new window.kakao.maps.Map(mapContainer.current, mapOption);

    // 현재 위치 마커 표시 - image-214를 마커로 사용
    const displayMarker = (locPosition) => {
      // 커스텀 마커 이미지 설정 (image-214)
      const imageSrc = image214;
      const imageSize = new window.kakao.maps.Size(50, 50);
      const imageOption = { offset: new window.kakao.maps.Point(25, 50) };

      const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

      const marker = new window.kakao.maps.Marker({
        map: map,
        position: locPosition,
        image: markerImage
      });

      // 현재 위치 인포윈도우
      const infoWindow = new window.kakao.maps.InfoWindow({
        content: '<div style="padding:8px 12px;font-size:13px;font-weight:600;color:#ff784c;">현재 위치</div>'
      });
      infoWindow.open(map, marker);

      // 지도 중심좌표를 접속위치로 변경
      map.setCenter(locPosition);
    };

    const locPosition = new window.kakao.maps.LatLng(lat, lng);
    displayMarker(locPosition);

    // 컨트롤 추가
    const zoomControl = new window.kakao.maps.ZoomControl();
    map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);
  };

  const handleNext = () => {
    if (currentLocation) {
      localStorage.setItem('userLocation', JSON.stringify(currentLocation));
      console.log('✅ 현재 위치 저장됨:', currentLocation);
      // ThemeSelector 페이지로 이동
      window.location.href = '/theme-selector';
    } else {
      alert('위치 정보를 먼저 확인해주세요.');
    }
  };

  return (
    <div className="location-start-container">
      {/* 헤더 영역 */}
      <div className="header-section">
        <img className="runwave-logo" alt="Runwave" src={runwaveLogo} />
        <img className="profile-icon" alt="Profile" src={image212} />
      </div>

      {/* 구분선 */}
      <div className="divider" />

      {/* 진행 바 */}
      <div className="progress-bar">
        <div className="progress-step active"></div>
        <div className="progress-step"></div>
        <div className="progress-step"></div>
        <div className="progress-step"></div>
      </div>

      {/* 제목 텍스트 */}
      <h1 className="greeting-text">
        반가워요 러너님!
        <br />
        오늘은 어디서 달리시나요?
      </h1>

      {/* 카카오 맵 컨테이너 */}
      <div className="map-wrapper">
        <div
          ref={mapContainer}
          className="map-container"
        >
          {!isMapReady && (
            <div className="map-loading">
              <div className="loading-spinner"></div>
              <p>지도 로딩 중</p>
            </div>
          )}
        </div>
      </div>

      {/* Next 버튼 */}
      <button
        className="next-button"
        onClick={handleNext}
        disabled={!currentLocation}
      >
        여기서 시작하기 (Next)
      </button>
    </div>
  );
};

export default LocationStart;
