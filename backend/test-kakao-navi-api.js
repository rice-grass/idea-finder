import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Kakao Mobility Navi API 테스트
async function testKakaoNaviAPI() {
  const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;
  const naviApiUrl = 'https://apis-navi.kakaomobility.com/v1';

  console.log('🔑 Kakao REST API Key:', KAKAO_REST_API_KEY ? '✅ 설정됨' : '❌ 없음');
  console.log('');

  // 테스트 케이스 1: 부산 해운대 - 광안리 도보 경로
  const testCase1 = {
    name: '해운대 → 광안리',
    origin: { lng: 129.1635, lat: 35.1631, name: '해운대역' },
    destination: { lng: 129.1189, lat: 35.1532, name: '광안리해수욕장' },
    waypoints: []
  };

  // 테스트 케이스 2: 경유지 포함
  const testCase2 = {
    name: '해운대 → 마린시티 → 동백섬 → 미포',
    origin: { lng: 129.1635, lat: 35.1631, name: '해운대역' },
    destination: { lng: 129.1680, lat: 35.1600, name: '미포' },
    waypoints: [
      { lng: 129.1670, lat: 35.1620, name: '마린시티' },
      { lng: 129.1650, lat: 35.1589, name: '동백섬' }
    ]
  };

  for (const testCase of [testCase1, testCase2]) {
    console.log('━'.repeat(60));
    console.log(`📍 테스트: ${testCase.name}`);
    console.log('━'.repeat(60));

    try {
      const params = {
        origin: `${testCase.origin.lng},${testCase.origin.lat}`,
        destination: `${testCase.destination.lng},${testCase.destination.lat}`,
        priority: 'RECOMMEND',
        road_type: 'BIKE'
      };

      if (testCase.waypoints.length > 0) {
        params.waypoints = testCase.waypoints
          .map(wp => `${wp.lng},${wp.lat}`)
          .join('|');
      }

      console.log('📤 요청 파라미터:', JSON.stringify(params, null, 2));
      console.log('');

      const response = await axios.get(`${naviApiUrl}/waypoints`, {
        headers: {
          'Authorization': `KakaoAK ${KAKAO_REST_API_KEY}`,
          'Content-Type': 'application/json'
        },
        params
      });

      console.log('✅ API 응답 성공!');
      console.log('');

      if (response.data && response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        const sections = route.sections || [];

        let totalDistance = 0;
        let totalDuration = 0;
        let totalPoints = 0;

        sections.forEach(section => {
          totalDistance += section.distance || 0;
          totalDuration += section.duration || 0;

          if (section.roads && section.roads.length > 0) {
            section.roads.forEach(road => {
              if (road.vertexes) {
                totalPoints += road.vertexes.length / 2;
              }
            });
          }
        });

        console.log('📊 경로 정보:');
        console.log(`   총 거리: ${(totalDistance / 1000).toFixed(2)} km`);
        console.log(`   소요 시간: ${Math.round(totalDuration / 60)} 분`);
        console.log(`   경로 포인트: ${totalPoints} 개`);
        console.log(`   섹션 개수: ${sections.length} 개`);
        console.log('');

        // 첫 번째 섹션의 일부 좌표 출력
        if (sections.length > 0 && sections[0].roads && sections[0].roads.length > 0) {
          const firstRoad = sections[0].roads[0];
          if (firstRoad.vertexes && firstRoad.vertexes.length >= 4) {
            console.log('📍 샘플 좌표 (처음 3개):');
            for (let i = 0; i < Math.min(6, firstRoad.vertexes.length); i += 2) {
              console.log(`   [${firstRoad.vertexes[i]}, ${firstRoad.vertexes[i + 1]}]`);
            }
            console.log('');
          }
        }

        console.log('✅ 결과: API 정상 작동 - 실제 경로 데이터 수신됨');
      } else {
        console.log('⚠️  결과: 응답은 받았으나 경로 데이터가 없음');
        console.log('응답 데이터:', JSON.stringify(response.data, null, 2));
      }

    } catch (error) {
      console.log('❌ API 호출 실패');
      console.log('');

      if (error.response) {
        console.log('📋 에러 상세:');
        console.log(`   상태 코드: ${error.response.status}`);
        console.log(`   메시지: ${error.response.statusText}`);
        console.log(`   에러 데이터:`, JSON.stringify(error.response.data, null, 2));

        if (error.response.status === 401) {
          console.log('');
          console.log('💡 인증 실패 - API 키를 확인해주세요');
        } else if (error.response.status === 403) {
          console.log('');
          console.log('💡 권한 없음 - Kakao Mobility API 사용 권한이 필요합니다');
          console.log('   Kakao Developers에서 "길찾기" API를 활성화해주세요');
          console.log('   URL: https://developers.kakao.com/console/app');
        } else if (error.response.status === 404) {
          console.log('');
          console.log('💡 엔드포인트를 찾을 수 없음 - API URL을 확인해주세요');
        }
      } else if (error.request) {
        console.log('📋 네트워크 에러:');
        console.log('   요청은 전송되었으나 응답을 받지 못했습니다');
        console.log(`   에러: ${error.message}`);
      } else {
        console.log('📋 에러:', error.message);
      }

      console.log('');
      console.log('❌ 결과: API 사용 불가');
    }

    console.log('');
  }

  console.log('━'.repeat(60));
  console.log('🏁 테스트 종료');
  console.log('━'.repeat(60));
}

// 실행
testKakaoNaviAPI().catch(err => {
  console.error('테스트 실행 중 오류:', err);
  process.exit(1);
});
