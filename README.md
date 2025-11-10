# Open Source Project Idea Finder

개발자 맞춤형 오픈소스 프로젝트 아이디어 생성 서비스

## 무엇인가요?

GitHub 트렌드 분석과 AI를 활용하여 **"많이 필요하지만 아직 없는"** 프로젝트를 자동으로 찾아주는 스마트 아이디어 파인더입니다.

### 주요 기능
- 개발자 유형별 맞춤 추천 (프론트엔드/백엔드/풀스택)
- 기술 스택 기반 필터링 (React, Vue, Node.js, Python 등)
- Gap 분석으로 시장 수요가 높은 영역 자동 식별
- OpenAI를 활용한 실용적인 프로젝트 아이디어 생성
- 3단계 위저드 UI로 간편한 사용

## 실행 방법

### 1. 환경 변수 설정

프로젝트 루트에 `.env` 파일 생성:

```env
# GitHub API
GITHUB_TOKEN=your_github_personal_access_token

# OpenAI API
OPENAI_API_KEY=your_openai_api_key

# Server Port (optional)
PORT=3000
```

**API 키 발급:**
- **GitHub Token**: [Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)에서 `public_repo` 권한으로 생성
- **OpenAI API Key**: [OpenAI Platform](https://platform.openai.com/api-keys)에서 생성

### 2. 백엔드 서버 실행

```bash
cd backend
npm install
node src/index.js
```

서버가 `http://localhost:3000`에서 실행됩니다.

### 3. 프론트엔드 서버 실행

새 터미널에서:

```bash
cd frontend
npm install
npm run dev
```

프론트엔드가 `http://localhost:5173`에서 실행됩니다.

### 4. 브라우저 접속

`http://localhost:5173`을 열어 사용하세요.

## 기술 스택

- **Backend**: Node.js, Express, GitHub API, OpenAI API
- **Frontend**: React, Vite, Axios
