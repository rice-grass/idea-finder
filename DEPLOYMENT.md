# Idea Finder 배포 가이드

이 문서는 Idea Finder 애플리케이션을 **Vercel**(프론트엔드)과 **Render**(백엔드)에 배포하는 방법을 단계별로 설명합니다.

## 목차

1. [사전 준비](#사전-준비)
2. [백엔드 배포 (Render)](#백엔드-배포-render)
3. [프론트엔드 배포 (Vercel)](#프론트엔드-배포-vercel)
4. [배포 후 확인](#배포-후-확인)
5. [문제 해결](#문제-해결)

---

## 사전 준비

### 1. 필수 계정 생성

- **GitHub 계정**: 코드 저장소용
- **Render 계정**: https://render.com (GitHub 계정으로 가입 가능)
- **Vercel 계정**: https://vercel.com (GitHub 계정으로 가입 가능)

### 2. API 키 준비

다음 API 키들을 미리 준비하세요:

#### GitHub Personal Access Token
1. https://github.com/settings/tokens 접속
2. "Generate new token (classic)" 클릭
3. 권한 선택:
   - `public_repo` (공개 저장소 읽기)
   - `read:user` (사용자 정보 읽기)
4. 생성된 토큰을 안전한 곳에 복사

#### OpenAI API Key
1. https://platform.openai.com/api-keys 접속
2. "Create new secret key" 클릭
3. 생성된 키를 안전한 곳에 복사

### 3. GitHub 저장소에 코드 업로드

```bash
# 프로젝트 디렉토리에서
git init
git add .
git commit -m "Initial commit for deployment"

# GitHub에서 새 저장소 생성 후
git remote add origin https://github.com/YOUR_USERNAME/idea-finder.git
git branch -M main
git push -u origin main
```

⚠️ **중요**: `.env` 파일이 `.gitignore`에 포함되어 있어 업로드되지 않습니다. 이는 보안을 위해 필수입니다!

---

## 백엔드 배포 (Render)

### 1. Render에 로그인

1. https://render.com 접속
2. GitHub 계정으로 로그인

### 2. 새 Web Service 생성

1. Dashboard에서 **"New +"** 버튼 클릭
2. **"Web Service"** 선택
3. GitHub 저장소 연결:
   - "Connect a repository" 선택
   - `idea-finder` 저장소 선택

### 3. 서비스 설정

다음 정보를 입력하세요:

| 항목 | 값 |
|------|-----|
| **Name** | `idea-finder-backend` (또는 원하는 이름) |
| **Region** | Singapore (또는 가까운 지역) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | `Free` |

### 4. 환경 변수 설정

**Environment Variables** 섹션에서 다음을 추가:

```
NODE_ENV=production
PORT=3000
GITHUB_TOKEN=your_github_personal_access_token_here
OPENAI_API_KEY=your_openai_api_key_here
```

각 항목을 개별적으로 추가하세요:
- Key 입력
- Value 입력
- "Add Environment Variable" 클릭

### 5. 배포 시작

1. **"Create Web Service"** 클릭
2. 배포 진행 상황을 로그에서 확인
3. 배포 완료 후 URL 확인 (예: `https://idea-finder-backend.onrender.com`)

### 6. Health Check 확인

브라우저에서 다음 URL을 열어 서버 작동 확인:

```
https://YOUR-BACKEND-URL.onrender.com/health
```

응답 예시:
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

⚠️ **참고**: Render 무료 티어는 15분 동안 요청이 없으면 서버가 sleep 모드로 전환됩니다. 첫 요청 시 약 30초 정도 깨어나는 시간이 필요합니다.

---

## 프론트엔드 배포 (Vercel)

### 1. Vercel에 로그인

1. https://vercel.com 접속
2. GitHub 계정으로 로그인

### 2. 새 프로젝트 생성

1. Dashboard에서 **"Add New..."** → **"Project"** 클릭
2. GitHub 저장소 `idea-finder` 선택
3. **"Import"** 클릭

### 3. 프로젝트 설정

| 항목 | 값 |
|------|-----|
| **Framework Preset** | `Vite` (자동 감지됨) |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` (자동 설정) |
| **Output Directory** | `dist` (자동 설정) |

### 4. 환경 변수 설정

**Environment Variables** 섹션에서 추가:

```
VITE_API_BASE_URL=https://YOUR-BACKEND-URL.onrender.com
```

예시:
```
VITE_API_BASE_URL=https://idea-finder-backend.onrender.com
```

⚠️ **중요**: 백엔드 URL 끝에 `/`를 붙이지 마세요!

### 5. 배포 시작

1. **"Deploy"** 클릭
2. 빌드 진행 상황 확인
3. 배포 완료 후 URL 확인 (예: `https://idea-finder.vercel.app`)

### 6. 백엔드 CORS 설정 업데이트

배포된 프론트엔드 URL을 백엔드 코드에 추가해야 합니다:

1. `backend/src/index.js` 파일 수정:

```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? [
        'https://idea-finder.vercel.app',  // 실제 Vercel URL로 변경
        /\.vercel\.app$/
      ]
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
```

2. 변경사항 커밋 및 푸시:

```bash
git add backend/src/index.js
git commit -m "Update CORS for production"
git push
```

3. Render에서 자동으로 재배포됩니다 (약 2-3분 소요)

---

## 배포 후 확인

### 1. 프론트엔드 접속 테스트

1. Vercel URL로 접속: `https://YOUR-APP.vercel.app`
2. 페이지가 정상적으로 로드되는지 확인

### 2. API 연동 테스트

1. 개발자 타입 선택 (예: Frontend Developer)
2. 기술 스택 선택 (예: React, TypeScript)
3. "아이디어 생성하기" 버튼 클릭
4. 로딩 후 아이디어 카드가 표시되는지 확인

### 3. 챗봇 기능 테스트

1. 아이디어 저장 (⭐ 버튼)
2. "저장된 아이디어" 클릭
3. 아이디어 선택 후 "아이디어 컨설팅 시작" 클릭
4. AI 챗봇이 응답하는지 확인

---

## 문제 해결

### 백엔드 관련

#### 문제: 502 Bad Gateway 또는 서버 응답 없음

**원인**: Render 무료 티어가 sleep 모드에 있을 수 있습니다.

**해결책**:
- 30초 정도 기다린 후 다시 시도
- Render Dashboard에서 로그 확인

#### 문제: API 키 오류

**증상**: "OpenAI API error" 또는 "GitHub API error" 메시지

**해결책**:
1. Render Dashboard → Settings → Environment 확인
2. API 키가 올바르게 입력되었는지 확인
3. 환경 변수 수정 후 수동 재배포:
   - Manual Deploy → Deploy latest commit

#### 문제: CORS 오류

**증상**: 브라우저 콘솔에 "CORS policy" 오류

**해결책**:
1. `backend/src/index.js`의 CORS 설정 확인
2. Vercel URL이 정확히 포함되어 있는지 확인
3. 코드 푸시 후 Render 재배포 확인

### 프론트엔드 관련

#### 문제: API 호출 실패

**증상**: "Network Error" 또는 API 응답 없음

**해결책**:
1. Vercel Dashboard → Settings → Environment Variables 확인
2. `VITE_API_BASE_URL`이 올바른 백엔드 URL인지 확인
3. 환경 변수 수정 후 재배포:
   - Deployments → ... → Redeploy

#### 문제: 빌드 실패

**증상**: Vercel 빌드 중 에러 발생

**해결책**:
1. 로컬에서 빌드 테스트:
   ```bash
   cd frontend
   npm run build
   ```
2. 에러 메시지 확인 후 수정
3. 재푸시

#### 문제: 404 Not Found (라우팅 오류)

**증상**: 새로고침 시 404 페이지

**해결책**: `frontend/vercel.json` 파일이 올바르게 생성되어 있는지 확인 (이미 설정됨)

---

## 비용 정보

### Render (백엔드)
- **Free 플랜**:
  - 750시간/월 무료
  - 15분 비활동 시 sleep 모드
  - Cold start 시 30초 정도 소요
  - 메모리 제한: 512MB

### Vercel (프론트엔드)
- **Hobby 플랜** (무료):
  - 무제한 배포
  - 100GB 대역폭/월
  - Serverless Functions 지원
  - 자동 HTTPS

### API 비용
- **GitHub API**: 무료 (시간당 5,000 요청 제한)
- **OpenAI API**: 사용량 기반 과금
  - GPT-4: $0.03 / 1K tokens (입력)
  - 예상 비용: 아이디어 생성당 약 $0.01-0.05

---

## 추가 최적화 (선택사항)

### 1. 커스텀 도메인 설정

#### Vercel (프론트엔드)
1. Vercel Dashboard → Settings → Domains
2. 도메인 추가 및 DNS 설정

#### Render (백엔드)
1. Render Dashboard → Settings → Custom Domain
2. 도메인 추가 및 DNS 설정

### 2. 환경별 설정 분리

`.env.production` 파일을 생성하여 프로덕션 전용 설정 관리

### 3. 성능 모니터링

- Vercel Analytics 활성화
- Render Metrics 확인

---

## 지원 및 문의

문제가 해결되지 않는 경우:

1. **Render 문서**: https://render.com/docs
2. **Vercel 문서**: https://vercel.com/docs
3. **프로젝트 이슈**: GitHub Issues에 문의

---

## 체크리스트

배포 전 최종 확인:

- [ ] GitHub 저장소에 코드 업로드 완료
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있음
- [ ] GitHub Personal Access Token 준비
- [ ] OpenAI API Key 준비
- [ ] Render 계정 생성 및 로그인
- [ ] Vercel 계정 생성 및 로그인

백엔드 배포 확인:

- [ ] Render에서 웹 서비스 생성
- [ ] 환경 변수 설정 (GITHUB_TOKEN, OPENAI_API_KEY, PORT, NODE_ENV)
- [ ] 배포 성공 확인
- [ ] `/health` 엔드포인트 테스트 완료
- [ ] 백엔드 URL 복사

프론트엔드 배포 확인:

- [ ] Vercel에서 프로젝트 생성
- [ ] `VITE_API_BASE_URL` 환경 변수 설정
- [ ] 배포 성공 확인
- [ ] 백엔드 CORS 설정에 Vercel URL 추가
- [ ] 프론트엔드 URL 확인

최종 테스트:

- [ ] 프론트엔드 페이지 로드 확인
- [ ] 아이디어 생성 기능 테스트
- [ ] 아이디어 저장 기능 테스트
- [ ] AI 챗봇 기능 테스트

---

**배포 완료! 🎉**

이제 전 세계 어디서나 Idea Finder를 사용할 수 있습니다!
