import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 로컬 JSON 파일에서 부산 맛집/관광지 데이터를 로드하고 검색하는 서비스
 */
class LocalDataService {
  constructor() {
    this.restaurants = [];
    this.touristSpots = [];
    this.dataLoaded = false;
  }

  /**
   * JSON 파일에서 데이터 로드
   */
  loadData() {
    try {
      const restaurantsPath = path.join(__dirname, '../../data/busan_restaurants.json');
      const touristSpotsPath = path.join(__dirname, '../../data/busan_tourist_spots.json');

      // 파일 존재 여부 확인
      if (fs.existsSync(restaurantsPath)) {
        const restaurantsData = fs.readFileSync(restaurantsPath, 'utf-8');
        this.restaurants = JSON.parse(restaurantsData);
        console.log(`✅ 맛집 데이터 로드 완료: ${this.restaurants.length}개`);
      } else {
        console.warn(`⚠️ 맛집 데이터 파일이 없습니다: ${restaurantsPath}`);
        console.warn('   Python 스크립트를 실행하여 데이터를 수집하세요: python3 scripts/fetch_busan_data.py');
      }

      if (fs.existsSync(touristSpotsPath)) {
        const touristSpotsData = fs.readFileSync(touristSpotsPath, 'utf-8');
        this.touristSpots = JSON.parse(touristSpotsData);
        console.log(`✅ 관광지 데이터 로드 완료: ${this.touristSpots.length}개`);
      } else {
        console.warn(`⚠️ 관광지 데이터 파일이 없습니다: ${touristSpotsPath}`);
        console.warn('   Python 스크립트를 실행하여 데이터를 수집하세요: python3 scripts/fetch_busan_data.py');
      }

      this.dataLoaded = true;
    } catch (error) {
      console.error('❌ 로컬 데이터 로드 실패:', error.message);
      this.restaurants = [];
      this.touristSpots = [];
      this.dataLoaded = false;
    }
  }

  /**
   * Haversine 공식을 사용한 두 지점 간 거리 계산 (미터 단위)
   * @param {number} lat1 - 첫 번째 지점 위도
   * @param {number} lng1 - 첫 번째 지점 경도
   * @param {number} lat2 - 두 번째 지점 위도
   * @param {number} lng2 - 두 번째 지점 경도
   * @returns {number} 거리 (미터)
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // 지구 반지름 (미터)
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // 미터
  }

  /**
   * 도를 라디안으로 변환
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * 근처 음식점 검색
   * @param {number} lat - 중심 위도
   * @param {number} lng - 중심 경도
   * @param {number} radius - 검색 반경 (미터)
   * @returns {Array} 근처 음식점 리스트 (카카오 API와 동일한 형식)
   */
  searchNearbyRestaurants(lat, lng, radius = 1000) {
    if (!this.dataLoaded) {
      this.loadData();
    }

    return this.restaurants
      .map(r => ({
        ...r,
        distance: this.calculateDistance(lat, lng, r.lat, r.lng)
      }))
      .filter(r => r.distance <= radius)
      .map(r => ({
        name: r.name,
        lat: r.lat,
        lng: r.lng,
        category: '음식점',  // 카카오 API와 호환
        address: r.address,
        distance: r.distance.toFixed(0)  // 문자열로 변환
      }))
      .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  }

  /**
   * 근처 관광지 검색
   * @param {number} lat - 중심 위도
   * @param {number} lng - 중심 경도
   * @param {number} radius - 검색 반경 (미터)
   * @returns {Array} 근처 관광지 리스트 (카카오 API와 동일한 형식)
   */
  searchNearbyTouristSpots(lat, lng, radius = 1500) {
    if (!this.dataLoaded) {
      this.loadData();
    }

    return this.touristSpots
      .map(t => ({
        ...t,
        distance: this.calculateDistance(lat, lng, t.lat, t.lng)
      }))
      .filter(t => t.distance <= radius)
      .map(t => ({
        name: t.name,
        lat: t.lat,
        lng: t.lng,
        category: '관광명소',  // 카카오 API와 호환
        address: t.address,
        distance: t.distance.toFixed(0)  // 문자열로 변환
      }))
      .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  }

  /**
   * 데이터 다시 로드 (개발 중 데이터 갱신 시)
   */
  reloadData() {
    console.log('🔄 로컬 데이터 다시 로드 중...');
    this.loadData();
  }
}

// 싱글톤 인스턴스 생성 및 즉시 로드
const instance = new LocalDataService();
instance.loadData();

export default instance;
