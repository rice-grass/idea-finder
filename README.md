# 🏃 RunWave (런웨이브)

<div align="center">
  <h3>데이터로 달리고 AI로 기록하는, 부산 런케이션 플랫폼</h3>
  <p>부울경 지역 상권과 러너를 잇는 올인원 러닝 서비스</p>
</div>

---

## 🎉 프로젝트 소개

**RunWave**는 부산의 아름다운 러닝 코스를 AI와 공공데이터를 활용하여 추천하고, 러너들에게 최적화된 경험을 제공하는 런케이션 플랫폼입니다.

### 핵심 가치

- **맞춤형 코스 추천**: 지역, 테마, 거리, 난이도를 선택하여 나만의 러닝 코스 생성
- **실시간 데이터 활용**: 카카오맵과 부산 공공데이터를 연동한 정확한 경로 및 오아시스 정보
- **AI 기반 설명**: Upstage Solar LLM이 생성하는 코스별 상세 설명
- **지역 상권 연계**: 러닝 코스 주변의 맛집, 카페, 편의점 정보 제공

---

## ✨ 주요 기능

### 1. 🗺️ 맞춤형 러닝 코스 생성
- **4단계 간편 프로세스**
  - Step 1: 지역 선택 (해운대, 광안리, 송정, 남포, 서면, 북항)
  - Step 2: 테마 선택 (뷰+맛집, 야경, 해변, 도심힐링)
  - Step 3: 코스 설정 (거리: 3/5/10/15km, 난이도: 초급/중급/고급)
  - Step 4: AI 기반 코스 생성 및 결과 확인

### 2. 🗺️ 카카오맵 경로 시각화
- 실시간 러닝 경로를 지도 위에 폴리라인으로 표시
- 출발/도착 마커 및 중간 경유지 표시
- 코스 주변 오아시스(맛집, 카페, 편의점) 위치 마커

### 3. 🏪 오아시스 정보
- 부산 공공데이터 API를 활용한 실시간 맛집 정보
- 코스에서 500m 이내의 편의점, 카페 추천
- 각 오아시스까지의 거리 및 상세 정보 제공

### 4. 💾 코스 저장 기능
- 생성한 코스를 LocalStorage에 저장
- 저장된 코스 관리 및 재사용

---

## 🛠️ 기술 스택

### Frontend
- **React** 19 - 최신 UI 라이브러리
- **Vite** 7 - 초고속 빌드 도구
- **Axios** - HTTP 통신
- **Kakao Maps SDK** - 지도 및 경로 표시

### Backend
- **Node.js** + **Express** 5 - RESTful API 서버
- **Upstage Solar Pro2** - AI 기반 텍스트 생성 (코스 설명, 릴스 대본 등)
- **OpenAI GPT-4o-mini** - Vision API를 활용한 이미지 분석
- **Multer** + **Sharp** - 이미지 업로드 및 처리
- **부산 공공데이터 API** - 맛집 및 관광지 정보
- **Kakao Map REST API** - 경로 생성 및 좌표 처리

### 외부 API
- **Kakao Map API** - 지도 표시 및 경로 검색
- **부산 공공데이터 포털** - 맛집정보서비스, 관광안내소정보서비스
- **Upstage API** - Solar LLM을 활용한 자연어 생성
- **OpenAI API** - GPT-4o-mini Vision API

---

## 🚀 시작하기

### 사전 요구사항
- Node.js 18.0.0 이상
- npm 9.0.0 이상
- Upstage API Key
- OpenAI API Key
- Kakao REST API Key
- 부산 공공데이터 API Key

### 1. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하세요:

```env
# OpenAI API Key (이미지 분석용)
OPENAI_API_KEY=your_openai_api_key

# Upstage API Key (텍스트 생성용)
UPSTAGE_API_KEY=your_upstage_api_key
UPSTAGE_BASE_URL=https://api.upstage.ai/v1
UPSTAGE_MODEL=solar-pro2

# Kakao Map API
KAKAO_REST_API_KEY=your_kakao_rest_api_key

# 부산 공공데이터 API
PUBLIC_DATA_API_KEY=your_busan_public_data_api_key

# Server Port (선택사항, 기본값: 3000)
PORT=3000
```

#### API 키 발급 방법

**Upstage API Key:**
1. [Upstage Console](https://console.upstage.ai/) 접속
2. API Key 생성
3. Solar Pro2 모델 사용 권한 확인

**OpenAI API Key:**
1. [OpenAI Platform](https://platform.openai.com/api-keys) 접속
2. "Create new secret key" 클릭
3. API 키 생성 및 복사

**Kakao API Key:**
1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 애플리케이션 추가
3. REST API 키 발급

**부산 공공데이터 API Key:**
1. [부산 공공데이터 포털](https://data.busan.go.kr/) 접속
2. 회원가입 및 API 신청
3. 맛집정보서비스, 관광안내소정보서비스 API 키 발급

### 2. 백엔드 서버 실행

```bash
cd backend
npm install
npm start
```

✅ 서버가 `http://localhost:3000`에서 실행됩니다.

### 3. 프론트엔드 서버 실행

새 터미널 창을 열고:

```bash
cd frontend
npm install
npm run dev
```

✅ 프론트엔드가 `http://localhost:5173`에서 실행됩니다.

### 4. 브라우저에서 접속

`http://localhost:5173`을 열어서 RunWave를 이용하세요!

---

## 📖 사용 방법

### 코스 생성하기

1. **지역 선택**: 부산의 6개 지역 중 러닝하고 싶은 곳을 선택하세요
   - 해운대구, 수영구(광안리), 해운대구(송정), 중구(남포), 부산진구(서면), 중구(북항)

2. **테마 선택**: 원하는 러닝 분위기를 골라주세요
   - 🍽️🌆 뷰 맛집: 맛집과 경치를 함께 즐기는 코스
   - 🌃 야경: 밤 러닝에 최적화된 야경 코스
   - 🏖️ 해변: 바다를 따라 달리는 시원한 코스
   - 🏙️🌿 도심 힐링: 도심 속 공원과 산책로 코스

3. **코스 설정**: 거리와 난이도를 선택하세요
   - 거리: 3km, 5km, 10km, 15km
   - 난이도: 초급, 중급, 고급

4. **코스 생성**: AI가 맞춤형 러닝 코스를 생성합니다
   - 카카오맵으로 경로 확인
   - 코스 하이라이트 및 특징
   - 주변 오아시스(맛집, 카페) 정보

5. **코스 저장**: 마음에 드는 코스는 저장하여 나중에 다시 확인하세요

---

## 📡 API 엔드포인트

### Running API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/running/themes` | 러닝 테마 목록 |
| GET | `/api/running/districts` | 부산 지역 목록 |
| GET | `/api/running/difficulties` | 난이도 목록 |
| GET | `/api/running/distances` | 거리 옵션 목록 |
| POST | `/api/running/generate-course` | 러닝 코스 생성 |
| POST | `/api/running/analyze-photo` | 사진 분석 (Vision) |
| POST | `/api/running/generate-reels` | 릴스 대본 생성 |
| POST | `/api/running/concierge` | AI 컨시어지 챗봇 |
| POST | `/api/running/oasis` | 오아시스 정보 |
| GET | `/api/running/health` | Health check |

### 예시: 코스 생성 요청

```bash
curl -X POST http://localhost:3000/api/running/generate-course \
  -H "Content-Type: application/json" \
  -d '{
    "district": "haeundae",
    "theme": "beach",
    "distance": "5km",
    "difficulty": "beginner"
  }'
```

---

## 🏗️ 프로젝트 구조

```
idea-finder/
├── .env                        # 환경 변수 (루트)
├── backend/                    # Node.js 백엔드
│   ├── src/
│   │   ├── index.js           # 서버 엔트리포인트
│   │   ├── config/
│   │   │   ├── runningThemes.js    # 테마, 지역, 난이도 설정
│   │   │   ├── studentLevels.js    # (기존 프로젝트)
│   │   │   └── techStacks.js       # (기존 프로젝트)
│   │   ├── routes/
│   │   │   ├── running.js          # Running API 라우트
│   │   │   ├── idea.js             # (기존 프로젝트)
│   │   │   └── github.js           # (기존 프로젝트)
│   │   └── services/
│   │       ├── upstageService.js   # Upstage Solar LLM
│   │       ├── publicDataService.js # 부산 공공데이터
│   │       ├── kakaoMapService.js  # 카카오맵 경로 생성
│   │       ├── photoService.js     # 이미지 처리
│   │       └── openaiService.js    # OpenAI Vision API
│   └── package.json
│
└── frontend/                   # React 프론트엔드
    ├── index.html              # Kakao Maps SDK 포함
    ├── src/
    │   ├── App.jsx
    │   ├── pages/
    │   │   └── Home.jsx        # 메인 페이지 (4-step wizard)
    │   ├── components/
    │   │   ├── WizardSteps.jsx
    │   │   ├── LocationSelector.jsx
    │   │   ├── ThemeSelector.jsx
    │   │   ├── CourseSettings.jsx
    │   │   ├── KakaoMapDisplay.jsx
    │   │   └── CourseCard.jsx
    │   ├── services/
    │   │   └── api.js          # API 통신 (runningAPI)
    │   └── utils/
    │       └── runningCoursesStorage.js  # LocalStorage 관리
    └── package.json
```

---

## 💡 작동 원리

### 1. 코스 생성 프로세스

1. **사용자 입력 수집**: 지역, 테마, 거리, 난이도
2. **경로 포인트 생성**: 카카오맵 서비스를 통해 지역별 주요 포인트 추출
3. **거리 조정**: 선택한 거리에 맞게 경유지 추가/제거
4. **경로 생성**: Kakao Map REST API로 실제 러닝 가능한 경로 생성
5. **오아시스 찾기**: 부산 공공데이터에서 코스 주변 500m 이내 맛집/카페 검색
6. **AI 설명 생성**: Upstage Solar가 코스 특징 및 하이라이트 생성
7. **결과 반환**: 프론트엔드에서 지도와 함께 코스 정보 표시

### 2. LLM 사용 전략

- **OpenAI GPT-4o-mini**: 이미지 분석만 담당 (러닝 사진 분석)
- **Upstage Solar Pro2**: 모든 텍스트 생성 담당
  - 코스 설명 생성
  - 릴스 대본 생성
  - RAG 기반 챗봇 응답
  - 오아시스 혜택 요약

### 3. 데이터 캐싱

- **공공데이터**: 30분 캐시 (buildRAGContext)
- **지도 타일**: 브라우저 캐시 활용
- **코스 정보**: LocalStorage에 저장

---

## 🎯 향후 개발 계획

### 선택적 기능 (우선순위 낮음)

1. **릴스 생성기** (ReelsGenerator.jsx)
   - 러닝 사진 업로드
   - AI가 자동으로 인스타그램 릴스 대본 생성
   - 키워드 입력 기능

2. **AI 컨시어지** (AIConcierge.jsx)
   - RAG 기반 챗봇
   - 부산 관광지, 맛집 추천
   - 코스 관련 질문 답변

3. **저장된 코스 관리** (SavedCourses.jsx)
   - 저장한 코스 목록 보기
   - 코스 상세 정보 확인
   - 코스 삭제 기능

---

## 🤝 기여하기

이 프로젝트는 오픈소스입니다. 기여를 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

## 📧 문의

프로젝트에 대한 질문이나 제안이 있으시면 이슈를 등록해주세요!

---

## 🙏 감사의 말

- **Upstage**: Solar LLM API 제공
- **Kakao**: 카카오맵 API 제공
- **부산광역시**: 공공데이터 제공
- **OpenAI**: GPT-4o-mini Vision API 제공

---

**Made with 🏃 for runners in Busan**

---

## 📊 프로젝트 현황

- **Backend**: ✅ 100% 완료
- **Frontend**: ✅ 100% 완료 (MVP 기능)
- **선택 기능**: ⏳ 추후 개발 예정

**개발 기간**: 2일 (해커톤)
**최종 업데이트**: 2025-11-27
