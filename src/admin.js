import { auth } from "./firebaseConfig.js";
import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

const elements = {
  authGate: document.querySelector("#authGate"),
  dashboardContent: document.querySelector("#dashboardContent"),
  teacherInfo: document.querySelector("#teacherInfo"),
  logoutBtn: document.querySelector("#logoutBtn"),
  studentFilter: document.querySelector("#studentFilter"),
  dateFilter: document.querySelector("#dateFilter"),
  resultsTableBody: document.querySelector("#resultsTableBody"),
  emptyState: document.querySelector("#emptyState"),
  detailPanel: document.querySelector("#detailPanel"),
  detailAnalysisTableBody: document.querySelector("#detailAnalysisTableBody"),
  detailReportText: document.querySelector("#detailReportText"),
  closeDetailBtn: document.querySelector("#closeDetailBtn"),
};

const sampleMonitorResults = [
  {
    id: "sample-001",
    studentName: "김민준",
    gradeClass: "3학년 / 2반",
    testDate: "2026-06-07",
    passageTitle: "봄이 오는 길",
    readingSpeed: {
      syllablesPerMinute: 286,
      wordsPerMinute: 64,
    },
    fluencyScore: {
      correctSyllablesPer10Sec: 42.5,
    },
    majorErrorTypes: ["대치/발음 오류", "반복"],
    analysisRows: [
      ["학생 이름", "김민준"],
      ["학년/반", "3학년 / 2반"],
      ["검사 날짜", "2026-06-07"],
      ["읽기 자료", "봄이 오는 길"],
      ["읽기 속도", "286 음절/분 · 64 어절/분"],
      ["10초당 정확하게 읽은 음절 수", "42.5음절"],
      ["주요 오류 유형", "대치/발음 오류, 반복"],
    ],
    reportText:
      "학생 기본 정보\n- 김민준, 3학년 / 2반\n\n읽기 속도 결과\n- 286 음절/분, 64 어절/분\n\n주요 오류 유형\n- 대치/발음 오류와 반복 오류가 일부 관찰되었습니다.\n\n유창성 수준 요약\n- 전반적인 읽기 흐름은 유지되나 정확도 보완이 필요합니다.\n\n강점\n- 끝까지 읽기를 수행하며 전체 문맥을 유지하려는 모습이 보입니다.\n\n보완이 필요한 점\n- 어려운 어휘에서 다른 어절로 읽는 경향을 점검해야 합니다.\n\n지도 제안\n- 교사 모델 읽기 후 따라 읽기와 짧은 문단 반복 읽기를 권장합니다.",
  },
  {
    id: "sample-002",
    studentName: "이서연",
    gradeClass: "4학년 / 1반",
    testDate: "2026-06-06",
    passageTitle: "작은 씨앗",
    readingSpeed: {
      syllablesPerMinute: 241,
      wordsPerMinute: 58,
    },
    fluencyScore: {
      correctSyllablesPer10Sec: 36.8,
    },
    majorErrorTypes: ["누락", "삽입"],
    analysisRows: [
      ["학생 이름", "이서연"],
      ["학년/반", "4학년 / 1반"],
      ["검사 날짜", "2026-06-06"],
      ["읽기 자료", "작은 씨앗"],
      ["읽기 속도", "241 음절/분 · 58 어절/분"],
      ["10초당 정확하게 읽은 음절 수", "36.8음절"],
      ["주요 오류 유형", "누락, 삽입"],
    ],
    reportText:
      "학생 기본 정보\n- 이서연, 4학년 / 1반\n\n읽기 속도 결과\n- 241 음절/분, 58 어절/분\n\n주요 오류 유형\n- 누락과 삽입 오류가 예시로 표시됩니다.\n\n유창성 수준 요약\n- 속도와 정확도를 함께 끌어올리는 지도가 필요합니다.\n\n강점\n- 문장 단위 읽기 활동에 참여할 수 있습니다.\n\n보완이 필요한 점\n- 줄 따라 읽기와 어절 확인 전략이 필요합니다.\n\n지도 제안\n- 손가락 짚기, 핵심 어휘 확인, 짧은 문장 재읽기를 권장합니다.",
  },
];

let currentTeacher = null;
let savedResults = [];

if (auth) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "./index.html";
      return;
    }

    currentTeacher = user;
    elements.authGate.classList.add("hidden");
    elements.dashboardContent.classList.remove("hidden");
    elements.teacherInfo.textContent = `${user.displayName || user.email} 교사 계정`;
    loadResults();
  });
} else {
  window.location.href = "./index.html";
}

elements.logoutBtn.addEventListener("click", async () => {
  if (!auth) return;
  await signOut(auth);
});

elements.studentFilter.addEventListener("input", renderDashboard);
elements.dateFilter.addEventListener("change", renderDashboard);
elements.closeDetailBtn.addEventListener("click", () => {
  elements.detailPanel.classList.add("hidden");
  elements.detailAnalysisTableBody.replaceChildren();
  elements.detailReportText.value = "";
});

function loadResults() {
  if (!currentTeacher) return;

  savedResults = getMonitorResults();
  renderDashboard();
}

function getMonitorResults() {
  // Firestore 조회는 추후 이 함수 내부에서 연결합니다.
  return [...sampleMonitorResults];
}

function renderDashboard() {
  renderTable(getFilteredResults());
}

function getFilteredResults() {
  const keyword = elements.studentFilter.value.trim().toLocaleLowerCase("ko-KR");
  const date = elements.dateFilter.value;

  return savedResults.filter((result) => {
    const studentText = [
      result.studentName,
      result.gradeClass,
      result.passageTitle,
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("ko-KR");
    const matchesKeyword = !keyword || studentText.includes(keyword);
    const matchesDate = !date || result.testDate === date;

    return matchesKeyword && matchesDate;
  });
}

function renderTable(results) {
  elements.emptyState.classList.toggle("hidden", results.length > 0);
  elements.emptyState.textContent = "검색 조건에 맞는 검사 결과가 없습니다.";

  if (results.length === 0) {
    elements.resultsTableBody.replaceChildren();
    return;
  }

  elements.resultsTableBody.replaceChildren(
    ...results.map((result) => {
      const row = document.createElement("tr");
      const cells = [
        result.studentName || "-",
        result.testDate || "-",
        formatReadingSpeed(result.readingSpeed),
        `${result.fluencyScore?.correctSyllablesPer10Sec ?? "-"}음절`,
        result.majorErrorTypes?.join(", ") || "-",
      ];

      cells.forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.append(cell);
      });

      const actionCell = document.createElement("td");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "text-button";
      button.textContent = "상세 보기";
      button.addEventListener("click", () => showDetail(result));
      actionCell.append(button);
      row.append(actionCell);

      return row;
    }),
  );
}

function showDetail(result) {
  elements.detailPanel.classList.remove("hidden");
  elements.detailAnalysisTableBody.replaceChildren(
    ...result.analysisRows.map(([label, value]) => {
      const row = document.createElement("tr");
      const header = document.createElement("th");
      const cell = document.createElement("td");
      header.textContent = label;
      cell.textContent = value;
      row.append(header, cell);
      return row;
    }),
  );
  elements.detailReportText.value = result.reportText;
  elements.detailPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function formatReadingSpeed(readingSpeed = {}) {
  const syllablesPerMinute = readingSpeed.syllablesPerMinute ?? readingSpeed.cpm ?? "-";
  const wordsPerMinute = readingSpeed.wordsPerMinute ?? readingSpeed.wpm ?? "-";
  return `${syllablesPerMinute} 음절/분 · ${wordsPerMinute} 어절/분`;
}
