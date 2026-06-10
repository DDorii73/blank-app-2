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
  return [];
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
  elements.emptyState.textContent = "저장된 분석 결과가 없습니다.";

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
