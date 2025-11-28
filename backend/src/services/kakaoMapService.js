import axios from 'axios';
import dotenv from 'dotenv';
import localDataService from './localDataService.js';
import { getGoogleDirectionsService } from './googleDirectionsService.js';

dotenv.config();

class KakaoMapService {
  constructor() {
    this.restApiKey = process.env.KAKAO_REST_API_KEY;
    this.tmapApiKey = process.env.TMAP_API_KEY;
    this.localApiUrl = 'https://dapi.kakao.com/v2/local';
    this.naviApiUrl = 'https://apis-navi.kakaomobility.com/v1';
    this.tmapApiUrl = 'https://apis.openapi.sk.com/tmap/routes';
    this.googleDirectionsService = getGoogleDirectionsService();
  }

  /**
   * 카카오 Local API로 주소 검색
   * @param {number} lat - 위도
   * @param {number} lng - 경도
   * @returns {Promise<Object>} 주소 정보
   */
  async getAddressFromCoords(lat, lng) {
    try {
      const response = await axios.get(`${this.localApiUrl}/geo/coord2address.json`, {
        headers: {
          'Authorization': `KakaoAK ${this.restApiKey}`
        },
        params: {
          x: lng,
          y: lat
        }
      });

      if (response.data.documents && response.data.documents.length > 0) {
        const doc = response.data.documents[0];
        return {
          address: doc.address?.address_name || '주소 없음',
          roadAddress: doc.road_address?.address_name || '',
          region: doc.address?.region_2depth_name || '부산'
        };
      }
      return { address: '주소 없음', roadAddress: '', region: '부산' };
    } catch (error) {
      console.error('Error getting address from coords:', error.message);
      return { address: '주소 없음', roadAddress: '', region: '부산' };
    }
  }

  /**
   * SK Tmap API를 사용한 실제 보행자 경로 생성 (실제 도보 가능 경로)
   * @param {Object} origin - 출발지 {lat, lng, name}
   * @param {Object} destination - 도착지 {lat, lng, name}
   * @returns {Promise<Object>} 보행자 경로 정보
   */
  async getTmapPedestrianRoute(origin, destination) {
    try {
      if (!this.tmapApiKey || this.tmapApiKey === 'your_tmap_api_key_here') {
        console.warn('⚠️ Tmap API key not configured, using fallback');
        return { success: false };
      }

      console.log('🚶 SK Tmap Pedestrian API - 보행자 경로 요청');
      console.log('출발:', origin);
      console.log('도착:', destination);

      const requestData = {
        startX: String(origin.lng),
        startY: String(origin.lat),
        endX: String(destination.lng),
        endY: String(destination.lat),
        startName: origin.name || '출발지',
        endName: destination.name || '도착지',
        reqCoordType: 'WGS84GEO',
        resCoordType: 'WGS84GEO',
        searchOption: '0' // 0: 추천, 1: 최단거리, 2: 최소시간
      };

      const response = await axios.post(
        `${this.tmapApiUrl}/pedestrian?version=1`,
        requestData,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'appKey': this.tmapApiKey
          }
        }
      );

      if (response.data && response.data.features) {
        const features = response.data.features;
        const allPoints = [];
        let totalDistance = 0;
        let totalTime = 0;

        // GeoJSON 형식에서 경로 포인트 추출
        features.forEach(feature => {
          if (feature.geometry && feature.geometry.type === 'LineString') {
            const coordinates = feature.geometry.coordinates;
            coordinates.forEach(coord => {
              allPoints.push({
                lng: coord[0],
                lat: coord[1]
              });
            });
          }

          // 거리 및 시간 정보 수집
          if (feature.properties) {
            totalDistance += feature.properties.distance || 0;
            totalTime += feature.properties.time || 0;
          }
        });

        console.log(`✅ Tmap Pedestrian API 성공: ${allPoints.length}개 포인트, ${(totalDistance / 1000).toFixed(1)}km`);

        return {
          success: true,
          distance: totalDistance, // meters
          duration: totalTime, // seconds
          points: allPoints
        };
      }

      console.warn('⚠️ Tmap API에서 경로를 찾지 못함');
      return { success: false };

    } catch (error) {
      console.error('❌ Tmap Pedestrian API 오류:', error.response?.data || error.message);
      return { success: false };
    }
  }

  /**
   * Kakao Mobility Navi API를 사용한 실제 도보 경로 생성
   * @param {Object} origin - 출발지 {lat, lng}
   * @param {Object} destination - 도착지 {lat, lng}
   * @param {Array} waypoints - 경유지 (최대 5개)
   * @returns {Promise<Object>} 도보 경로 정보
   */
  async getWalkingRouteWithNaviAPI(origin, destination, waypoints = []) {
    try {
      console.log('🚶 Kakao Mobility Navi API - 도보 경로 요청');
      console.log('출발:', origin);
      console.log('도착:', destination);
      console.log('경유지:', waypoints.length);

      // Kakao Navi API 요청 형식: origin=lng,lat&destination=lng,lat&waypoints=lng1,lat1|lng2,lat2
      const params = {
        origin: `${origin.lng},${origin.lat}`,
        destination: `${destination.lng},${destination.lat}`,
        priority: 'RECOMMEND', // RECOMMEND, TIME, DISTANCE
        road_type: 'BIKE', // BIKE는 도보/자전거 도로 우선
      };

      // 경유지가 있으면 추가 (최대 5개)
      if (waypoints.length > 0) {
        const waypointsStr = waypoints
          .slice(0, 5)
          .map(wp => `${wp.lng},${wp.lat}`)
          .join('|');
        params.waypoints = waypointsStr;
      }

      const response = await axios.get(`${this.naviApiUrl}/directions`, {
        headers: {
          'Authorization': `KakaoAK ${this.restApiKey}`,
          'Content-Type': 'application/json'
        },
        params
      });

      if (response.data && response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        const sections = route.sections || [];

        // 모든 섹션의 경로 포인트 수집
        const allPoints = [];
        let totalDistance = 0;
        let totalDuration = 0;

        sections.forEach(section => {
          totalDistance += section.distance || 0;
          totalDuration += section.duration || 0;

          // 각 섹션의 도로 정보에서 경로 포인트 추출
          if (section.roads && section.roads.length > 0) {
            section.roads.forEach(road => {
              if (road.vertexes && road.vertexes.length > 0) {
                // vertexes는 [lng, lat, lng, lat, ...] 형식
                for (let i = 0; i < road.vertexes.length; i += 2) {
                  allPoints.push({
                    lng: road.vertexes[i],
                    lat: road.vertexes[i + 1]
                  });
                }
              }
            });
          }
        });

        console.log(`✅ Navi API 경로 생성 완료: ${allPoints.length}개 포인트, ${(totalDistance / 1000).toFixed(1)}km`);

        return {
          success: true,
          distance: totalDistance, // meters
          duration: totalDuration, // seconds
          points: allPoints
        };
      }

      console.warn('⚠️ Navi API에서 경로를 찾지 못함, Fallback 사용');
      return this.getWalkingRouteFallback(origin, destination, waypoints);

    } catch (error) {
      console.error('❌ Kakao Navi API 오류:', error.response?.data || error.message);
      console.log('🔄 Fallback 경로 생성 사용');
      return this.getWalkingRouteFallback(origin, destination, waypoints);
    }
  }

  /**
   * Fallback: 간소화된 자연스러운 경로 생성 (Bezier curve 사용)
   * @param {Object} origin - 출발지 {lat, lng}
   * @param {Object} destination - 도착지 {lat, lng}
   * @param {Array} waypoints - 경유지
   * @returns {Promise<Object>} 도보 경로 정보
   */
  async getWalkingRouteFallback(origin, destination, waypoints = []) {
    try {
      const allPoints = [];

      // 시작점 추가
      allPoints.push({ lat: origin.lat, lng: origin.lng });

      // 각 구간마다 부드러운 곡선으로 연결
      let currentPoint = origin;
      const allWaypoints = waypoints.length > 0 ? waypoints : [];
      allWaypoints.push(destination);

      allWaypoints.forEach(nextPoint => {
        const intermediatePoints = this.generateSmoothPath(currentPoint, nextPoint);
        allPoints.push(...intermediatePoints);
        currentPoint = nextPoint;
      });

      // 거리 계산
      let totalDistance = 0;
      for (let i = 0; i < allPoints.length - 1; i++) {
        totalDistance += this.calculateDistance(
          allPoints[i].lat, allPoints[i].lng,
          allPoints[i + 1].lat, allPoints[i + 1].lng
        );
      }

      // 도보 속도 기준 (평균 5km/h)
      const walkingSpeed = 5;
      const duration = (totalDistance / walkingSpeed) * 3600;

      return {
        success: true,
        distance: totalDistance * 1000,
        duration: duration,
        points: allPoints
      };
    } catch (error) {
      console.error('Error generating fallback walking route:', error.message);
      return { success: false, points: [] };
    }
  }

  /**
   * 도보 경로 생성 - 여러 API를 시도하여 최상의 보행자 경로 제공
   * 우선순위: 1) Google Directions API (도보 모드, 가장 안정적)
   *          2) SK Tmap Pedestrian API (실제 보행 가능 경로)
   *          3) Kakao Navi API (BIKE road_type)
   *          4) Bezier Curve Fallback (부드러운 예상 경로)
   */
  async getWalkingRoute(origin, destination, waypoints = []) {
    // 1순위: Google Directions API (가장 안정적이고 정확함)
    console.log('🔄 Trying Google Directions API...');
    const googleResult = await this.googleDirectionsService.getWalkingRoute(origin, destination, waypoints);
    if (googleResult.success) {
      console.log('✅ Using Google Directions API for walking route');
      return googleResult;
    }

    // 2순위: 경유지가 없는 경우, SK Tmap Pedestrian API 사용 (가장 정확한 보행자 경로)
    if (waypoints.length === 0) {
      const tmapResult = await this.getTmapPedestrianRoute(origin, destination);
      if (tmapResult.success) {
        console.log('✅ Using Tmap Pedestrian API for accurate walking route');
        return tmapResult;
      }
    }

    // 3순위: Tmap 실패 또는 경유지가 있는 경우, Kakao Navi API 시도
    console.log('🔄 Trying Kakao Navi API...');
    return this.getWalkingRouteWithNaviAPI(origin, destination, waypoints);
  }

  /**
   * 두 점 사이를 부드러운 곡선으로 연결
   * @param {Object} start - 시작점 {lat, lng}
   * @param {Object} end - 끝점 {lat, lng}
   * @returns {Array} 중간 포인트 배열
   */
  generateSmoothPath(start, end) {
    const points = [];
    const segments = 8; // 구간당 포인트 개수

    // 약간의 곡선을 만들기 위한 제어점 생성
    const midLat = (start.lat + end.lat) / 2;
    const midLng = (start.lng + end.lng) / 2;

    // 수직 방향으로 약간 오프셋 (자연스러운 경로를 위해)
    const perpLat = -(end.lng - start.lng) * 0.15;
    const perpLng = (end.lat - start.lat) * 0.15;

    const controlLat = midLat + perpLat;
    const controlLng = midLng + perpLng;

    // Quadratic Bezier curve로 부드러운 경로 생성
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const lat = Math.pow(1 - t, 2) * start.lat +
                 2 * (1 - t) * t * controlLat +
                 Math.pow(t, 2) * end.lat;
      const lng = Math.pow(1 - t, 2) * start.lng +
                 2 * (1 - t) * t * controlLng +
                 Math.pow(t, 2) * end.lng;

      points.push({ lat, lng });
    }

    return points;
  }

  /**
   * 러닝 코스 생성 (카카오 API 활용)
   * @param {Object} start - 시작 지점 {lat, lng, name}
   * @param {Object} end - 종료 지점 {lat, lng, name}
   * @param {Array} waypoints - 경유지 배열
   * @param {string} targetDistance - 목표 거리 (예: '5km')
   * @returns {Promise<Object>} 경로 정보
   */
  async generateRunningRoute(start, end, waypoints = [], targetDistance = '5km') {
    try {
      console.log('🗺️ Generating walking route with Kakao API...');
      console.log('Start:', start);
      console.log('Waypoints:', waypoints.length);

      // 순환 코스를 위해 경유지들을 순서대로 연결
      const segments = [];
      let currentPoint = start;
      const allWaypoints = [...waypoints];

      // 순환을 위해 마지막에 시작점 추가
      if (end.lat === start.lat && end.lng === start.lng) {
        // 이미 순환 코스
      } else {
        allWaypoints.push(end);
      }

      // 각 구간별로 카카오 API 호출해서 실제 도보 경로 가져오기
      const allRoutePoints = [{ lat: start.lat, lng: start.lng, name: start.name }];
      let totalDistance = 0;
      let totalDuration = 0;

      // 경유지가 너무 많으면 일부만 사용 (카카오 API 제한)
      const selectedWaypoints = allWaypoints.length > 3
        ? [allWaypoints[0], allWaypoints[Math.floor(allWaypoints.length / 2)], allWaypoints[allWaypoints.length - 1]]
        : allWaypoints;

      for (let i = 0; i < selectedWaypoints.length; i++) {
        const nextPoint = selectedWaypoints[i];

        console.log(`🚶 Fetching route segment ${i + 1}/${selectedWaypoints.length}...`);

        // 카카오 도보 경로 API 호출
        const routeResult = await this.getWalkingRoute(currentPoint, nextPoint, []);

        if (routeResult.success && routeResult.points.length > 0) {
          // API에서 받은 상세 경로 포인트 추가
          routeResult.points.forEach(point => {
            allRoutePoints.push({
              lat: point.lat,
              lng: point.lng,
              name: `경로 포인트 ${allRoutePoints.length}`
            });
          });
          totalDistance += routeResult.distance;
          totalDuration += routeResult.duration;
        } else {
          // API 실패시 직선으로 연결
          console.warn(`⚠️ Kakao API failed for segment ${i + 1}, using straight line`);
          allRoutePoints.push({
            lat: nextPoint.lat,
            lng: nextPoint.lng,
            name: nextPoint.name
          });
          totalDistance += this.calculateDistance(
            currentPoint.lat, currentPoint.lng,
            nextPoint.lat, nextPoint.lng
          ) * 1000; // km to meters
        }

        currentPoint = nextPoint;
      }

      // 마지막: 시작점으로 돌아오기 (순환)
      if (allWaypoints.length > 0) {
        const lastWaypoint = allWaypoints[allWaypoints.length - 1];
        if (lastWaypoint.lat !== start.lat || lastWaypoint.lng !== start.lng) {
          console.log('🔄 Creating return route to start...');
          const returnRoute = await this.getWalkingRoute(lastWaypoint, start, []);

          if (returnRoute.success && returnRoute.points.length > 0) {
            returnRoute.points.forEach(point => {
              allRoutePoints.push({ lat: point.lat, lng: point.lng, name: '돌아오는 길' });
            });
            totalDistance += returnRoute.distance;
            totalDuration += returnRoute.duration;
          } else {
            allRoutePoints.push({ lat: start.lat, lng: start.lng, name: '도착지 (출발지)' });
          }
        }
      }

      // 중심점 계산
      const centerLat = allRoutePoints.reduce((sum, p) => sum + p.lat, 0) / allRoutePoints.length;
      const centerLng = allRoutePoints.reduce((sum, p) => sum + p.lng, 0) / allRoutePoints.length;

      console.log(`✅ Route generated: ${allRoutePoints.length} points, ${(totalDistance / 1000).toFixed(1)}km`);

      return {
        route: allRoutePoints,        // 경로 포인트 배열
        waypoints: allRoutePoints,    // waypoints도 유지 (호환성)
        center: { lat: centerLat, lng: centerLng },
        totalDistance: `${(totalDistance / 1000).toFixed(1)}km`,
        duration: `${Math.round(totalDuration / 60)}분`,
        elevation: this.estimateElevation(allRoutePoints) + 'm',
        routeType: 'walking', // 도보 경로
        pointCount: allRoutePoints.length
      };
    } catch (error) {
      console.error('Error generating running route:', error);

      // Fallback: 시작점과 경유지만으로 간단한 경로
      const allPoints = [start, ...waypoints];
      if (end.lat !== start.lat || end.lng !== start.lng) {
        allPoints.push(end);
      }
      allPoints.push(start); // 순환

      return {
        route: allPoints,        // 경로 포인트 배열
        waypoints: allPoints,    // waypoints도 유지 (호환성)
        center: {
          lat: (start.lat + end.lat) / 2,
          lng: (start.lng + end.lng) / 2
        },
        totalDistance: targetDistance,
        elevation: '50m',
        routeType: 'simple'
      };
    }
  }

  /**
   * 코스 근처 오아시스 찾기
   * @param {Array} routePoints - 경로 포인트 배열
   * @param {Array} oasisData - 오아시스 후보 데이터
   * @param {number} maxDistance - 최대 거리 (km)
   * @returns {Array} 근처 오아시스 배열
   */
  findNearbyOasis(routePoints, oasisData, maxDistance = 0.5) {
    const nearbyOasis = [];

    oasisData.forEach(oasis => {
      // 각 경로 포인트에 대해 거리 확인
      const minDistance = Math.min(
        ...routePoints.map(point =>
          this.calculateDistance(point.lat, point.lng, oasis.lat, oasis.lng)
        )
      );

      if (minDistance <= maxDistance) {
        nearbyOasis.push({
          ...oasis,
          distanceFromRoute: minDistance.toFixed(2)
        });
      }
    });

    return nearbyOasis;
  }

  /**
   * 특정 지역의 주요 포인트 가져오기
   * @param {string} districtId - 지역 ID
   * @param {string} themeId - 테마 ID
   * @param {Object} userLocation - 사용자 현재 위치 {lat, lng, name}
   * @returns {Promise<Array>} 주요 포인트 배열
   */
  async getDistrictPoints(districtId, themeId, userLocation = null) {
    // 사용자 위치가 제공되면 카카오 API로 실제 장소 검색
    if (userLocation && userLocation.lat && userLocation.lng) {
      return await this.generatePointsFromLocation(userLocation, districtId, themeId);
    }

    // 지역별 주요 러닝 포인트 (하드코딩 - MVP용)
    const points = {
      haeundae: {
        beach: [
          { lat: 35.1631, lng: 129.1635, name: '해운대역' },
          { lat: 35.1585, lng: 129.1603, name: '해운대 해수욕장 서쪽' },
          { lat: 35.1589, lng: 129.1650, name: '동백섬 입구' },
          { lat: 35.1600, lng: 129.1680, name: '미포' },
          { lat: 35.1631, lng: 129.1635, name: '해운대역 (도착)' }
        ],
        'night-view': [
          { lat: 35.1631, lng: 129.1635, name: '해운대역' },
          { lat: 35.1620, lng: 129.1670, name: '마린시티' },
          { lat: 35.1589, lng: 129.1650, name: '동백섬' },
          { lat: 35.1560, lng: 129.1590, name: '달맞이길 입구' },
          { lat: 35.1631, lng: 129.1635, name: '해운대역 (도착)' }
        ]
      },
      gwangalli: {
        beach: [
          { lat: 35.1532, lng: 129.1189, name: '광안리 해수욕장 시작' },
          { lat: 35.1540, lng: 129.1200, name: '광안리 중앙' },
          { lat: 35.1550, lng: 129.1210, name: '민락동 방향' },
          { lat: 35.1532, lng: 129.1189, name: '광안리 해수욕장 (도착)' }
        ],
        'night-view': [
          { lat: 35.1532, lng: 129.1189, name: '광안리 해수욕장' },
          { lat: 35.1540, lng: 129.1200, name: '광안대교 뷰포인트' },
          { lat: 35.1550, lng: 129.1220, name: '민락수변공원' },
          { lat: 35.1532, lng: 129.1189, name: '광안리 해수욕장 (도착)' }
        ]
      },
      songjeong: {
        beach: [
          { lat: 35.1785, lng: 129.2005, name: '송정역' },
          { lat: 35.1780, lng: 129.2000, name: '송정 해수욕장' },
          { lat: 35.1790, lng: 129.2010, name: '죽도공원 방향' },
          { lat: 35.1785, lng: 129.2005, name: '송정역 (도착)' }
        ]
      },
      nampo: {
        'urban-healing': [
          { lat: 35.0966, lng: 129.0279, name: '남포동 시작' },
          { lat: 35.0975, lng: 129.0290, name: '용두산공원' },
          { lat: 35.0980, lng: 129.0300, name: '광복동' },
          { lat: 35.0966, lng: 129.0279, name: '남포동 (도착)' }
        ]
      }
    };

    // 기본값
    const defaultPoints = [
      { lat: 35.1631, lng: 129.1635, name: '시작점' },
      { lat: 35.1650, lng: 129.1650, name: '경유지 1' },
      { lat: 35.1670, lng: 129.1630, name: '경유지 2' },
      { lat: 35.1631, lng: 129.1635, name: '도착점' }
    ];

    return points[districtId]?.[themeId] || defaultPoints;
  }

  /**
   * 카카오 Local API로 주변 장소 검색
   * @param {number} lat - 중심 위도
   * @param {number} lng - 중심 경도
   * @param {string} category - 카테고리 (CE7: 카페, FD6: 음식점, AT4: 관광명소)
   * @param {number} radius - 반경 (미터, 최대 20000)
   * @returns {Promise<Array>} 장소 리스트
   */
  async searchNearbyPlaces(lat, lng, category = 'FD6', radius = 1000) {
    try {
      const response = await axios.get(`${this.localApiUrl}/search/category.json`, {
        headers: {
          'Authorization': `KakaoAK ${this.restApiKey}`
        },
        params: {
          category_group_code: category,
          x: lng,
          y: lat,
          radius: radius,
          sort: 'distance'
        }
      });

      if (response.data.documents && response.data.documents.length > 0) {
        return response.data.documents.map(place => ({
          name: place.place_name,
          lat: parseFloat(place.y),
          lng: parseFloat(place.x),
          category: place.category_name,
          address: place.address_name,
          distance: place.distance
        }));
      }
      return [];
    } catch (error) {
      console.error('Error searching nearby places:', error.message);
      return [];
    }
  }

  /**
   * 사용자 위치 기반 실제 장소로 코스 포인트 생성 (카카오 API 활용)
   * @param {Object} userLocation - 사용자 위치 {lat, lng, name}
   * @param {string} themeId - 테마 ID
   * @param {number} distanceValue - 거리 (km)
   * @param {number} variationIndex - 변형 인덱스
   * @param {Object} markerLimits - 마커 개수 제한 {touristSpots, restaurants, waypoints}
   * @returns {Promise<Array>} 실제 장소 포인트 배열
   */
  async generatePointsFromLocation(userLocation, themeId, distanceValue = 5.0, variationIndex = 0, markerLimits = null) {
    const startLat = userLocation.lat;
    const startLng = userLocation.lng;

    // 기본 마커 제한 설정
    if (!markerLimits) {
      markerLimits = {
        touristSpots: Math.max(1, Math.floor(distanceValue / 3)),
        restaurants: Math.max(1, Math.min(3, Math.floor(distanceValue / 2))),
        waypoints: Math.max(2, Math.min(5, Math.floor(distanceValue / 2)))
      };
    }

    try {
      console.log(`🔍 Searching for places near ${startLat}, ${startLng}...`);
      console.log(`📏 Distance: ${distanceValue}km, Variation: ${variationIndex}`);
      console.log(`📊 Marker Limits:`, markerLimits);

      // 테마별 데이터 소스 및 검색 설정
      const themeConfig = {
        'beach': {
          dataSource: 'local',  // 공공데이터 사용
          type: 'touristSpots',
          radius: 1500,
          name: '관광명소'
        },
        'night-view': {
          dataSource: 'local',  // 공공데이터 사용
          type: 'touristSpots',
          radius: 2000,
          name: '전망대/야경'
        },
        'urban-healing': {
          dataSource: 'kakao',  // 카카오 API 유지
          category: 'CE7',
          radius: 1000,
          name: '카페'
        },
        'view-food': {
          dataSource: 'local',  // 공공데이터 사용
          type: 'restaurants',
          radius: 1500,
          name: '음식점'
        }
      };

      const config = themeConfig[themeId] || themeConfig['view-food'];

      // 거리에 따라 검색 반경 조정
      const baseRadius = config.radius;
      const adjustedRadius = Math.min(Math.round(baseRadius * (distanceValue / 5)), 3000);

      // 관광지와 음식점을 별도로 검색
      let touristSpots = [];
      let restaurants = [];

      // 1. 관광지 검색 (공공데이터)
      touristSpots = localDataService.searchNearbyTouristSpots(startLat, startLng, adjustedRadius);
      console.log(`🏛️ Found ${touristSpots.length} tourist spots`);

      // 2. 음식점 검색 (공공데이터)
      if (config.type === 'restaurants' || themeId === 'view-food') {
        restaurants = localDataService.searchNearbyRestaurants(startLat, startLng, adjustedRadius);
        console.log(`🍽️ Found ${restaurants.length} restaurants`);
      }

      // 3. 마커 개수 제한 적용
      const limitedTouristSpots = touristSpots.slice(0, markerLimits.touristSpots);
      const limitedRestaurants = restaurants.slice(0, markerLimits.restaurants);

      console.log(`✂️ Limited to ${limitedTouristSpots.length} tourist spots, ${limitedRestaurants.length} restaurants`);

      // 4. 경유지 구성: 관광지가 있으면 관광지 우선, 없으면 음식점만
      let waypoints = [];

      if (limitedTouristSpots.length > 0) {
        // 관광지가 있는 경우: 관광지 추가 (type을 명시적으로 지정)
        waypoints = limitedTouristSpots.map(spot => ({ ...spot, type: 'touristSpot' }));

        // 관광지 근처 음식점 추가 (각 관광지마다 가장 가까운 음식점 1개)
        limitedTouristSpots.forEach(spot => {
          const nearbyRestaurant = this.findClosestPlace(spot, limitedRestaurants);
          if (nearbyRestaurant && !waypoints.find(w => w.name === nearbyRestaurant.name)) {
            waypoints.push({ ...nearbyRestaurant, type: 'restaurant' });
          }
        });
      } else {
        // 관광지가 없는 경우: 음식점만 표시
        waypoints = limitedRestaurants.map(r => ({ ...r, type: 'restaurant' }));
      }

      if (waypoints.length === 0) {
        console.warn('⚠️ No places found, using fallback pattern');
        return this.generateFallbackPoints(userLocation, distanceValue);
      }

      console.log(`✅ Final waypoints: ${waypoints.length} places`);

      // 거리 기반으로 정렬하고 다양한 방향의 장소 선택 (순환 코스를 위해)
      const selectedPlaces = this.selectDiversePlaces(waypoints, startLat, startLng, Math.min(waypoints.length, markerLimits.waypoints), variationIndex);

      const points = [
        { lat: startLat, lng: startLng, name: userLocation.name || '출발지', type: 'start' },
        ...selectedPlaces.map(p => ({ ...p, type: p.type || 'waypoint' }))
      ];

      console.log('Selected waypoints:', selectedPlaces.map(p => p.name));

      return points;
    } catch (error) {
      console.error('Error generating points from location:', error);
      return this.generateFallbackPoints(userLocation, distanceValue);
    }
  }

  /**
   * 가장 가까운 장소 찾기
   * @param {Object} target - 대상 장소 {lat, lng}
   * @param {Array} places - 검색할 장소 배열
   * @returns {Object|null} 가장 가까운 장소
   */
  findClosestPlace(target, places) {
    if (places.length === 0) return null;

    let closest = places[0];
    let minDistance = this.calculateDistance(target.lat, target.lng, closest.lat, closest.lng);

    places.forEach(place => {
      const distance = this.calculateDistance(target.lat, target.lng, place.lat, place.lng);
      if (distance < minDistance) {
        minDistance = distance;
        closest = place;
      }
    });

    return closest;
  }

  /**
   * 다양한 방향의 장소 선택 (순환 코스를 위해)
   * @param {Array} places - 장소 배열
   * @param {number} centerLat - 중심 위도
   * @param {number} centerLng - 중심 경도
   * @param {number} count - 선택할 장소 수
   * @param {number} variationIndex - 변형 인덱스 (다른 경로 생성용)
   * @returns {Array} 선택된 장소
   */
  selectDiversePlaces(places, centerLat, centerLng, count = 3, variationIndex = 0) {
    if (places.length <= count) {
      return places;
    }

    // 각 장소의 방향 계산 (북, 남, 동, 서 등)
    const placesWithAngle = places.map(place => {
      const angle = Math.atan2(place.lat - centerLat, place.lng - centerLng);
      return { ...place, angle };
    });

    // 방향별로 정렬
    placesWithAngle.sort((a, b) => a.angle - b.angle);

    // 균등하게 분산된 장소 선택 (variationIndex로 시작 오프셋 조정)
    const selected = [];
    const step = Math.floor(placesWithAngle.length / count);
    const offset = variationIndex * Math.floor(step / 3); // 변형마다 약간씩 다른 시작점

    for (let i = 0; i < count; i++) {
      const index = (i * step + offset) % placesWithAngle.length;
      if (index < placesWithAngle.length) {
        selected.push(placesWithAngle[index]);
      }
    }

    return selected;
  }

  /**
   * Fallback: 장소 검색 실패시 패턴 기반 포인트 생성
   */
  generateFallbackPoints(userLocation, themeId) {
    const startLat = userLocation.lat;
    const startLng = userLocation.lng;

    const patterns = {
      beach: [
        { offset: 0.005, dir: 'east', name: '해변 방향' },
        { offset: 0.007, dir: 'north', name: '산책로' },
        { offset: 0.005, dir: 'west', name: '공원' }
      ],
      'night-view': [
        { offset: 0.006, dir: 'north', name: '언덕' },
        { offset: 0.008, dir: 'east', name: '전망대' },
        { offset: 0.005, dir: 'south', name: '야경 포인트' }
      ],
      'urban-healing': [
        { offset: 0.004, dir: 'north', name: '카페 거리' },
        { offset: 0.006, dir: 'east', name: '공원' },
        { offset: 0.004, dir: 'south', name: '쇼핑몰' }
      ],
      'view-food': [
        { offset: 0.005, dir: 'east', name: '맛집 거리' },
        { offset: 0.007, dir: 'north', name: '전통시장' },
        { offset: 0.005, dir: 'west', name: '카페' }
      ]
    };

    const pattern = patterns[themeId] || patterns['view-food'];
    const points = [{ lat: startLat, lng: startLng, name: userLocation.name || '출발지' }];

    let currentLat = startLat;
    let currentLng = startLng;

    pattern.forEach((step) => {
      const directionOffsets = {
        'north': { lat: step.offset, lng: 0 },
        'south': { lat: -step.offset, lng: 0 },
        'east': { lat: 0, lng: step.offset },
        'west': { lat: 0, lng: -step.offset }
      };

      const offset = directionOffsets[step.dir] || { lat: 0, lng: 0 };
      currentLat += offset.lat;
      currentLng += offset.lng;

      points.push({
        lat: currentLat,
        lng: currentLng,
        name: step.name
      });
    });

    return points;
  }

  /**
   * 거리 기반 포인트 조정
   * @param {Array} points - 원본 포인트
   * @param {string} targetDistance - 목표 거리 (예: '10km')
   * @param {Object} userLocation - 사용자 위치 (옵션)
   * @returns {Array} 조정된 포인트
   */
  adjustPointsForDistance(points, targetDistance, userLocation = null) {
    // 간단 구현: 목표 거리에 따라 중간 포인트 추가/제거
    const distanceValue = parseFloat(targetDistance);

    if (distanceValue >= 10) {
      // 10km 이상: 더 많은 경유지 추가 (더 세밀한 경로)
      const extendedPoints = [];
      points.forEach((point, idx) => {
        extendedPoints.push(point);
        if (idx < points.length - 1) {
          // 두 개의 중간 포인트 추가 (더 자연스러운 걷기 경로)
          const nextPoint = points[idx + 1];
          const latDiff = nextPoint.lat - point.lat;
          const lngDiff = nextPoint.lng - point.lng;

          extendedPoints.push({
            lat: point.lat + latDiff * 0.33,
            lng: point.lng + lngDiff * 0.33,
            name: `경유지 ${idx + 1}-A`
          });
          extendedPoints.push({
            lat: point.lat + latDiff * 0.67,
            lng: point.lng + lngDiff * 0.67,
            name: `경유지 ${idx + 1}-B`
          });
        }
      });
      return extendedPoints;
    } else if (distanceValue >= 5) {
      // 5km 이상: 중간 포인트 1개 추가
      const extendedPoints = [];
      points.forEach((point, idx) => {
        extendedPoints.push(point);
        if (idx < points.length - 1) {
          const nextPoint = points[idx + 1];
          const midLat = (point.lat + nextPoint.lat) / 2;
          const midLng = (point.lng + nextPoint.lng) / 2;
          extendedPoints.push({
            lat: midLat,
            lng: midLng,
            name: `경유지 ${idx + 1}`
          });
        }
      });
      return extendedPoints;
    } else if (distanceValue <= 3) {
      // 3km 이하: 포인트 줄이기
      return points.filter((_, idx) => idx % 2 === 0 || idx === points.length - 1);
    }

    return points;
  }

  /**
   * 두 지점 간 거리 계산 (Haversine formula)
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // 지구 반경 (km)
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * 고도 변화 추정 (간단 버전)
   */
  estimateElevation(points) {
    // MVP: 해변은 평탄, 도심은 약간 경사, 야경 코스는 경사 있음
    const elevationMap = {
      beach: 30,
      'urban-healing': 50,
      'night-view': 80,
      'view-food': 60
    };

    // 기본값
    return 45;
  }

  /**
   * 경로 총 거리 계산
   */
  calculateRouteDistance(points) {
    let total = 0;
    for (let i = 0; i < points.length - 1; i++) {
      total += this.calculateDistance(
        points[i].lat,
        points[i].lng,
        points[i + 1].lat,
        points[i + 1].lng
      );
    }
    return total;
  }
}

// Singleton pattern
let kakaoMapServiceInstance = null;

export const getKakaoMapService = () => {
  if (!kakaoMapServiceInstance) {
    kakaoMapServiceInstance = new KakaoMapService();
  }
  return kakaoMapServiceInstance;
};

export default getKakaoMapService;
