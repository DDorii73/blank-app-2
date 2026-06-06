# 문단글 읽기 유창성 검사 보조 Web-app

교사가 학생의 읽기 자료와 STT 전사 텍스트를 입력하고 읽기 속도, 오류 유형,
문단글 읽기 유창성 점수, 개별 보고서를 관리하는 정적 Web-app입니다.

## 주요 설계

- 학생은 로그인하지 않습니다.
- Google 로그인은 교사 인증 용도로만 사용합니다.
- 로그인하지 않은 사용자는 학생 검사 페이지와 교사 모니터링 페이지에 접근할 수 없습니다.
- 녹음 원본 파일은 Firebase에 저장하지 않습니다.
- Firebase에는 학생 정보, 검사 날짜, 전사 텍스트, 읽기 속도, 오류 분석 결과,
  최종 점수, 보고서 내용만 저장합니다.
- OpenAI API Key는 프론트엔드에 두지 않습니다.
- 녹음 파일 전사는 추후 Firebase Functions 같은 서버 환경에서 처리할 수 있도록
  `src/main.js`의 `convertRecordingToText` 함수 구조만 준비했습니다.

## 파일 구조

```text
src/
  firebaseConfig.js   Firebase 설정, Auth, Firestore 초기화
  index.js            메인 페이지 Google 로그인 관리
  main.js             학생 정보 및 검사 페이지 기능
  admin.js            교사 모니터링 페이지 기능
  styles.css          전체 디자인
index.html            메인 페이지
student.html          학생 정보 및 검사 페이지
teacherMonitor.html   교사 모니터링 페이지
```

## Firebase 설정

1. Firebase 프로젝트에서 Web app을 생성합니다.
2. Authentication에서 Google provider를 활성화합니다.
3. Firestore Database를 생성합니다.
4. `src/firebaseConfig.js`의 `firebaseConfig` 값을 Firebase 콘솔의 Web app
   설정값으로 교체합니다.

Firestore 컬렉션 이름은 `readingFluencyResults`입니다. 문서에는 교사 UID가 함께
저장되므로 모니터링 페이지는 현재 로그인한 교사의 결과만 조회합니다.

## 로컬 실행

프로젝트 자체 Vite 실행 명령으로 5173 포트에서 실행합니다.

```bash
npm install
npm run dev
```

이후 `http://localhost:5173`으로 접속합니다.
