# Open Source Project Idea Generator

GitHub 트렌드 분석을 통해 부족한 분야를 자동으로 발굴하고 혁신적인 오픈소스 프로젝트 아이디어를 제안하는 서비스입니다.

## 프로젝트 개요

이 서비스는 다음과 같은 기능을 제공합니다:

- **GitHub 트렌드 분석**: 최신 GitHub 저장소의 트렌드를 실시간으로 분석
- **시장 갭 발굴**: 현재 생태계에서 부족한 영역을 자동으로 식별
- **AI 기반 아이디어 생성**: OpenAI API를 활용하여 실현 가능한 프로젝트 아이디어 제안
- **맞춤형 필터링**: 프로그래밍 언어 및 기간별 분석 가능

## 기술 스택

### Backend
- Node.js + Express
- GitHub API (@octokit/rest)
- OpenAI API (gpt-3.5-turbo)
- dotenv (환경 변수 관리)

### Frontend
- React (Vite)
- Axios (HTTP 클라이언트)

## 프로젝트 구조

```
Idea Finder/
├── backend/                 # 백엔드 서버
│   ├── src/
│   │   ├── routes/         # API 라우트
│   │   │   ├── github.js   # GitHub API 엔드포인트
│   │   │   └── idea.js     # 아이디어 생성 엔드포인트
│   │   ├── services/       # 비즈니스 로직
│   │   │   ├── githubService.js
│   │   │   └── openaiService.js
│   │   └── index.js        # 서버 진입점
│   ├── .env                # 환경 변수 (설정 필요)
│   └── package.json
├── frontend/               # 프론트엔드 앱
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   └── Home.jsx    # 메인 페이지
│   │   ├── services/
│   │   │   └── api.js      # API 클라이언트
│   │   ├── App.jsx
│   │   └── App.css
│   ├── .env                # 환경 변수
│   └── package.json
├── .gitignore
├── .env.example            # 환경 변수 템플릿
└── README.md
```

## 설치 및 실행 방법

### 1. 저장소 클론

```bash
git clone <repository-url>
cd "Idea Finder"
```

### 2. 환경 변수 설정

#### Backend 설정

`backend/.env` 파일을 생성하고 다음 내용을 입력하세요:

```env
GITHUB_TOKEN=your_github_personal_access_token
OPENAI_API_KEY=your_openai_api_key
PORT=3000
```

**API 키 발급 방법:**

- **GitHub Token**: [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens) 에서 생성
  - 필요한 권한: `public_repo` (공개 저장소 읽기)

- **OpenAI API Key**: [OpenAI Platform](https://platform.openai.com/api-keys) 에서 생성
  - Free tier 사용 가능

#### Frontend 설정

`frontend/.env` 파일을 생성하고 다음 내용을 입력하세요:

```env
VITE_API_URL=http://localhost:3000
```

### 3. 백엔드 실행

```bash
cd backend
npm install
npm run dev
```

서버가 `http://localhost:3000` 에서 실행됩니다.

### 4. 프론트엔드 실행

새 터미널을 열고:

```bash
cd frontend
npm install
npm run dev
```

프론트엔드가 `http://localhost:5173` 에서 실행됩니다.

## API 엔드포인트

### GitHub API

#### GET /api/github/trending
최신 트렌딩 저장소 조회

**Query Parameters:**
- `language` (optional): 프로그래밍 언어 필터
- `days` (optional): 조회 기간 (기본값: 7)

#### GET /api/github/analyze
GitHub 트렌드 분석

**Query Parameters:**
- `language` (optional): 프로그래밍 언어 필터
- `days` (optional): 조회 기간 (기본값: 7)

#### GET /api/github/search
토픽으로 저장소 검색

**Query Parameters:**
- `topic` (required): 검색할 토픽

### Ideas API

#### POST /api/ideas/generate
프로젝트 아이디어 생성

**Request Body:**
```json
{
  "language": "javascript",
  "days": 7
}
```

#### POST /api/ideas/analyze
특정 아이디어 분석

**Request Body:**
```json
{
  "ideaDescription": "프로젝트 아이디어 설명"
}
```

## 사용 방법

1. 브라우저에서 `http://localhost:5173` 접속
2. 프로그래밍 언어 선택 (선택사항)
3. 분석 기간 선택 (7일, 14일, 30일)
4. "Generate Ideas" 버튼 클릭
5. GitHub 트렌드 분석 결과 및 AI 생성 아이디어 확인

## 주요 기능

### 1. GitHub 트렌드 분석
- 최신 인기 저장소의 토픽 분석
- 사용 언어 통계
- 프로젝트 설명에서 키워드 추출

### 2. AI 기반 아이디어 생성
- 트렌드 데이터를 기반으로 시장 갭 식별
- 실현 가능한 프로젝트 아이디어 제안
- 각 아이디어별 기술 스택 및 기능 제안

### 3. 맞춤형 분석
- 특정 프로그래밍 언어로 필터링
- 분석 기간 조정 가능

## 개발 계획

- [ ] 사용자 인증 및 저장 기능
- [ ] 아이디어 북마크 및 관리
- [ ] 더 상세한 트렌드 시각화
- [ ] GitHub 이슈 분석을 통한 수요 파악
- [ ] 커뮤니티 투표 기능

## 라이선스

MIT License

## 기여

버그 리포트 및 기능 제안은 이슈를 통해 제출해주세요.

## 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해주세요.
