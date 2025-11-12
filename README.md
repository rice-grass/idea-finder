<div align="center">
  <img src="./frontend/image/pigeon.png" alt="Pigeon Logo" width="400"/>

  <h3>AI 기반 맞춤형 오픈소스 프로젝트 아이디어 생성 플랫폼</h3>
</div>

개발자의 기술 스택과 관심사에 맞춰, GitHub 트렌드를 분석하고 **"많은 사람들이 필요로 하지만 아직 존재하지 않는"** 프로젝트 아이디어를 자동으로 발굴해드립니다.

## 핵심 가치

- **시장 검증된 아이디어**: GitHub API를 통해 실시간 개발 트렌드와 수요를 분석
- **맞춤형 추천**: 개발자 유형(프론트엔드/백엔드/풀스택)과 선호 기술 스택 기반 필터링
- **Gap 분석**: AI가 시장의 빈틈(수요는 높지만 공급이 부족한 영역)을 자동으로 식별
- **실용적 제안**: 단순 아이디어가 아닌 구현 가능한 로드맵과 함께 제공

## 주요 기능

### 1. 3단계 간편 프로세스
- **Step 1**: 개발자 유형 선택 (프론트엔드/백엔드/풀스택/데이터 사이언스 등)
- **Step 2**: 관심 기술 스택 선택 (React, Vue, Node.js, Python, Go 등)
- **Step 3**: 분석 기간 설정 및 아이디어 생성

### 2. 지능형 아이디어 생성
- GitHub 저장소 트렌드 실시간 분석
- OpenAI GPT를 활용한 창의적 아이디어 도출
- 난이도, 예상 소요 시간, 핵심 기능 자동 제시

### 3. 아이디어 관리 기능
- **저장 기능**: 마음에 드는 아이디어 로컬 저장
- **개선 기능**: 기존 아이디어를 더 구체화하거나 변형
- **트렌딩 토픽**: 현재 인기 있는 개발 주제 한눈에 확인

### 4. 모바일 최적화 UI
- 반응형 디자인으로 모바일 우선 경험 제공
- 직관적인 마법사(Wizard) 인터페이스
- 깔끔한 기업용 디자인

## 기술 스택

### Frontend
- **React** 19.1.1 - 현대적인 UI 라이브러리
- **Vite** 7.1.7 - 초고속 빌드 도구
- **Axios** - HTTP 통신
- **React Markdown** - 마크다운 렌더링
- **CSS3** - 애니메이션 및 반응형 디자인

### Backend
- **Node.js** ≥18.0.0 - 서버 런타임
- **Express** 5.1.0 - RESTful API 프레임워크
- **OpenAI API** - GPT 기반 아이디어 생성
- **Octokit** - GitHub API 통합
- **CORS** - Cross-Origin 지원

### 외부 API
- **GitHub API** - 저장소 트렌드 및 통계 분석
- **OpenAI GPT-4** - 자연어 기반 프로젝트 아이디어 생성

## 시작하기

### 사전 요구사항
- Node.js 18.0.0 이상
- npm 9.0.0 이상
- GitHub Personal Access Token
- OpenAI API Key

### 1. 환경 변수 설정

프로젝트 루트의 `backend/` 폴더에 `.env` 파일을 생성하세요:

```env
# GitHub API Token
GITHUB_TOKEN=your_github_personal_access_token

# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key

# Server Port (선택사항, 기본값: 3000)
PORT=3000
```

#### API 키 발급 방법

**GitHub Token 발급:**
1. [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens) 접속
2. "Generate new token (classic)" 클릭
3. `public_repo` 권한 선택
4. 토큰 생성 및 복사

**OpenAI API Key 발급:**
1. [OpenAI Platform](https://platform.openai.com/api-keys) 접속
2. "Create new secret key" 클릭
3. API 키 생성 및 복사

### 2. 백엔드 서버 실행

```bash
cd backend
npm install
npm start
```

✅ 서버가 `http://localhost:3000`에서 실행됩니다.

### 3️⃣ 프론트엔드 서버 실행

새 터미널 창을 열고:

```bash
cd frontend
npm install
npm run dev
```

✅ 프론트엔드가 `http://localhost:5173`에서 실행됩니다.

### 4️⃣ 브라우저에서 접속

`http://localhost:5173`을 열어서 서비스를 이용하세요!

## 📖 사용 방법

1. **개발자 유형 선택**: 본인의 개발 분야를 선택합니다
2. **기술 스택 선택**: 사용하고 싶은 기술들을 골라주세요 (복수 선택 가능)
3. **분석 기간 설정**: GitHub에서 분석할 기간을 선택합니다 (7일/14일/30일)
4. **아이디어 생성하기**: AI가 맞춤형 프로젝트 아이디어를 생성합니다
5. **아이디어 관리**: 마음에 드는 아이디어를 저장하거나 개선할 수 있습니다

## 🎨 주요 화면

- **메인 화면**: 3단계 위저드 인터페이스
- **결과 화면**: 생성된 아이디어 카드 형태로 표시
- **트렌딩 토픽**: 현재 인기 있는 개발 주제 태그
- **저장된 아이디어**: 로컬 스토리지에 저장된 아이디어 관리

## 🔧 프로젝트 구조

```
idea-finder/
├── backend/              # Node.js 백엔드 서버
│   ├── src/
│   │   ├── index.js     # 서버 엔트리포인트
│   │   ├── routes/      # API 라우트
│   │   ├── services/    # 비즈니스 로직
│   │   └── utils/       # 유틸리티 함수
│   └── package.json
│
└── frontend/            # React 프론트엔드
    ├── src/
    │   ├── pages/       # 페이지 컴포넌트
    │   ├── components/  # 재사용 가능한 컴포넌트
    │   ├── services/    # API 통신 레이어
    │   ├── utils/       # 유틸리티 함수
    │   └── App.jsx      # 루트 컴포넌트
    └── package.json
```

## 💡 작동 원리

1. **데이터 수집**: GitHub API를 통해 최근 트렌드 저장소 및 이슈 분석
2. **Gap 분석**: 스타 수 대비 이슈/토론 비율로 수요 높은 영역 식별
3. **AI 생성**: 수집된 데이터를 OpenAI GPT에 전달하여 맞춤형 아이디어 도출
4. **구조화**: 생성된 아이디어를 난이도, 기능, 기술 스택 등으로 구조화하여 제공

## 🤝 기여하기

이 프로젝트는 오픈소스입니다. 기여를 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📧 문의

프로젝트에 대한 질문이나 제안이 있으시면 이슈를 등록해주세요!

---

**Made with ❤️ for developers who want to build meaningful projects**
