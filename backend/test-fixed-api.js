import { getKakaoMapService } from './src/services/kakaoMapService.js';

async function testFixedAPI() {
  console.log('━'.repeat(60));
  console.log('🧪 수정된 Kakao API 테스트');
  console.log('━'.repeat(60));
  console.log('');

  const kakaoMapService = getKakaoMapService();

  // 테스트 1: 경유지 없이
  console.log('1️⃣  테스트: 해운대 → 광안리 (경유지 없음)');
  try {
    const result = await kakaoMapService.getWalkingRouteWithNaviAPI(
      { lng: 129.1635, lat: 35.1631, name: '해운대역' },
      { lng: 129.1189, lat: 35.1532, name: '광안리해수욕장' },
      []
    );

    if (result.success) {
      console.log('✅ 성공!');
      console.log(`   거리: ${(result.distance / 1000).toFixed(2)} km`);
      console.log(`   시간: ${Math.round(result.duration / 60)} 분`);
      console.log(`   포인트: ${result.points.length}개`);
      console.log(`   첫 좌표: [${result.points[0].lng}, ${result.points[0].lat}]`);
      console.log(`   끝 좌표: [${result.points[result.points.length - 1].lng}, ${result.points[result.points.length - 1].lat}]`);
    } else {
      console.log('❌ 실패 (fallback 사용됨)');
    }
  } catch (error) {
    console.log('❌ 에러:', error.message);
  }
  console.log('');

  // 테스트 2: 경유지 1개
  console.log('2️⃣  테스트: 해운대 → 마린시티 → 광안리 (경유지 1개)');
  try {
    const result = await kakaoMapService.getWalkingRouteWithNaviAPI(
      { lng: 129.1635, lat: 35.1631, name: '해운대역' },
      { lng: 129.1189, lat: 35.1532, name: '광안리해수욕장' },
      [{ lng: 129.1670, lat: 35.1620, name: '마린시티' }]
    );

    if (result.success) {
      console.log('✅ 성공!');
      console.log(`   거리: ${(result.distance / 1000).toFixed(2)} km`);
      console.log(`   시간: ${Math.round(result.duration / 60)} 분`);
      console.log(`   포인트: ${result.points.length}개`);
    } else {
      console.log('❌ 실패 (fallback 사용됨)');
    }
  } catch (error) {
    console.log('❌ 에러:', error.message);
  }
  console.log('');

  // 테스트 3: 경유지 여러개
  console.log('3️⃣  테스트: 해운대 → 마린시티 → 동백섬 → 미포 (경유지 2개)');
  try {
    const result = await kakaoMapService.getWalkingRouteWithNaviAPI(
      { lng: 129.1635, lat: 35.1631, name: '해운대역' },
      { lng: 129.1680, lat: 35.1600, name: '미포' },
      [
        { lng: 129.1670, lat: 35.1620, name: '마린시티' },
        { lng: 129.1650, lat: 35.1589, name: '동백섬' }
      ]
    );

    if (result.success) {
      console.log('✅ 성공!');
      console.log(`   거리: ${(result.distance / 1000).toFixed(2)} km`);
      console.log(`   시간: ${Math.round(result.duration / 60)} 분`);
      console.log(`   포인트: ${result.points.length}개`);
    } else {
      console.log('❌ 실패 (fallback 사용됨)');
    }
  } catch (error) {
    console.log('❌ 에러:', error.message);
  }
  console.log('');

  // 테스트 4: getWalkingRoute (우선순위 API 체인)
  console.log('4️⃣  테스트: getWalkingRoute (API 우선순위 체인)');
  try {
    const result = await kakaoMapService.getWalkingRoute(
      { lng: 129.1635, lat: 35.1631, name: '해운대역' },
      { lng: 129.1189, lat: 35.1532, name: '광안리해수욕장' },
      []
    );

    if (result.success) {
      console.log('✅ 성공!');
      console.log(`   거리: ${(result.distance / 1000).toFixed(2)} km`);
      console.log(`   시간: ${Math.round(result.duration / 60)} 분`);
      console.log(`   포인트: ${result.points.length}개`);
    } else {
      console.log('❌ 실패');
    }
  } catch (error) {
    console.log('❌ 에러:', error.message);
  }
  console.log('');

  console.log('━'.repeat(60));
  console.log('🏁 테스트 완료');
  console.log('━'.repeat(60));
}

testFixedAPI().catch(err => {
  console.error('테스트 실행 중 오류:', err);
  process.exit(1);
});
