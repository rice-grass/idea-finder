import express from 'express';
import multer from 'multer';
import getUpstageService from '../services/upstageService.js';
import getPublicDataService from '../services/publicDataService.js';
import getKakaoMapService from '../services/kakaoMapService.js';
import getPhotoService from '../services/photoService.js';
import { getOpenAIService } from '../services/openaiService.js';
import localDataService from '../services/localDataService.js';
import runningConfig from '../config/runningThemes.js';

const router = express.Router();

/**
 * 거리별 마커 개수 임계값 계산
 * @param {number} distanceKm - 거리 (km)
 * @returns {Object} 관광지 및 음식점 개수 제한
 */
function calculateMarkerLimits(distanceKm) {
  // 1km당 관광지 1개, 음식점 1-3개
  const touristSpots = Math.max(1, Math.floor(distanceKm / 3)); // 3km당 1개
  const restaurants = Math.max(1, Math.min(3, Math.floor(distanceKm / 2))); // 2km당 1개, 최대 3개

  return {
    touristSpots,
    restaurants,
    waypoints: Math.max(2, Math.min(5, Math.floor(distanceKm / 2))) // 경유지: 최소 2개, 최대 5개
  };
}

// Multer 설정 (메모리 스토리지)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('지원하지 않는 파일 형식입니다.'));
    }
  }
});

// 서비스 인스턴스 가져오기
const upstageService = getUpstageService();
const publicDataService = getPublicDataService();
const kakaoMapService = getKakaoMapService();
const photoService = getPhotoService();
const openaiService = getOpenAIService();

/**
 * GET /api/running/themes
 * 러닝 테마 목록 가져오기
 */
router.get('/themes', (req, res) => {
  try {
    res.json({
      success: true,
      data: runningConfig.runningThemes
    });
  } catch (error) {
    console.error('Error getting themes:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/running/districts
 * 부산 지역 목록 가져오기
 */
router.get('/districts', (req, res) => {
  try {
    res.json({
      success: true,
      data: runningConfig.busanDistricts
    });
  } catch (error) {
    console.error('Error getting districts:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/running/difficulties
 * 난이도 목록 가져오기
 */
router.get('/difficulties', (req, res) => {
  try {
    res.json({
      success: true,
      data: runningConfig.difficulties
    });
  } catch (error) {
    console.error('Error getting difficulties:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/running/distances
 * 거리 옵션 목록 가져오기
 */
router.get('/distances', (req, res) => {
  try {
    res.json({
      success: true,
      data: runningConfig.distances
    });
  } catch (error) {
    console.error('Error getting distances:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/running/generate-course
 * 러닝 코스 생성 (여러 개의 코스 추천)
 */
router.post('/generate-course', async (req, res) => {
  try {
    const { district, theme, distance, difficulty, startLocation } = req.body;

    console.log('📍 === 코스 생성 요청 수신 ===');
    console.log('받은 데이터:', { district, theme, distance, difficulty });
    console.log('🌍 실시간 위치:', startLocation);

    // 1. 테마 및 난이도 정보 찾기
    const themeInfo = runningConfig.runningThemes.find(t => t.id === theme);
    let difficultyInfo = runningConfig.difficulties.find(d => d.id === difficulty);

    // distance가 "5.0km" 형식이면 파싱
    let distanceValue = parseFloat(distance);
    if (isNaN(distanceValue)) {
      distanceValue = parseFloat(distance.replace('km', ''));
    }

    // 거리에 맞는 distanceInfo 찾기 또는 생성
    let distanceInfo = runningConfig.distances.find(d => d.value === Math.round(distanceValue));
    if (!distanceInfo) {
      distanceInfo = {
        id: `${distanceValue}km`,
        label: `${distanceValue}km`,
        value: distanceValue,
        duration: `${Math.round(distanceValue * 6)}-${Math.round(distanceValue * 7)}분`,
        calories: `~${Math.round(distanceValue * 50)}kcal`
      };
    }

    if (!themeInfo) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 테마입니다.'
      });
    }

    if (!difficultyInfo) {
      difficultyInfo = runningConfig.difficulties[1]; // 기본값: 중급
    }

    // 2. 사용자의 현재 위치를 시작점으로 사용 (절대 기본값 사용 안함!)
    if (!startLocation || !startLocation.lat || !startLocation.lng) {
      console.error('❌ 실시간 위치 정보가 없습니다!');
      return res.status(400).json({
        success: false,
        error: '실시간 위치 정보가 필요합니다. 위치 권한을 확인해주세요.'
      });
    }

    const userStartLocation = {
      lat: startLocation.lat,
      lng: startLocation.lng,
      name: startLocation.name || '현재 위치'
    };

    console.log('✅ 사용할 실시간 위치:', userStartLocation);

    // 3. 여러 개의 코스 생성 (3개 추천)
    const courses = [];
    const numCourses = 3;

    for (let i = 0; i < numCourses; i++) {
      try {
        // 거리에 따른 마커 개수 임계값 설정
        const markerLimits = calculateMarkerLimits(distanceValue);
        console.log(`📊 Marker limits for ${distanceValue}km:`, markerLimits);

        // 테마에 맞는 경로 포인트 생성 (현재 위치 기반)
        const routePoints = await kakaoMapService.generatePointsFromLocation(
          userStartLocation,
          themeInfo.id,
          distanceValue,
          i, // variation index for different routes
          markerLimits
        );

        // 경로 생성 (걷기 전용)
        const route = await kakaoMapService.generateRunningRoute(
          routePoints[0],
          routePoints[routePoints.length - 1],
          routePoints.slice(1, -1),
          `${distanceValue}km`
        );

        // waypoints가 비어있으면 기본 경로 생성
        if (!route.waypoints || route.waypoints.length === 0) {
          route.waypoints = routePoints.map(p => ({
            lat: p.lat,
            lng: p.lng,
            name: p.name || '경유지'
          }));
        }

        // 코스 이름 생성
        const courseVariations = ['A', 'B', 'C'];
        const courseName = `${themeInfo.label} ${distanceInfo.label} 코스 ${courseVariations[i]}`;

        // 태그 생성
        const tags = [
          `#${themeInfo.label}`,
          `#${distanceInfo.label}`,
          `#${difficultyInfo.label}`
        ];

        // 코스 데이터 구성
        courses.push({
          id: i + 1,
          name: courseName,
          theme: themeInfo.label,
          themeId: theme,
          distance: distanceInfo.label,
          difficulty: difficultyInfo.label,
          time: distanceInfo.duration,
          calories: distanceInfo.calories,
          route: route.route || [],
          waypoints: route.waypoints || [],
          tags,
          generatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error(`❌ 코스 ${i + 1} 생성 실패:`, error.message);
        console.error('Stack:', error.stack);
      }
    }

    // 최소 1개 이상의 코스가 생성되었는지 확인
    if (courses.length === 0) {
      return res.status(500).json({
        success: false,
        error: '코스를 생성할 수 없습니다.'
      });
    }

    res.json({
      success: true,
      courses: courses
    });
  } catch (error) {
    console.error('Error generating course:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/running/analyze-photo
 * 사진 분석 (OpenAI Vision)
 */
router.post('/analyze-photo', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '사진이 업로드되지 않았습니다.'
      });
    }

    const { keywords = '' } = req.body;

    // 1. 사진 처리
    const processed = await photoService.processUpload(req.file.buffer, req.file.mimetype);

    if (!processed.success) {
      return res.status(400).json({
        success: false,
        error: processed.error
      });
    }

    // 2. Base64 변환
    const base64Image = photoService.convertToBase64(processed.buffer);

    // 3. OpenAI Vision으로 이미지 분석
    const analysis = await openaiService.analyzeRunningPhoto(base64Image, keywords);

    res.json({
      success: true,
      data: {
        analysis,
        metadata: processed.metadata
      }
    });
  } catch (error) {
    console.error('Error analyzing photo:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/running/generate-reels
 * 릴스 대본 생성 (사진 + 키워드 → Upstage Solar)
 */
router.post('/generate-reels', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '사진이 업로드되지 않았습니다.'
      });
    }

    const { keywords = '', runData = '{}' } = req.body;
    const parsedRunData = typeof runData === 'string' ? JSON.parse(runData) : runData;

    // 1. 사진 처리
    const processed = await photoService.processUpload(req.file.buffer, req.file.mimetype);

    if (!processed.success) {
      return res.status(400).json({
        success: false,
        error: processed.error
      });
    }

    // 2. Base64 변환
    const base64Image = photoService.convertToBase64(processed.buffer);

    // 3. OpenAI Vision으로 이미지 분석
    const imageAnalysis = await openaiService.analyzeRunningPhoto(base64Image, keywords);

    // 4. Upstage Solar로 릴스 대본 생성
    const script = await upstageService.generateReelsScript(
      imageAnalysis,
      keywords,
      parsedRunData
    );

    res.json({
      success: true,
      data: {
        script,
        imageAnalysis,
        keywords,
        runData: parsedRunData
      }
    });
  } catch (error) {
    console.error('Error generating reels:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/running/concierge
 * AI 컨시어지 챗봇 (RAG 기반)
 */
router.post('/concierge', async (req, res) => {
  try {
    const { query, conversationHistory = [] } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: '질문을 입력해주세요.'
      });
    }

    // 1. RAG 컨텍스트 구축
    const ragData = await publicDataService.buildRAGContext();

    // 2. 관련 컨텍스트 검색
    const relevantContext = publicDataService.retrieveRelevantContext(query, ragData);

    // 3. Upstage Solar로 응답 생성
    const response = await upstageService.chatWithRAG(
      query,
      relevantContext,
      conversationHistory
    );

    res.json({
      success: true,
      data: {
        response,
        contextUsed: {
          restaurantsCount: relevantContext.restaurants.length,
          touristSpotsCount: relevantContext.touristSpots.length
        }
      }
    });
  } catch (error) {
    console.error('Error in concierge:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/running/oasis
 * 특정 경로의 오아시스 정보 가져오기
 */
router.post('/oasis', async (req, res) => {
  try {
    const { route } = req.body;

    if (!route || !route.waypoints) {
      return res.status(400).json({
        success: false,
        error: '경로 정보가 필요합니다.'
      });
    }

    // 1. 근처 맛집 가져오기
    const restaurants = await publicDataService.getRestaurants('', 1, 100);

    // 2. 경로 근처 오아시스 찾기
    const oasisLocations = kakaoMapService.findNearbyOasis(
      route.waypoints,
      restaurants.map(r => ({
        ...r,
        type: r.type || 'restaurant',
        benefits: '러너 할인 혜택'
      })),
      0.5
    );

    res.json({
      success: true,
      data: {
        oasisLocations,
        count: oasisLocations.length
      }
    });
  } catch (error) {
    console.error('Error getting oasis:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/running/search-oasis
 * 특정 위치 주변 오아시스 검색
 */
router.post('/search-oasis', async (req, res) => {
  try {
    const { lat, lng, radius = 1000, route } = req.body;

    console.log('🔍 Searching oasis near:', { lat, lng, radius });

    // 1. 공공데이터에서 음식점과 관광지 검색
    const restaurants = localDataService.searchNearbyRestaurants(lat, lng, radius);
    const touristSpots = localDataService.searchNearbyTouristSpots(lat, lng, radius);

    // 2. 카카오 API로 카페 검색 (급수대/카페)
    let cafes = [];
    try {
      cafes = await kakaoMapService.searchNearbyPlaces(lat, lng, 'CE7', radius);
      console.log(`☕ Found ${cafes.length} cafes from Kakao API`);
    } catch (error) {
      console.warn('⚠️ Kakao cafe search failed:', error.message);
    }

    console.log(`✅ Found ${restaurants.length} restaurants, ${touristSpots.length} tourist spots, ${cafes.length} cafes`);

    // 타입 정보 추가
    const allOasis = [
      ...restaurants.map(r => ({ ...r, type: 'restaurant', description: '러닝 후 식사는 5-30분 뒤' })),
      ...touristSpots.map(t => ({ ...t, type: 'touristSpot', description: '관광 정보 및 휴식' })),
      ...cafes.map(c => ({ ...c, type: 'cafe', description: '물 부족할 때 방문' }))
    ];

    // 거리순 정렬
    allOasis.sort((a, b) => {
      const distA = parseFloat(a.distance) || 0;
      const distB = parseFloat(b.distance) || 0;
      return distA - distB;
    });

    // 최대 30개로 제한 (카페 포함)
    const limitedOasis = allOasis.slice(0, 30);

    res.json({
      success: true,
      data: limitedOasis,
      count: limitedOasis.length
    });
  } catch (error) {
    console.error('Error searching oasis:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/running/health
 * Health check
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'RunWave API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;
