import { auth, db, RESULTS_COLLECTION } from "./firebaseConfig.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

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
  readingPassage: document.querySelector("#readingPassage"),
  transcriptFile: document.querySelector("#transcriptFile"),
  loadTranscriptBtn: document.querySelector("#loadTranscriptBtn"),
  transcriptText: document.querySelector("#transcriptText"),
  startRecordingBtn: document.querySelector("#startRecordingBtn"),
  stopRecordingBtn: document.querySelector("#stopRecordingBtn"),
  transcribeRecordingBtn: document.querySelector("#transcribeRecordingBtn"),
  recordingPlayer: document.querySelector("#recordingPlayer"),
  recordingStatus: document.querySelector("#recordingStatus"),
  durationSec: document.querySelector("#durationSec"),
  targetCpm: document.querySelector("#targetCpm"),
  analyzeBtn: document.querySelector("#analyzeBtn"),
  saveResultBtn: document.querySelector("#saveResultBtn"),
  analysisStatus: document.querySelector("#analysisStatus"),
  resultsPanel: document.querySelector("#resultsPanel"),
  scoreBadge: document.querySelector("#scoreBadge"),
  summaryTableBody: document.querySelector("#summaryTableBody"),
  errorTableBody: document.querySelector("#errorTableBody"),
  reportText: document.querySelector("#reportText"),
};

let currentTeacher = null;
let mediaRecorder = null;
let mediaStream = null;
let recordingChunks = [];
let recordingStartedAt = 0;
let recordedBlob = null;
let recordingUrl = "";
let analysisResult = null;

elements.testDate.valueAsDate = new Date();

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

elements.logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
});

elements.resetFormBtn.addEventListener("click", () => {
  elements.assessmentForm.reset();
  elements.testDate.valueAsDate = new Date();
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
elements.transcribeRecordingBtn.addEventListener("click", transcribeRecording);
elements.analyzeBtn.addEventListener("click", runAnalysis);
elements.saveResultBtn.addEventListener("click", saveAnalysisResult);

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
      elements.transcribeRecordingBtn.disabled = false;
      elements.recordingStatus.textContent =
        "녹음이 완료되었습니다. 원본 파일은 Firebase에 저장되지 않습니다.";
      stopMediaStream();
    });

    mediaRecorder.start();
    elements.startRecordingBtn.disabled = true;
    elements.stopRecordingBtn.disabled = false;
    elements.transcribeRecordingBtn.disabled = true;
    elements.recordingStatus.textContent = "녹음 중입니다.";
  } catch (error) {
    elements.recordingStatus.textContent = `마이크 접근 실패: ${error.message}`;
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
  const serverTranscriptionEndpoint = "";

  if (!serverTranscriptionEndpoint) {
    throw new Error(
      "녹음 파일 전사는 추후 Firebase Functions 같은 서버 환경에 연결해야 합니다. OpenAI API Key는 프론트엔드에 두지 않습니다.",
    );
  }

  const formData = new FormData();
  formData.append("recording", recordingBlob, "reading-recording.webm");

  const response = await fetch(serverTranscriptionEndpoint, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("서버 전사 함수 호출에 실패했습니다.");
  }

  const data = await response.json();
  return data.transcript || "";
}

function runAnalysis() {
  try {
    const input = collectAssessmentInput();
    analysisResult = analyzeReading(input);
    renderAnalysis(analysisResult);
    elements.resultsPanel.classList.remove("hidden");
    elements.saveResultBtn.disabled = false;
    elements.analysisStatus.textContent = "분석 결과가 생성되었습니다. 필요하면 보고서를 수정한 뒤 저장하세요.";
  } catch (error) {
    elements.analysisStatus.textContent = error.message;
  }
}

async function saveAnalysisResult() {
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
    teacherName: currentTeacher.displayName || "",
    student: analysisResult.student,
    testDate: analysisResult.testDate,
    passageTitle: analysisResult.passageTitle,
    passageText: analysisResult.passageText,
    transcriptText: analysisResult.transcriptText,
    durationSec: analysisResult.durationSec,
    readingSpeed: analysisResult.readingSpeed,
    errorAnalysis: analysisResult.errorAnalysis,
    finalScore: analysisResult.finalScore,
    report: elements.reportText.value,
    createdAt: serverTimestamp(),
  };

  try {
    elements.saveResultBtn.disabled = true;
    elements.analysisStatus.textContent = "Firebase에 분석 결과를 저장하는 중입니다.";
    await addDoc(collection(db, RESULTS_COLLECTION), payload);
    elements.analysisStatus.textContent =
      "저장되었습니다. 녹음 원본 파일은 Firebase에 저장하지 않았습니다.";
  } catch (error) {
    elements.saveResultBtn.disabled = false;
    elements.analysisStatus.textContent = `저장 실패: ${error.message}`;
  }
}

function collectAssessmentInput() {
  const durationSec = Number(elements.durationSec.value);
  const targetCpm = Number(elements.targetCpm.value || 300);
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
    targetCpm: targetCpm > 0 ? targetCpm : 300,
  };
}

function analyzeReading(input) {
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
  const charactersRead = countReadableCharacters(input.transcriptText);
  const referenceCharacters = countReadableCharacters(input.passageText);
  const cpm = Math.round((charactersRead / input.durationSec) * 60);
  const wpm = Math.round((transcriptCount / input.durationSec) * 60);
  const accuracyPercent = referenceCount
    ? roundToOne((counts.match / referenceCount) * 100)
    : 0;
  const completenessPercent = referenceCount
    ? roundToOne(((counts.match + counts.substitution) / referenceCount) * 100)
    : 0;
  const speedScore = clamp((cpm / input.targetCpm) * 100, 0, 100);
  const repetitionPenalty = Math.min(20, counts.repetition * 2);
  const score = Math.round(
    clamp(accuracyPercent * 0.65 + speedScore * 0.25 + completenessPercent * 0.1 - repetitionPenalty, 0, 100),
  );
  const errorDetails = alignment.operations
    .filter((operation) => operation.type !== "match")
    .concat(repetitions);

  const result = {
    ...input,
    readingSpeed: {
      referenceCharacters,
      charactersRead,
      referenceWordCount: referenceCount,
      transcriptWordCount: transcriptCount,
      cpm,
      wpm,
      targetCpm: input.targetCpm,
    },
    errorAnalysis: {
      counts,
      accuracyPercent,
      completenessPercent,
      totalErrors: counts.omission + counts.insertion + counts.substitution + counts.repetition,
      details: errorDetails,
    },
    finalScore: {
      score,
      band: getScoreBand(score),
      speedScore: roundToOne(speedScore),
    },
  };

  result.report = generateReport(result);
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

function renderAnalysis(result) {
  const summaryRows = [
    ["학생", formatStudent(result.student)],
    ["검사 날짜", result.testDate],
    ["읽기 자료", result.passageTitle || "제목 없음"],
    ["원문 글자 수", `${result.readingSpeed.referenceCharacters}자`],
    ["전사 글자 수", `${result.readingSpeed.charactersRead}자`],
    ["읽기 시간", `${result.durationSec}초`],
    ["읽기 속도", `${result.readingSpeed.cpm} 글자/분, ${result.readingSpeed.wpm} 어절/분`],
    ["정확도", `${result.errorAnalysis.accuracyPercent}%`],
    ["완독률", `${result.errorAnalysis.completenessPercent}%`],
    ["오류 합계", `${result.errorAnalysis.totalErrors}개`],
    ["최종 점수", `${result.finalScore.score}점 (${result.finalScore.band})`],
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

  if (result.errorAnalysis.details.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.textContent = "감지된 오류가 없습니다.";
    row.append(cell);
    elements.errorTableBody.replaceChildren(row);
  } else {
    elements.errorTableBody.replaceChildren(
      ...result.errorAnalysis.details.map((detail) => {
        const row = document.createElement("tr");
        [getErrorLabel(detail.type), detail.reference || "-", detail.transcript || "-", getErrorPosition(detail)]
          .forEach((value) => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.append(cell);
          });
        return row;
      }),
    );
  }

  elements.scoreBadge.textContent = `${result.finalScore.score}점`;
  elements.reportText.value = result.report;
}

function generateReport(result) {
  const { counts } = result.errorAnalysis;

  return [
    `${result.student.name} 학생의 문단글 읽기 유창성 검사 결과입니다.`,
    "",
    `검사일: ${result.testDate}`,
    `읽기 자료: ${result.passageTitle || "제목 없음"}`,
    `읽기 속도: ${result.readingSpeed.cpm} 글자/분 (${result.readingSpeed.wpm} 어절/분)`,
    `정확도: ${result.errorAnalysis.accuracyPercent}%`,
    `완독률: ${result.errorAnalysis.completenessPercent}%`,
    `최종 점수: ${result.finalScore.score}점 (${result.finalScore.band})`,
    "",
    "오류 유형 요약",
    `- 누락: ${counts.omission}개`,
    `- 삽입: ${counts.insertion}개`,
    `- 대치: ${counts.substitution}개`,
    `- 반복: ${counts.repetition}개`,
    "",
    buildRecommendation(result),
  ].join("\n");
}

function buildRecommendation(result) {
  const { counts, accuracyPercent } = result.errorAnalysis;
  const recommendations = [];

  if (result.readingSpeed.cpm < result.readingSpeed.targetCpm * 0.7) {
    recommendations.push("읽기 속도가 목표치보다 낮아 짧은 문단의 반복 읽기와 시간 재기 활동이 도움이 됩니다.");
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
  elements.startRecordingBtn.disabled = false;
  elements.stopRecordingBtn.disabled = true;
  elements.recordingStatus.textContent = "녹음 대기 중";

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

function getScoreBand(score) {
  if (score >= 90) return "우수";
  if (score >= 75) return "양호";
  if (score >= 60) return "보통";
  return "집중 지원 필요";
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
