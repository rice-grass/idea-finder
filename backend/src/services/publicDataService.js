import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// RAG 컨텍스트 캐싱
let ragContextCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 30 * 60 * 1000; // 30분

class PublicDataService {
  constructor() {
    this.apiKey = process.env.PUBLIC_DATA_API_KEY;
    this.foodServiceUrl = 'https://apis.data.go.kr/6260000/FoodService/getFoodKr';
    this.touristInfoUrl = 'https://apis.data.go.kr/6260000/InfoOfficeService/getInfoOfficeKr';
  }

  /**
   * 부산 맛집 정보 가져오기
   * @param {string} district - 구/군 이름 (예: "해운대구")
   * @param {number} pageNo - 페이지 번호
   * @param {number} numOfRows - 페이지당 결과 수
   * @returns {Promise<Array>} 맛집 리스트
   */
  async getRestaurants(district = '', pageNo = 1, numOfRows = 100) {
    try {
      const response = await axios.get(this.foodServiceUrl, {
        params: {
          serviceKey: this.apiKey,
          pageNo,
          numOfRows,
          resultType: 'json'
        },
        timeout: 10000
      });

      let items = [];

      // 응답 구조 확인
      if (response.data?.getFoodKr?.item) {
        items = Array.isArray(response.data.getFoodKr.item)
          ? response.data.getFoodKr.item
          : [response.data.getFoodKr.item];
      }

      // 지역 필터링
      if (district && items.length > 0) {
        items = items.filter(item =>
          item.GUGUN_NM && item.GUGUN_NM.includes(district)
        );
      }

      // 데이터 정규화
      return items.map(item => ({
        name: item.MAIN_TITLE || '이름 없음',
        district: item.GUGUN_NM || '미상',
        lat: item.LAT ? parseFloat(item.LAT) : null,
        lng: item.LNG ? parseFloat(item.LNG) : null,
        description: item.ITEMCNTNTS || '',
        address: item.ADDR1 || '',
        phone: item.CNTCT_TEL || '',
        website: item.HOMEPAGE_URL || '',
        type: 'restaurant'
      })).filter(item => item.lat && item.lng); // 좌표 있는 것만
    } catch (error) {
      console.error('Error fetching restaurants:', error.message);
      // API 실패 시 Mock 데이터 반환
      return this.getMockRestaurants(district);
    }
  }

  /**
   * 부산 관광안내소 정보 가져오기
   * @param {number} pageNo - 페이지 번호
   * @param {number} numOfRows - 페이지당 결과 수
   * @returns {Promise<Array>} 관광지 리스트
   */
  async getTouristInfo(pageNo = 1, numOfRows = 100) {
    try {
      const response = await axios.get(this.touristInfoUrl, {
        params: {
          serviceKey: this.apiKey,
          pageNo,
          numOfRows,
          resultType: 'json'
        },
        timeout: 10000
      });

      let items = [];

      // 응답 구조 확인
      if (response.data?.getInfoOfficeKr?.item) {
        items = Array.isArray(response.data.getInfoOfficeKr.item)
          ? response.data.getInfoOfficeKr.item
          : [response.data.getInfoOfficeKr.item];
      }

      // 데이터 정규화
      return items.map(item => ({
        name: item.MAIN_TITLE || '이름 없음',
        district: item.GUGUN_NM || '미상',
        lat: item.LAT ? parseFloat(item.LAT) : null,
        lng: item.LNG ? parseFloat(item.LNG) : null,
        description: item.ITEMCNTNTS || '',
        address: item.ADDR1 || '',
        phone: item.CNTCT_TEL || '',
        website: item.HOMEPAGE_URL || '',
        type: 'tourist_info'
      })).filter(item => item.lat && item.lng);
    } catch (error) {
      console.error('Error fetching tourist info:', error.message);
      // API 실패 시 Mock 데이터 반환
      return this.getMockTouristSpots();
    }
  }

  /**
   * RAG 컨텍스트 구축 (캐싱 포함)
   * @returns {Promise<Object>} RAG 컨텍스트
   */
  async buildRAGContext() {
    // 캐시 확인
    if (ragContextCache && cacheTimestamp &&
        (Date.now() - cacheTimestamp < CACHE_DURATION)) {
      console.log('Using cached RAG context');
      return ragContextCache;
    }

    console.log('Building new RAG context...');

    try {
      const [restaurants, touristInfo] = await Promise.all([
        this.getRestaurants('', 1, 100),
        this.getTouristInfo(1, 100)
      ]);

      ragContextCache = {
        restaurants: restaurants,
        touristSpots: touristInfo,
        timestamp: new Date().toISOString()
      };
      cacheTimestamp = Date.now();

      console.log(`RAG context built: ${restaurants.length} restaurants, ${touristInfo.length} tourist spots`);

      return ragContextCache;
    } catch (error) {
      console.error('Error building RAG context:', error);
      // Fallback to previous cache or mock data
      return ragContextCache || {
        restaurants: this.getMockRestaurants(),
        touristSpots: this.getMockTouristSpots(),
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 키워드 기반 관련 컨텍스트 검색
   * @param {string} query - 사용자 쿼리
   * @param {Object} ragData - RAG 데이터
   * @returns {Object} 관련 데이터
   */
  retrieveRelevantContext(query, ragData) {
    const keywords = query.toLowerCase()
      .split(/\s+/)
      .filter(kw => kw.length > 1); // 1글자 키워드 제외

    const searchInText = (text, keywords) => {
      const lowerText = text.toLowerCase();
      return keywords.some(kw => lowerText.includes(kw));
    };

    const relevantRestaurants = ragData.restaurants.filter(r =>
      searchInText(r.name, keywords) ||
      searchInText(r.district, keywords) ||
      searchInText(r.description || '', keywords) ||
      searchInText(r.address || '', keywords)
    ).slice(0, 5);

    const relevantTourist = ragData.touristSpots.filter(t =>
      searchInText(t.name, keywords) ||
      searchInText(t.district, keywords) ||
      searchInText(t.description || '', keywords) ||
      searchInText(t.address || '', keywords)
    ).slice(0, 5);

    return {
      restaurants: relevantRestaurants,
      touristSpots: relevantTourist
    };
  }

  /**
   * 위치 기반 필터링
   * @param {Array} data - 데이터 배열
   * @param {number} lat - 중심 위도
   * @param {number} lng - 중심 경도
   * @param {number} radiusKm - 반경 (km)
   * @returns {Array} 필터링된 데이터
   */
  filterByLocation(data, lat, lng, radiusKm = 2) {
    return data.filter(item => {
      if (!item.lat || !item.lng) return false;

      const distance = this.calculateDistance(lat, lng, item.lat, item.lng);
      return distance <= radiusKm;
    }).sort((a, b) => {
      const distA = this.calculateDistance(lat, lng, a.lat, a.lng);
      const distB = this.calculateDistance(lat, lng, b.lat, b.lng);
      return distA - distB;
    });
  }

  /**
   * 두 지점 간 거리 계산 (Haversine formula)
   * @param {number} lat1 - 위도 1
   * @param {number} lng1 - 경도 1
   * @param {number} lat2 - 위도 2
   * @param {number} lng2 - 경도 2
   * @returns {number} 거리 (km)
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
   * Mock 맛집 데이터 (API 실패 시 대체)
   */
  getMockRestaurants(district = '') {
    const mockData = [
      {
        name: '해운대 암소갈비집',
        district: '해운대구',
        lat: 35.1631,
        lng: 129.1635,
        description: '신선한 한우를 제공하는 갈비 전문점',
        address: '부산광역시 해운대구 중동',
        phone: '051-123-4567',
        type: 'restaurant'
      },
      {
        name: '광안리 횟집',
        district: '수영구',
        lat: 35.1532,
        lng: 129.1189,
        description: '싱싱한 회와 바다 전망',
        address: '부산광역시 수영구 광안동',
        phone: '051-234-5678',
        type: 'restaurant'
      },
      {
        name: '송정 해물칼국수',
        district: '해운대구',
        lat: 35.1785,
        lng: 129.2005,
        description: '푸짐한 해물이 들어간 칼국수',
        address: '부산광역시 해운대구 송정동',
        phone: '051-345-6789',
        type: 'restaurant'
      }
    ];

    return district
      ? mockData.filter(r => r.district.includes(district))
      : mockData;
  }

  /**
   * Mock 관광지 데이터 (API 실패 시 대체)
   */
  getMockTouristSpots() {
    return [
      {
        name: '해운대 관광안내소',
        district: '해운대구',
        lat: 35.1585,
        lng: 129.1603,
        description: '해운대 지역 관광 정보 제공',
        address: '부산광역시 해운대구 우동',
        phone: '051-749-7614',
        type: 'tourist_info'
      },
      {
        name: '광안리 관광안내소',
        district: '수영구',
        lat: 35.1530,
        lng: 129.1180,
        description: '광안리 지역 관광 정보 제공',
        address: '부산광역시 수영구 광안동',
        phone: '051-622-4251',
        type: 'tourist_info'
      }
    ];
  }
}

// Singleton pattern
let publicDataServiceInstance = null;

export const getPublicDataService = () => {
  if (!publicDataServiceInstance) {
    publicDataServiceInstance = new PublicDataService();
  }
  return publicDataServiceInstance;
};

export default getPublicDataService;
