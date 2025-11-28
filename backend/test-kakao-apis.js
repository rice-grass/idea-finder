import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;

console.log('🔑 Kakao REST API Key:', KAKAO_REST_API_KEY ? '✅ 설정됨' : '❌ 없음');
console.log('');

// 테스트 1: Kakao Local API - 주변 장소 검색 (확실히 작동함)
async function testKakaoLocalAPI() {
  console.log('━'.repeat(60));
  console.log('📍 테스트 1: Kakao Local API - 주변 장소 검색');
  console.log('━'.repeat(60));

  try {
    const response = await axios.get('https://dapi.kakao.com/v2/local/search/category.json', {
      headers: {
        'Authorization': `KakaoAK ${KAKAO_REST_API_KEY}`
      },
      params: {
        category_group_code: 'CE7', // 카페
        x: 129.1635,
        y: 35.1631,
        radius: 1000,
        sort: 'distance'
      }
    });

    console.log('✅ Kakao Local API 성공!');
    console.log(`   찾은 장소: ${response.data.documents.length}개`);
    console.log(`   첫 번째 장소: ${response.data.documents[0]?.place_name || 'N/A'}`);
    console.log('');
  } catch (error) {
    console.log('❌ Kakao Local API 실패:', error.response?.data || error.message);
    console.log('');
  }
}

// 테스트 2: Kakao Directions API (자동차 경로)
async function testKakaoDirectionsAPI() {
  console.log('━'.repeat(60));
  console.log('📍 테스트 2: Kakao Directions API - 자동차 경로');
  console.log('━'.repeat(60));

  try {
    const response = await axios.get('https://apis-navi.kakaomobility.com/v1/directions', {
      headers: {
        'Authorization': `KakaoAK ${KAKAO_REST_API_KEY}`,
        'Content-Type': 'application/json'
      },
      params: {
        origin: '129.1635,35.1631',
        destination: '129.1189,35.1532'
      }
    });

    console.log('✅ Kakao Directions API 성공!');
    console.log('   응답 데이터:', JSON.stringify(response.data, null, 2).substring(0, 500));
    console.log('');
  } catch (error) {
    console.log('❌ Kakao Directions API 실패');
    console.log(`   상태: ${error.response?.status}`);
    console.log(`   에러:`, error.response?.data || error.message);
    console.log('');
  }
}

// 테스트 3: Kakao Waypoints API (경유지 포함)
async function testKakaoWaypointsAPI() {
  console.log('━'.repeat(60));
  console.log('📍 테스트 3: Kakao Waypoints API - 경유지 포함');
  console.log('━'.repeat(60));

  const endpoints = [
    'https://apis-navi.kakaomobility.com/v1/waypoints',
    'https://apis-navi.kakaomobility.com/v1/directions/waypoints',
    'https://apis.kakaomobility.com/v1/waypoints'
  ];

  for (const endpoint of endpoints) {
    console.log(`🔍 시도: ${endpoint}`);
    try {
      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': `KakaoAK ${KAKAO_REST_API_KEY}`,
          'Content-Type': 'application/json'
        },
        params: {
          origin: '129.1635,35.1631',
          destination: '129.1189,35.1532',
          priority: 'RECOMMEND'
        }
      });

      console.log('✅ 성공!');
      console.log('   응답:', JSON.stringify(response.data, null, 2).substring(0, 300));
      console.log('');
      return;
    } catch (error) {
      console.log(`   ❌ 실패: ${error.response?.status} - ${error.response?.data?.msg || error.message}`);
    }
  }
  console.log('');
}

// 테스트 4: Kakao 좌표-주소 변환
async function testKakaoCoord2Address() {
  console.log('━'.repeat(60));
  console.log('📍 테스트 4: Kakao 좌표 → 주소 변환');
  console.log('━'.repeat(60));

  try {
    const response = await axios.get('https://dapi.kakao.com/v2/local/geo/coord2address.json', {
      headers: {
        'Authorization': `KakaoAK ${KAKAO_REST_API_KEY}`
      },
      params: {
        x: 129.1635,
        y: 35.1631
      }
    });

    console.log('✅ 좌표 → 주소 변환 성공!');
    if (response.data.documents && response.data.documents.length > 0) {
      const doc = response.data.documents[0];
      console.log(`   주소: ${doc.address?.address_name || 'N/A'}`);
      console.log(`   도로명: ${doc.road_address?.address_name || 'N/A'}`);
    }
    console.log('');
  } catch (error) {
    console.log('❌ 좌표 → 주소 변환 실패:', error.response?.data || error.message);
    console.log('');
  }
}

// 모든 테스트 실행
async function runAllTests() {
  await testKakaoLocalAPI();
  await testKakaoCoord2Address();
  await testKakaoDirectionsAPI();
  await testKakaoWaypointsAPI();

  console.log('━'.repeat(60));
  console.log('🏁 모든 테스트 완료');
  console.log('━'.repeat(60));
  console.log('');
  console.log('📝 결론:');
  console.log('   - Kakao Local API (장소 검색): 사용 가능 여부 확인됨');
  console.log('   - Kakao 좌표 변환: 사용 가능 여부 확인됨');
  console.log('   - Kakao Directions API: 사용 가능 여부 확인됨');
  console.log('   - Kakao Navi/Waypoints API: 권한 또는 엔드포인트 확인 필요');
}

runAllTests().catch(err => {
  console.error('테스트 실행 중 오류:', err);
  process.exit(1);
});
