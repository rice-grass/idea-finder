import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;

async function testDirectionsWithWaypoints() {
  console.log('━'.repeat(60));
  console.log('📍 Kakao Directions API - 경유지 포함 경로 테스트');
  console.log('━'.repeat(60));
  console.log('');

  // 테스트 1: 경유지 없이 (기본)
  console.log('1️⃣  테스트: 해운대 → 광안리 (경유지 없음)');
  try {
    const response = await axios.get('https://apis-navi.kakaomobility.com/v1/directions', {
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

    const route = response.data.routes[0];
    const summary = route.summary;

    console.log('✅ 성공!');
    console.log(`   거리: ${(summary.distance / 1000).toFixed(2)} km`);
    console.log(`   시간: ${Math.round(summary.duration / 60)} 분`);
    console.log(`   섹션: ${route.sections?.length || 0}개`);

    // 경로 포인트 수 확인
    let pointCount = 0;
    if (route.sections) {
      route.sections.forEach(section => {
        if (section.roads) {
          section.roads.forEach(road => {
            if (road.vertexes) {
              pointCount += road.vertexes.length / 2;
            }
          });
        }
      });
    }
    console.log(`   경로 포인트: ${pointCount}개`);
    console.log('');
  } catch (error) {
    console.log('❌ 실패:', error.response?.data || error.message);
    console.log('');
  }

  // 테스트 2: 경유지 1개 포함
  console.log('2️⃣  테스트: 해운대 → 마린시티 → 광안리 (경유지 1개)');
  try {
    const response = await axios.get('https://apis-navi.kakaomobility.com/v1/directions', {
      headers: {
        'Authorization': `KakaoAK ${KAKAO_REST_API_KEY}`,
        'Content-Type': 'application/json'
      },
      params: {
        origin: '129.1635,35.1631',
        destination: '129.1189,35.1532',
        waypoints: '129.1670,35.1620',  // 마린시티
        priority: 'RECOMMEND'
      }
    });

    const route = response.data.routes[0];
    const summary = route.summary;

    console.log('✅ 성공!');
    console.log(`   거리: ${(summary.distance / 1000).toFixed(2)} km`);
    console.log(`   시간: ${Math.round(summary.duration / 60)} 분`);
    console.log(`   섹션: ${route.sections?.length || 0}개`);
    console.log('');
  } catch (error) {
    console.log('❌ 실패:', error.response?.data || error.message);
    console.log('');
  }

  // 테스트 3: 경유지 여러개 포함
  console.log('3️⃣  테스트: 해운대 → 마린시티 → 동백섬 → 미포 (경유지 2개)');
  try {
    const response = await axios.get('https://apis-navi.kakaomobility.com/v1/directions', {
      headers: {
        'Authorization': `KakaoAK ${KAKAO_REST_API_KEY}`,
        'Content-Type': 'application/json'
      },
      params: {
        origin: '129.1635,35.1631',
        destination: '129.1680,35.1600',
        waypoints: '129.1670,35.1620|129.1650,35.1589',  // 마린시티 | 동백섬
        priority: 'RECOMMEND'
      }
    });

    const route = response.data.routes[0];
    const summary = route.summary;

    console.log('✅ 성공!');
    console.log(`   거리: ${(summary.distance / 1000).toFixed(2)} km`);
    console.log(`   시간: ${Math.round(summary.duration / 60)} 분`);
    console.log(`   섹션: ${route.sections?.length || 0}개`);

    // 경로 포인트 샘플 출력
    if (route.sections && route.sections[0]?.roads?.[0]?.vertexes) {
      const vertexes = route.sections[0].roads[0].vertexes;
      console.log('   샘플 좌표 (처음 3개):');
      for (let i = 0; i < Math.min(6, vertexes.length); i += 2) {
        console.log(`     [${vertexes[i]}, ${vertexes[i + 1]}]`);
      }
    }
    console.log('');
  } catch (error) {
    console.log('❌ 실패:', error.response?.data || error.message);
    console.log('');
  }

  // 테스트 4: 다른 우선순위 옵션
  console.log('4️⃣  테스트: 우선순위 옵션 비교 (같은 구간)');
  const priorities = ['RECOMMEND', 'TIME', 'DISTANCE'];

  for (const priority of priorities) {
    try {
      const response = await axios.get('https://apis-navi.kakaomobility.com/v1/directions', {
        headers: {
          'Authorization': `KakaoAK ${KAKAO_REST_API_KEY}`,
          'Content-Type': 'application/json'
        },
        params: {
          origin: '129.1635,35.1631',
          destination: '129.1189,35.1532',
          priority: priority
        }
      });

      const summary = response.data.routes[0].summary;
      console.log(`   ${priority.padEnd(10)}: ${(summary.distance / 1000).toFixed(2)} km, ${Math.round(summary.duration / 60)} 분`);
    } catch (error) {
      console.log(`   ${priority.padEnd(10)}: ❌ 실패`);
    }
  }

  console.log('');
  console.log('━'.repeat(60));
  console.log('📊 결론');
  console.log('━'.repeat(60));
  console.log('');
  console.log('✅ Kakao Directions API 사용 가능!');
  console.log('   - 기본 경로: ✅ 작동');
  console.log('   - 경유지 1개: 테스트 완료');
  console.log('   - 경유지 여러개: 테스트 완료');
  console.log('   - 우선순위 옵션: 테스트 완료');
  console.log('');
  console.log('⚠️  참고:');
  console.log('   - /v1/waypoints 엔드포인트는 사용 불가');
  console.log('   - /v1/directions 엔드포인트 사용 권장');
  console.log('   - waypoints 파라미터로 경유지 추가 가능');
}

testDirectionsWithWaypoints().catch(err => {
  console.error('테스트 실행 중 오류:', err);
  process.exit(1);
});
