import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class GoogleDirectionsService {
  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
    this.directionsURL = 'https://maps.googleapis.com/maps/api/directions/json';
  }

  /**
   * Google Directions API로 도보 경로 요청
   * @param {Object} origin - 출발지 {lat, lng}
   * @param {Object} destination - 도착지 {lat, lng}
   * @param {Array} waypoints - 경유지 배열 (최대 23개)
   * @returns {Promise<Object>} 경로 정보
   */
  async getWalkingRoute(origin, destination, waypoints = []) {
    try {
      if (!this.apiKey || this.apiKey === 'your_google_maps_api_key_here') {
        console.warn('⚠️ Google Maps API key not configured');
        return { success: false };
      }

      console.log('🚶 Google Directions API - 도보 경로 요청');
      console.log('출발:', origin);
      console.log('도착:', destination);
      console.log('경유지:', waypoints.length);

      // Google Directions API는 최대 25개 waypoints 허용 (origin + destination 포함)
      // 실제로는 23개까지만 안전
      const MAX_WAYPOINTS = 23;
      let processedWaypoints = waypoints;

      if (waypoints.length > MAX_WAYPOINTS) {
        // 경유지가 너무 많으면 균등하게 샘플링
        const step = waypoints.length / MAX_WAYPOINTS;
        processedWaypoints = [];
        for (let i = 0; i < MAX_WAYPOINTS; i++) {
          const index = Math.floor(i * step);
          processedWaypoints.push(waypoints[index]);
        }
        console.log(`📍 경유지 ${waypoints.length}개 → ${MAX_WAYPOINTS}개로 샘플링`);
      }

      // API 요청 파라미터 구성
      const params = {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        mode: 'walking',  // 도보 모드
        key: this.apiKey,
        language: 'ko',
        region: 'kr'
      };

      // 경유지 추가
      if (processedWaypoints.length > 0) {
        params.waypoints = processedWaypoints
          .map(wp => `${wp.lat},${wp.lng}`)
          .join('|');
      }

      const response = await axios.get(this.directionsURL, { params });

      if (response.data.status !== 'OK') {
        console.error(`❌ Google Directions API 오류: ${response.data.status}`);
        if (response.data.error_message) {
          console.error(`   메시지: ${response.data.error_message}`);
        }
        return { success: false };
      }

      if (!response.data.routes || response.data.routes.length === 0) {
        console.error('❌ Google Directions API: 경로를 찾을 수 없음');
        return { success: false };
      }

      // 첫 번째 경로 사용
      const route = response.data.routes[0];
      const allPoints = [];
      let totalDistance = 0;
      let totalDuration = 0;

      // 모든 leg의 steps에서 경로 포인트 추출
      route.legs.forEach(leg => {
        totalDistance += leg.distance.value; // meters
        totalDuration += leg.duration.value; // seconds

        leg.steps.forEach(step => {
          // 각 step의 시작점 추가
          allPoints.push({
            lat: step.start_location.lat,
            lng: step.start_location.lng
          });

          // polyline 디코딩하여 상세 경로 포인트 추가
          if (step.polyline && step.polyline.points) {
            const decodedPoints = this.decodePolyline(step.polyline.points);
            allPoints.push(...decodedPoints);
          }
        });
      });

      // 마지막 leg의 끝점 추가
      if (route.legs.length > 0) {
        const lastLeg = route.legs[route.legs.length - 1];
        allPoints.push({
          lat: lastLeg.end_location.lat,
          lng: lastLeg.end_location.lng
        });
      }

      const distanceKm = totalDistance / 1000;
      const durationMin = Math.round(totalDuration / 60);

      console.log(`✅ Google Directions API 성공: ${allPoints.length}개 포인트, ${distanceKm.toFixed(1)}km, ${durationMin}분`);

      return {
        success: true,
        distance: totalDistance, // meters
        duration: totalDuration, // seconds
        points: allPoints
      };

    } catch (error) {
      console.error('❌ Google Directions API 오류:', error.response?.data || error.message);
      return { success: false };
    }
  }

  /**
   * Google Maps polyline 디코딩
   * @param {string} encoded - 인코딩된 polyline 문자열
   * @returns {Array} 좌표 배열 [{lat, lng}, ...]
   */
  decodePolyline(encoded) {
    const points = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let b;
      let shift = 0;
      let result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.push({
        lat: lat / 1e5,
        lng: lng / 1e5
      });
    }

    return points;
  }
}

// Singleton pattern
let googleDirectionsServiceInstance = null;

export const getGoogleDirectionsService = () => {
  if (!googleDirectionsServiceInstance) {
    googleDirectionsServiceInstance = new GoogleDirectionsService();
  }
  return googleDirectionsServiceInstance;
};

export default getGoogleDirectionsService;
