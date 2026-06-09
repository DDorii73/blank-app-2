import { auth } from "./firebaseConfig.js";
import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

const elements = {
  authGate: document.querySelector("#authGate"),
  appContent: document.querySelector("#appContent"),
  teacherInfo: document.querySelector("#teacherInfo"),
  logoutBtn: document.querySelector("#logoutBtn"),
  assessmentForm: document.querySelector("#assessmentForm"),
  resetFormBtn: document.querySelector("#resetFormBtn"),
  studentName: document.querySelector("#studentName"),
  studentId: document.querySelector("#studentId"),
  grade: document.querySelector("#grade"),
  className: document.querySelector("#className"),
  testDate: document.querySelector("#testDate"),
  passageTitle: document.querySelector("#passageTitle"),
  passageTabs: document.querySelectorAll(".passage-tab"),
  readingPassage: document.querySelector("#readingPassage"),
  transcriptFile: document.querySelector("#transcriptFile"),
  loadTranscriptBtn: document.querySelector("#loadTranscriptBtn"),
  transcriptText: document.querySelector("#transcriptText"),
  startRecordingBtn: document.querySelector("#startRecordingBtn"),
  stopRecordingBtn: document.querySelector("#stopRecordingBtn"),
  rerecordBtn: document.querySelector("#rerecordBtn"),
  transcribeRecordingBtn: document.querySelector("#transcribeRecordingBtn"),
  recordingPanel: document.querySelector("#recordingPanel"),
  recordingVisualText: document.querySelector("#recordingVisualText"),
  recordingPlayer: document.querySelector("#recordingPlayer"),
  recordingStatus: document.querySelector("#recordingStatus"),
  durationSec: document.querySelector("#durationSec"),
  analyzeBtn: document.querySelector("#analyzeBtn"),
  saveResultBtn: document.querySelector("#saveResultBtn"),
  tempSaveBtn: document.querySelector("#tempSaveBtn"),
  analysisStatus: document.querySelector("#analysisStatus"),
  resultsPanel: document.querySelector("#resultsPanel"),
  scoreBadge: document.querySelector("#scoreBadge"),
  summaryTableBody: document.querySelector("#summaryTableBody"),
  errorTableBody: document.querySelector("#errorTableBody"),
  reportText: document.querySelector("#reportText"),
};

const PASSAGE_OPTIONS = {
  gimbap: {
    title: "김밥만들기",
    level: "1,2학년수준",
    text: "김밥을 만들기 위해 필요한 재료를 준비한다. 먼저 김을 깔고 밥을 잘 펴준다. 그리고 단무지와 살짝 볶은 오이와 당근을 길게 썰어 얹어준다. 햄도 볶아서 올리고 계란은 넓게 부친다. 계란이 익으면 칼로 썰어 얹어준다. 발로 터지지 않도록 잘 말아 손바닥으로 꼭꼭 눌러준다. 그리고 김밥을 도마 위에 올려놓고 칼로 한입크기로 썬다.",
  },
  mountainSea: {
    title: "산과 바다",
    level: "3,4학년수준",
    text: "여름철이 되면 사람들은 여행을 가는데 어떤 사람들은 바다를 선호하고 어떤 사람들은 산을 선호한다. 산과 바다는 유사한 점과 차이점이 있어 사람들은 어디로 가야할지 고민한다.\n산과 바다의 유사한 점은 고된 일을 잊고 편안하게 쉴 수 있다는 것이다.\n그리고 산은 올라갈 때 미끄러지지 않게 조심해야 하고 바다는 물에 빠지지 않게 조심해야 한다는 주의점이 있는 것도 유사하다.\n산과 바다는 다른 점도 가지고 있는데 첫째, 산은 정상에 도착하기까지 올라가는 것이 힘들다. 그러나 바다는 바다를 바라보며 천천히 걸을 수 있어 힘이 들지 않는다. 그리고 산은 나무를 볼 수 있고 바다는 푸른 바다를 볼 수 있다는 것이 다르다. 또 산에서는 산새들과 곤충들을 볼 수 있고 바다에서는 갈매기와 바다생물들을 볼 수 있다는 것이 다르다.",
  },
  clothing: {
    title: "의생활",
    level: "5,6학년수준",
    text: "우리들은 항상 의상을 입고 지내며 어떤 의상을 선택할지에 대해서도 중요하게 생각합니다. 이러한 의상은 나름대로의 특성들이 있으며 국가, 직업, 쓰임새에 따라서 분류해볼 수 있습니다.\n먼저 국가로 분류해보자면 사리, 한복, 기모노, 치파오 등의 나라를 대표하는 전통의상이 있습니다. 우리나라의 전통의상인 한복은 품이 큰 바지와 저고리, 치마로 된 색이 고운 의상이며 저고리는 옷고름을 이용하여 여미는 것이 특징입니다. 인도의 전통의상인 사리의 특징은 온몸을 덮을 만큼 큰 천으로 몸을 가리는 것이며, 일본의 전통의상인 기모노는 나누어지지 않은 큰 옷감으로 온몸을 감싼 후 허리를 매는 것이 특징입니다. 그리고 중국의 전통의상 치파오는 화려한 장식이 수놓아진 치마에 상의는 목까지 올라와 단추로 잠그는 것이 특징입니다.\n다음으로 직업으로 분류해보자면 요리사, 소방관, 경찰관 등의 사람들이 근무할 때 입는 의상으로 나눌 수 있습니다. 요리사는 요리를 할 때 몸에 붙어 있는 이물질이 요리에 들어가는 것을 방지하기 위해 가운을 입습니다. 소방관은 위험한 상황에 노출되어 있으며 화염 속에서 불이 몸에 붙는 것을 막기 위해 소방관복을 입어 몸을 화상으로부터 보호합니다. 마지막으로 경찰관은 사람들에게 범죄나 불법적인 일에 대한 경각심을 일으키기 위해 경찰복을 입어서 특별한 경찰관의 신분을 나타냅니다.\n마지막으로 쓰임새로 분류해보면 수영복, 우비, 웨딩드레스 등으로 나눌 수 있습니다. 우리는 수영을 할 때 물 속에서 저항을 줄이고 앞으로 나아가는 데 방해를 받지 않으려고 수영복을 입습니다. 비가 오는 날에는 우산을 써도 바람을 타고 들이치는 비를 막고 우산을 들지 않음으로써 보다 자유롭게 활동하기 위해 우비를 입습니다. 그리고 결혼을 할 때에는 순결하고 고귀함을 나타내기 위해 순백색의 웨딩드레스를 입습니다.\n위에서 우리는 의상을 나라, 직업, 쓰임새에 따라 분류해 보았습니다. 이렇게 의생활은 우리의 생활과 밀접하게 연결되어 있어 뗄 수 없으며 우리는 상황에 맞는 의상을 선택해서 입어야 합니다.",
  },
};

let currentTeacher = null;
let mediaRecorder = null;
let mediaStream = null;
let recordingChunks = [];
let recordingStartedAt = 0;
let recordedBlob = null;
let recordingUrl = "";
let analysisResult = null;
let selectedPassageKey = "gimbap";

elements.testDate.valueAsDate = new Date();
applySelectedPassage();

if (auth) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "./index.html";
      return;
    }

    currentTeacher = user;
    elements.authGate.classList.add("hidden");
    elements.appContent.classList.remove("hidden");
    elements.teacherInfo.textContent = `${user.displayName || user.email} 교사 계정`;
  });
} else {
  window.location.href = "./index.html";
}

elements.logoutBtn.addEventListener("click", async () => {
  if (!auth) return;
  await signOut(auth);
});

elements.resetFormBtn.addEventListener("click", () => {
  elements.assessmentForm.reset();
  elements.testDate.valueAsDate = new Date();
  selectedPassageKey = "gimbap";
  applySelectedPassage();
  elements.resultsPanel.classList.add("hidden");
  elements.summaryTableBody.replaceChildren();
  elements.errorTableBody.replaceChildren();
  elements.reportText.value = "";
  elements.scoreBadge.textContent = "-";
  elements.saveResultBtn.disabled = true;
  elements.analysisStatus.textContent = "분석 전입니다.";
  analysisResult = null;
  clearRecording();
});

elements.passageTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    selectedPassageKey = tab.dataset.passage;
    applySelectedPassage();
  });
});

elements.loadTranscriptBtn.addEventListener("click", async () => {
  const file = elements.transcriptFile.files?.[0];
  if (!file) {
    elements.analysisStatus.textContent = "업로드할 STT 전사파일을 선택해 주세요.";
    return;
  }

  try {
    const fileText = await file.text();
    elements.transcriptText.value = extractTranscriptText(fileText, file.name);
    elements.analysisStatus.textContent = `${file.name} 전사파일을 불러왔습니다.`;
  } catch (error) {
    elements.analysisStatus.textContent = `전사파일을 읽지 못했습니다: ${error.message}`;
  }
});

elements.startRecordingBtn.addEventListener("click", startRecording);
elements.stopRecordingBtn.addEventListener("click", stopRecording);
elements.rerecordBtn.addEventListener("click", restartRecording);
elements.transcribeRecordingBtn.addEventListener("click", transcribeRecording);
elements.analyzeBtn.addEventListener("click", runAnalysis);
elements.saveResultBtn.addEventListener("click", saveAnalysisResult);
elements.tempSaveBtn.addEventListener("click", saveStudentDraft);

function applySelectedPassage() {
  const selectedPassage = PASSAGE_OPTIONS[selectedPassageKey] || PASSAGE_OPTIONS.gimbap;
  elements.passageTitle.value = `${selectedPassage.title} (${selectedPassage.level})`;
  elements.readingPassage.value = selectedPassage.text;
  elements.passageTabs.forEach((tab) => {
    const isActive = tab.dataset.passage === selectedPassageKey;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });
}

async function startRecording() {
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
    elements.recordingStatus.textContent = "이 브라우저는 녹음을 지원하지 않습니다.";
    return;
  }

  try {
    clearRecording();
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const options = MediaRecorder.isTypeSupported("audio/webm")
      ? { mimeType: "audio/webm" }
      : {};
    mediaRecorder = new MediaRecorder(mediaStream, options);
    recordingChunks = [];
    recordingStartedAt = Date.now();

    mediaRecorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) {
        recordingChunks.push(event.data);
      }
    });

    mediaRecorder.addEventListener("stop", () => {
      recordedBlob = new Blob(recordingChunks, { type: mediaRecorder.mimeType || "audio/webm" });
      recordingUrl = URL.createObjectURL(recordedBlob);
      elements.recordingPlayer.src = recordingUrl;
      elements.recordingPlayer.classList.remove("hidden");
      elements.rerecordBtn.disabled = false;
      elements.transcribeRecordingBtn.disabled = false;
      elements.recordingStatus.textContent =
        "녹음이 완료되었습니다. 원본 파일은 Firebase에 저장되지 않습니다.";
      setRecordingVisualState("completed");
      stopMediaStream();
    });

    mediaRecorder.start();
    elements.startRecordingBtn.disabled = true;
    elements.stopRecordingBtn.disabled = false;
    elements.rerecordBtn.disabled = true;
    elements.transcribeRecordingBtn.disabled = true;
    elements.recordingStatus.textContent = "녹음 중입니다.";
    setRecordingVisualState("recording");
  } catch (error) {
    elements.recordingStatus.textContent = `마이크 접근 실패: ${error.message}`;
    setRecordingVisualState("idle");
    stopMediaStream();
  }
}

function stopRecording() {
  if (mediaRecorder?.state === "recording") {
    mediaRecorder.stop();
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - recordingStartedAt) / 1000));
    elements.durationSec.value = elapsedSeconds;
  }

  elements.startRecordingBtn.disabled = false;
  elements.stopRecordingBtn.disabled = true;
}

function restartRecording() {
  clearRecording();
  startRecording();
}

function setRecordingVisualState(state) {
  const isRecording = state === "recording";
  elements.recordingPanel.classList.toggle("recording-active", isRecording);
  elements.recordingVisualText.textContent = {
    idle: "녹음 대기",
    recording: "녹음 중",
    completed: "녹음 완료",
  }[state] || "녹음 대기";
}

async function transcribeRecording() {
  if (!recordedBlob) {
    elements.recordingStatus.textContent = "변환할 녹음 파일이 없습니다.";
    return;
  }

  try {
    elements.recordingStatus.textContent = "서버 전사 함수 호출을 준비 중입니다.";
    const transcript = await convertRecordingToText(recordedBlob);
    elements.transcriptText.value = transcript;
    elements.recordingStatus.textContent = "녹음 파일 전사가 완료되었습니다.";
  } catch (error) {
    elements.recordingStatus.textContent = error.message;
  }
}

async function convertRecordingToText(recordingBlob) {
  const serverTranscriptionEndpoint = "/api/transcribe";

  const formData = new FormData();
  formData.append("recording", recordingBlob, "reading-recording.webm");

  const response = await fetch(serverTranscriptionEndpoint, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "서버 전사 함수 호출에 실패했습니다.");
  }

  const data = await response.json();
  return data.transcript || "";
}

function runAnalysis() {
  try {
    const input = collectAssessmentInput();
    analysisResult = analyzeReading(input);
    renderAnalysisTable(analysisResult);
    renderReport(analysisResult.report);
    elements.resultsPanel.classList.remove("hidden");
    elements.saveResultBtn.disabled = false;
    elements.analysisStatus.textContent = "분석 결과가 생성되었습니다. 필요하면 보고서를 수정한 뒤 저장하세요.";
  } catch (error) {
    elements.analysisStatus.textContent = error.message;
  }
}

function saveAnalysisResult() {
  if (!currentTeacher) {
    elements.analysisStatus.textContent = "교사 로그인이 필요합니다.";
    return;
  }

  if (!analysisResult) {
    runAnalysis();
  }

  if (!analysisResult) {
    return;
  }

  const payload = {
    teacherUid: currentTeacher.uid,
    teacherEmail: currentTeacher.email || "",
    studentName: analysisResult.student.name,
    gradeClass: [analysisResult.student.grade, analysisResult.student.className].filter(Boolean).join(" / "),
    testDate: analysisResult.testDate,
    passageTitle: analysisResult.passageTitle,
    transcriptText: analysisResult.transcriptText,
    readingSpeed: analysisResult.readingSpeed,
    errorAnalysis: analysisResult.errorAnalysis,
    fluencyScore: analysisResult.finalScore,
    reportText: elements.reportText.value,
    createdAt: new Date().toISOString(),
  };

  console.log("Firestore 저장 예정 데이터", payload);
  elements.analysisStatus.textContent =
    "저장 예정 데이터를 콘솔에 출력했습니다. 추후 Firestore 저장으로 연결할 예정입니다.";
}

function saveStudentDraft() {
  const studentName = elements.studentName.value.trim() || "이름미입력";
  const draftKey = [
    "readingFluencyDraft",
    currentTeacher?.uid || "guest",
    elements.studentId.value.trim() || studentName,
  ].join(":");
  const draft = {
    studentName,
    studentId: elements.studentId.value.trim(),
    grade: elements.grade.value.trim(),
    className: elements.className.value.trim(),
    testDate: elements.testDate.value,
    passageKey: selectedPassageKey,
    passageTitle: elements.passageTitle.value,
    transcriptText: elements.transcriptText.value,
    durationSec: elements.durationSec.value,
    reportText: elements.reportText.value,
    analysisResult,
    savedAt: new Date().toISOString(),
  };

  localStorage.setItem(draftKey, JSON.stringify(draft));
  console.log("학생별 임시저장 데이터", draft);
  const message = [
    `${studentName} 학생의 임시저장이 완료되었습니다.`,
    "",
    "확인 위치:",
    "현재 브라우저의 Local Storage에 저장됩니다.",
    `저장 키: ${draftKey}`,
    "",
    "브라우저 개발자 도구 > Application > Local Storage에서 확인할 수 있습니다.",
  ].join("\n");
  elements.analysisStatus.textContent = `${studentName} 학생의 임시저장이 완료되었습니다. 브라우저 Local Storage에서 확인할 수 있습니다.`;
  alert(message);
}

function collectAssessmentInput() {
  const durationSec = Number(elements.durationSec.value);
  const studentName = elements.studentName.value.trim();
  const testDate = elements.testDate.value;
  const passageText = normalizeWhitespace(elements.readingPassage.value);
  const transcriptText = normalizeWhitespace(elements.transcriptText.value);

  if (!studentName) {
    throw new Error("학생 이름을 입력해 주세요.");
  }
  if (!testDate) {
    throw new Error("검사 날짜를 입력해 주세요.");
  }
  if (!passageText) {
    throw new Error("문단글 원문을 입력해 주세요.");
  }
  if (!transcriptText) {
    throw new Error("전사 텍스트를 입력해 주세요.");
  }
  if (!durationSec || durationSec <= 0) {
    throw new Error("실제 읽기 시간(초)을 입력해 주세요.");
  }

  return {
    student: {
      name: studentName,
      studentId: elements.studentId.value.trim(),
      grade: elements.grade.value.trim(),
      className: elements.className.value.trim(),
    },
    testDate,
    passageTitle: elements.passageTitle.value.trim(),
    passageText,
    transcriptText,
    durationSec,
  };
}

function analyzeReadingText(text) {
  const normalizedText = normalizeWhitespace(text);
  const tokens = tokenizeEojeol(normalizedText);
  const repetitions = detectRepetitions(tokens);
  const repeatedExamples = getUniqueValues(repetitions.map((item) => item.transcript)).slice(0, 3);

  return {
    source: "temporary-local-analysis",
    summary:
      "현재는 OpenAI API를 호출하지 않고 브라우저에서 계산한 임시 분석 결과입니다. 추후 서버 함수에서 OpenAI 분석 결과로 교체할 수 있습니다.",
    tokenCount: tokens.length,
    characterCount: countReadableCharacters(normalizedText),
    errorTypes: [
      {
        type: "repetition",
        label: "반복",
        count: repetitions.length,
        examples: repeatedExamples,
        interpretation: "같은 어절이 연속으로 반복된 경우를 임시로 감지했습니다.",
      },
      {
        type: "substitution",
        label: "대치/발음 오류",
        count: 0,
        examples: [],
        interpretation: "정밀한 발음 및 대치 오류는 추후 OpenAI 분석 함수에서 판별할 예정입니다.",
      },
      {
        type: "omission",
        label: "누락",
        count: 0,
        examples: [],
        interpretation: "원문 대비 누락 오류는 원문 비교 또는 추후 OpenAI 분석 결과와 함께 판별합니다.",
      },
      {
        type: "insertion",
        label: "삽입",
        count: 0,
        examples: [],
        interpretation: "원문에 없는 어절 삽입 여부는 원문 비교 또는 추후 OpenAI 분석 결과와 함께 판별합니다.",
      },
    ],
  };
}

function calculateReadingSpeed(text, readingTime) {
  const durationSec = Number(readingTime);
  const safeDurationSec = durationSec > 0 ? durationSec : 1;
  const words = tokenizeEojeol(text);
  const readableCharacters = countReadableCharacters(text);
  const charactersPerMinute = Math.round((readableCharacters / safeDurationSec) * 60);
  const wordsPerMinute = Math.round((words.length / safeDurationSec) * 60);

  return {
    readableCharacters,
    wordCount: words.length,
    syllablesPerMinute: charactersPerMinute,
    wordsPerMinute,
    cpm: charactersPerMinute,
    wpm: wordsPerMinute,
  };
}

function analyzeReading(input) {
  const textAnalysis = analyzeReadingText(input.transcriptText);
  const referenceTokens = tokenizeEojeol(input.passageText);
  const transcriptTokens = tokenizeEojeol(input.transcriptText);
  const alignment = alignTokens(referenceTokens, transcriptTokens);
  const repetitions = detectRepetitions(transcriptTokens);

  const counts = alignment.operations.reduce(
    (accumulator, operation) => {
      accumulator[operation.type] += 1;
      return accumulator;
    },
    { match: 0, omission: 0, insertion: 0, substitution: 0 },
  );
  counts.repetition = repetitions.length;

  const referenceCount = referenceTokens.length;
  const transcriptCount = transcriptTokens.length;
  const referenceCharacters = countReadableCharacters(input.passageText);
  const readingSpeed = calculateReadingSpeed(input.transcriptText, input.durationSec);
  const charactersRead = readingSpeed.readableCharacters;
  const accuracyPercent = referenceCount
    ? roundToOne((counts.match / referenceCount) * 100)
    : 0;
  const completenessPercent = referenceCount
    ? roundToOne(((counts.match + counts.substitution) / referenceCount) * 100)
    : 0;
  const errorDetails = alignment.operations
    .filter((operation) => operation.type !== "match")
    .concat(repetitions);
  const errorSummaryRows = buildErrorSummaryRows(counts, errorDetails, textAnalysis);
  const totalErrors = counts.omission + counts.insertion + counts.substitution + counts.repetition;
  const totalReadSyllables = charactersRead;
  const errorSyllables = countErrorSyllables(errorDetails);
  const correctSyllables = Math.max(totalReadSyllables - errorSyllables, 0);
  const correctSyllablesPer10Sec = roundToOne((correctSyllables / input.durationSec) * 10);
  const score = correctSyllablesPer10Sec;

  const result = {
    ...input,
    readingSpeed: {
      ...readingSpeed,
      referenceCharacters,
      charactersRead,
      referenceWordCount: referenceCount,
      transcriptWordCount: transcriptCount,
    },
    errorAnalysis: {
      textAnalysis,
      counts,
      accuracyPercent,
      completenessPercent,
      totalErrors,
      details: errorDetails,
      summaryRows: errorSummaryRows,
    },
    finalScore: {
      score,
      totalReadSyllables,
      errorSyllables,
      correctSyllables,
      correctSyllablesPer10Sec,
      scoringRule: "[(전체 읽은 음절 수 - 오류를 보인 음절 수) / 전체 문단글 읽기 시간(초)] × 10",
    },
  };

  result.report = generateReadingReport(result);
  return result;
}

function alignTokens(referenceTokens, transcriptTokens) {
  const rowCount = referenceTokens.length + 1;
  const columnCount = transcriptTokens.length + 1;
  const dp = Array.from({ length: rowCount }, () => Array(columnCount).fill(0));

  for (let row = 0; row < rowCount; row += 1) {
    dp[row][0] = row;
  }
  for (let column = 0; column < columnCount; column += 1) {
    dp[0][column] = column;
  }

  for (let row = 1; row < rowCount; row += 1) {
    for (let column = 1; column < columnCount; column += 1) {
      const substitutionCost = areTokensEqual(referenceTokens[row - 1], transcriptTokens[column - 1]) ? 0 : 1;
      dp[row][column] = Math.min(
        dp[row - 1][column] + 1,
        dp[row][column - 1] + 1,
        dp[row - 1][column - 1] + substitutionCost,
      );
    }
  }

  const operations = [];
  let row = referenceTokens.length;
  let column = transcriptTokens.length;

  while (row > 0 || column > 0) {
    if (row > 0 && column > 0) {
      const isSame = areTokensEqual(referenceTokens[row - 1], transcriptTokens[column - 1]);
      const cost = isSame ? 0 : 1;
      if (dp[row][column] === dp[row - 1][column - 1] + cost) {
        operations.push({
          type: isSame ? "match" : "substitution",
          reference: referenceTokens[row - 1],
          transcript: transcriptTokens[column - 1],
          referenceIndex: row,
          transcriptIndex: column,
        });
        row -= 1;
        column -= 1;
        continue;
      }
    }

    if (row > 0 && dp[row][column] === dp[row - 1][column] + 1) {
      operations.push({
        type: "omission",
        reference: referenceTokens[row - 1],
        transcript: "",
        referenceIndex: row,
        transcriptIndex: column,
      });
      row -= 1;
      continue;
    }

    operations.push({
      type: "insertion",
      reference: "",
      transcript: transcriptTokens[column - 1],
      referenceIndex: row,
      transcriptIndex: column,
    });
    column -= 1;
  }

  return { distance: dp[referenceTokens.length][transcriptTokens.length], operations: operations.reverse() };
}

function detectRepetitions(tokens) {
  const repetitions = [];

  for (let index = 1; index < tokens.length; index += 1) {
    if (areTokensEqual(tokens[index - 1], tokens[index])) {
      repetitions.push({
        type: "repetition",
        reference: "",
        transcript: tokens[index],
        referenceIndex: "",
        transcriptIndex: index + 1,
      });
    }
  }

  return repetitions;
}

function buildErrorSummaryRows(counts, details, textAnalysis) {
  const temporaryRows = new Map(
    textAnalysis.errorTypes.map((errorType) => [
      errorType.type,
      {
        label: errorType.label,
        count: errorType.count,
        examples: errorType.examples,
        interpretation: errorType.interpretation,
      },
    ]),
  );
  const rowDefinitions = [
    {
      type: "omission",
      label: "누락",
      interpretation: "원문에 있는 어절을 읽지 않았거나 전사에서 빠진 것으로 해석할 수 있습니다.",
      guidance: "짧은 문장부터 손가락 짚기, 줄 따라 읽기, 핵심 어절 확인 활동을 진행합니다.",
    },
    {
      type: "insertion",
      label: "삽입",
      interpretation: "원문에는 없는 어절이 전사에 추가된 것으로 해석할 수 있습니다.",
      guidance: "읽기 전 원문을 훑어보고 문장 단위로 멈추어 확인하는 연습을 제공합니다.",
    },
    {
      type: "substitution",
      label: "대치/발음 오류",
      interpretation: "원문 어절과 다른 어절로 읽힌 부분입니다. 발음 오류 여부는 추후 OpenAI 분석으로 보완합니다.",
      guidance: "자주 바뀌는 어휘를 표시하고 교사 모델 읽기 후 따라 읽기와 재읽기를 실시합니다.",
    },
    {
      type: "repetition",
      label: "반복",
      interpretation: "같은 어절을 반복해서 읽은 부분입니다. 호흡 단위와 읽기 안정성을 함께 살펴봅니다.",
      guidance: "의미 단위로 끊어 읽기, 호흡 조절, 일정한 속도의 반복 읽기를 지도합니다.",
    },
  ];

  return rowDefinitions.map((definition) => {
    const temporaryRow = temporaryRows.get(definition.type);
    const examples = getErrorExamples(details, definition.type);

    return {
      type: definition.type,
      label: definition.label,
      count: counts[definition.type] ?? temporaryRow?.count ?? 0,
      examples: examples.length ? examples : temporaryRow?.examples || [],
      interpretation: definition.interpretation,
      guidance: definition.guidance,
    };
  });
}

function getErrorExamples(details, type) {
  const examples = details
    .filter((detail) => detail.type === type)
    .map((detail) => {
      if (detail.reference && detail.transcript) {
        return `${detail.reference} -> ${detail.transcript}`;
      }
      return detail.reference || detail.transcript || "";
    })
    .filter(Boolean);

  return getUniqueValues(examples).slice(0, 3);
}

function countErrorSyllables(details) {
  return details.reduce((total, detail) => {
    if (detail.type === "omission") {
      return total + countReadableCharacters(detail.reference || "");
    }
    if (detail.type === "insertion" || detail.type === "repetition") {
      return total + countReadableCharacters(detail.transcript || "");
    }
    if (detail.type === "substitution") {
      return total + Math.max(
        countReadableCharacters(detail.reference || ""),
        countReadableCharacters(detail.transcript || ""),
      );
    }

    return total;
  }, 0);
}

function renderAnalysisTable(analysisResult) {
  const summaryRows = [
    ["학생", formatStudent(analysisResult.student)],
    ["검사 날짜", analysisResult.testDate],
    ["읽기 자료", analysisResult.passageTitle || "제목 없음"],
    ["원문 글자 수", `${analysisResult.readingSpeed.referenceCharacters}자`],
    ["전사 글자 수", `${analysisResult.readingSpeed.charactersRead}자`],
    ["읽기 시간", `${analysisResult.durationSec}초`],
    [
      "읽기 속도",
      `${analysisResult.readingSpeed.syllablesPerMinute} 음절/분, ${analysisResult.readingSpeed.wordsPerMinute} 어절/분`,
    ],
    ["정확도", `${analysisResult.errorAnalysis.accuracyPercent}%`],
    ["완독률", `${analysisResult.errorAnalysis.completenessPercent}%`],
    ["오류 합계", `${analysisResult.errorAnalysis.totalErrors}개`],
    ["전체 읽은 음절 수", `${analysisResult.finalScore.totalReadSyllables}음절`],
    ["오류를 보인 음절 수", `${analysisResult.finalScore.errorSyllables}음절`],
    ["정확하게 읽은 음절 수", `${analysisResult.finalScore.correctSyllables}음절`],
    ["산출식", analysisResult.finalScore.scoringRule],
    [
      "계산",
      `(${analysisResult.finalScore.totalReadSyllables} - ${analysisResult.finalScore.errorSyllables}) / ${analysisResult.durationSec} × 10 = ${analysisResult.finalScore.correctSyllablesPer10Sec}`,
    ],
    ["10초당 정확하게 읽은 음절 수", `${analysisResult.finalScore.correctSyllablesPer10Sec}음절`],
  ];

  elements.summaryTableBody.replaceChildren(
    ...summaryRows.map(([label, value]) => {
      const row = document.createElement("tr");
      const header = document.createElement("th");
      const cell = document.createElement("td");
      header.textContent = label;
      cell.textContent = value;
      row.append(header, cell);
      return row;
    }),
  );

  elements.errorTableBody.replaceChildren(
    ...analysisResult.errorAnalysis.summaryRows.map((errorRow) => {
      const row = document.createElement("tr");
      [
        errorRow.label,
        `${errorRow.count}회`,
        errorRow.examples.length ? errorRow.examples.join(", ") : "-",
        errorRow.interpretation,
        errorRow.guidance,
      ].forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.append(cell);
      });
      return row;
    }),
  );

  elements.scoreBadge.textContent = `${analysisResult.finalScore.correctSyllablesPer10Sec}음절/10초`;
}

function renderReport(reportText) {
  elements.reportText.value = reportText;
}

function generateReadingReport(analysisResult) {
  const { counts, summaryRows } = analysisResult.errorAnalysis;
  const studentInfo = formatStudent(analysisResult.student);
  const primaryErrors = summaryRows
    .filter((row) => row.count > 0)
    .sort((left, right) => right.count - left.count);
  const primaryErrorSummary = primaryErrors.length
    ? primaryErrors.map((row) => `${row.label} ${row.count}회`).join(", ")
    : "두드러진 오류 유형이 뚜렷하게 나타나지 않았습니다.";
  const strengths = getReportStrengths(analysisResult);
  const needs = getReportNeeds(analysisResult, primaryErrors);
  const guidance = getReportGuidance(analysisResult, primaryErrors);

  return [
    "학생 개별 읽기 유창성 보고서 예시",
    "",
    "1. 학생 기본 정보",
    `- 학생: ${studentInfo}`,
    `- 검사일: ${analysisResult.testDate}`,
    `- 읽기 자료: ${analysisResult.passageTitle || "제목 없음"}`,
    "",
    "2. 읽기 속도 결과",
    `- 읽기 시간: ${analysisResult.durationSec}초`,
    `- 분당 음절 수: ${analysisResult.readingSpeed.syllablesPerMinute} 음절/분`,
    `- 분당 어절 수: ${analysisResult.readingSpeed.wordsPerMinute} 어절/분`,
    "",
    "3. 주요 오류 유형",
    `- 주요 오류: ${primaryErrorSummary}`,
    `- 누락: ${counts.omission}개`,
    `- 삽입: ${counts.insertion}개`,
    `- 대치: ${counts.substitution}개`,
    `- 반복: ${counts.repetition}개`,
    "",
    "4. 유창성 수준 요약",
    `- 산출식: ${analysisResult.finalScore.scoringRule}`,
    `- 전체 읽은 음절 수: ${analysisResult.finalScore.totalReadSyllables}음절`,
    `- 오류를 보인 음절 수: ${analysisResult.finalScore.errorSyllables}음절`,
    `- 정확하게 읽은 음절 수: ${analysisResult.finalScore.correctSyllables}음절`,
    `- 10초당 정확하게 읽은 음절 수: ${analysisResult.finalScore.correctSyllablesPer10Sec}음절`,
    `- 정확도: ${analysisResult.errorAnalysis.accuracyPercent}%`,
    `- 완독률: ${analysisResult.errorAnalysis.completenessPercent}%`,
    "- 현재 단계에서는 프론트엔드 임시 분석 결과를 바탕으로 한 예시 요약입니다.",
    "",
    "5. 강점",
    ...strengths.map((item) => `- ${item}`),
    "",
    "6. 보완이 필요한 점",
    ...needs.map((item) => `- ${item}`),
    "",
    "7. 지도 제안",
    ...guidance.map((item) => `- ${item}`),
    "",
    "※ 추후 Firebase Functions 같은 서버 환경에서 OpenAI 분석 결과를 받아 더 정교한 보고서로 교체할 수 있습니다.",
  ].join("\n");
}

function buildRecommendation(result) {
  const { counts, accuracyPercent } = result.errorAnalysis;
  const recommendations = [];

  if (result.readingSpeed.syllablesPerMinute < 200) {
    recommendations.push("읽기 속도가 낮게 나타나 짧은 문단의 반복 읽기와 시간 재기 활동이 도움이 됩니다.");
  }
  if (accuracyPercent < 90) {
    recommendations.push("정확도 향상을 위해 어려운 어휘를 사전에 확인하고 교사 모델 읽기 후 따라 읽기를 권장합니다.");
  }
  if (counts.omission > counts.substitution && counts.omission > 0) {
    recommendations.push("누락 오류가 상대적으로 많으므로 손가락 짚기나 줄 따라 읽기 전략을 적용해 보세요.");
  }
  if (counts.repetition > 0) {
    recommendations.push("반복 오류가 관찰되어 호흡 단위로 끊어 읽는 연습이 필요합니다.");
  }

  if (recommendations.length === 0) {
    recommendations.push("전반적으로 안정적인 읽기 수행을 보였습니다. 다양한 글감으로 유창성을 유지해 주세요.");
  }

  return recommendations.join("\n");
}

function getReportStrengths(result) {
  const strengths = [];

  if (result.errorAnalysis.accuracyPercent >= 90) {
    strengths.push("전사 텍스트 기준으로 원문과 일치하는 어절 비율이 높아 정확성이 안정적입니다.");
  }
  if (result.readingSpeed.syllablesPerMinute >= 200) {
    strengths.push("문단글을 일정한 속도로 읽는 기반이 보입니다.");
  }
  if (result.errorAnalysis.counts.repetition === 0) {
    strengths.push("반복 오류가 두드러지지 않아 읽기 흐름이 비교적 안정적으로 나타납니다.");
  }

  if (strengths.length === 0) {
    strengths.push("검사 자료를 끝까지 읽고 전사 자료를 바탕으로 현재 읽기 특성을 확인할 수 있었습니다.");
  }

  return strengths;
}

function getReportNeeds(result, primaryErrors) {
  const needs = [];

  if (result.errorAnalysis.accuracyPercent < 90) {
    needs.push("정확도 향상을 위해 원문 어휘와 전사 텍스트가 달라지는 부분을 함께 확인할 필요가 있습니다.");
  }
  if (result.readingSpeed.syllablesPerMinute < 200) {
    needs.push("읽기 속도 향상을 위해 짧은 문단의 반복 읽기와 시간 재기 활동이 필요합니다.");
  }
  if (primaryErrors.length > 0) {
    needs.push(`${primaryErrors[0].label} 오류가 상대적으로 두드러져 해당 오류 유형에 대한 개별 지도가 필요합니다.`);
  }

  if (needs.length === 0) {
    needs.push("현재 결과에서는 큰 보완점보다 다양한 글감에서 유창성을 유지하는 연습이 필요합니다.");
  }

  return needs;
}

function getReportGuidance(result, primaryErrors) {
  const guidance = primaryErrors.length
    ? primaryErrors.slice(0, 2).map((row) => row.guidance)
    : [];

  guidance.push(...buildRecommendation(result).split("\n"));

  return getUniqueValues(guidance).slice(0, 4);
}

function extractTranscriptText(fileText, fileName) {
  const lowerName = fileName.toLowerCase();

  if (lowerName.endsWith(".json")) {
    try {
      const data = JSON.parse(fileText);
      if (typeof data === "string") {
        return normalizeWhitespace(data);
      }
      if (typeof data.transcript === "string") {
        return normalizeWhitespace(data.transcript);
      }
      if (typeof data.text === "string") {
        return normalizeWhitespace(data.text);
      }
      if (Array.isArray(data.segments)) {
        return normalizeWhitespace(data.segments.map((segment) => segment.text || "").join(" "));
      }
    } catch {
      return normalizeWhitespace(fileText);
    }
  }

  if (lowerName.endsWith(".srt") || lowerName.endsWith(".vtt")) {
    return normalizeWhitespace(
      fileText
        .split("\n")
        .filter((line) => {
          const trimmed = line.trim();
          return (
            trimmed &&
            trimmed !== "WEBVTT" &&
            !/^\d+$/.test(trimmed) &&
            !trimmed.includes("-->") &&
            !trimmed.startsWith("NOTE")
          );
        })
        .join(" "),
    );
  }

  return normalizeWhitespace(fileText);
}

function clearRecording() {
  if (mediaRecorder?.state === "recording") {
    mediaRecorder.stop();
  }
  stopMediaStream();
  recordedBlob = null;
  recordingChunks = [];
  elements.recordingPlayer.removeAttribute("src");
  elements.recordingPlayer.classList.add("hidden");
  elements.transcribeRecordingBtn.disabled = true;
  elements.rerecordBtn.disabled = true;
  elements.startRecordingBtn.disabled = false;
  elements.stopRecordingBtn.disabled = true;
  elements.recordingStatus.textContent = "녹음 대기 중";
  setRecordingVisualState("idle");

  if (recordingUrl) {
    URL.revokeObjectURL(recordingUrl);
    recordingUrl = "";
  }
}

function stopMediaStream() {
  mediaStream?.getTracks().forEach((track) => track.stop());
  mediaStream = null;
}

function tokenizeEojeol(text) {
  return normalizeWhitespace(text).split(/\s+/).filter(Boolean);
}

function normalizeWhitespace(text) {
  return text.replace(/\s+/g, " ").trim();
}

function normalizeToken(token) {
  return token
    .toLocaleLowerCase("ko-KR")
    .replace(/[.,!?;:"'“”‘’()[\]{}<>《》〈〉「」『』…]/g, "")
    .trim();
}

function areTokensEqual(left, right) {
  return normalizeToken(left) === normalizeToken(right);
}

function countReadableCharacters(text) {
  return text.replace(/\s/g, "").length;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function roundToOne(value) {
  return Math.round(value * 10) / 10;
}

function getUniqueValues(values) {
  return [...new Set(values.filter(Boolean))];
}

function getErrorLabel(type) {
  return {
    omission: "누락",
    insertion: "삽입",
    substitution: "대치",
    repetition: "반복",
  }[type] || type;
}

function getErrorPosition(detail) {
  if (detail.referenceIndex && detail.transcriptIndex) {
    return `원문 ${detail.referenceIndex} / 전사 ${detail.transcriptIndex}`;
  }
  if (detail.referenceIndex) {
    return `원문 ${detail.referenceIndex}`;
  }
  if (detail.transcriptIndex) {
    return `전사 ${detail.transcriptIndex}`;
  }
  return "-";
}

function formatStudent(student) {
  return [
    student.name,
    student.studentId ? `ID ${student.studentId}` : "",
    student.grade,
    student.className,
  ]
    .filter(Boolean)
    .join(" · ");
}
