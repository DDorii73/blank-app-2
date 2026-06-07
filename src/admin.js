import { auth, db, RESULTS_COLLECTION } from "./firebaseConfig.js";
import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

const elements = {
  authGate: document.querySelector("#authGate"),
  dashboardContent: document.querySelector("#dashboardContent"),
  teacherInfo: document.querySelector("#teacherInfo"),
  logoutBtn: document.querySelector("#logoutBtn"),
  refreshBtn: document.querySelector("#refreshBtn"),
  totalCount: document.querySelector("#totalCount"),
  studentCount: document.querySelector("#studentCount"),
  averageScore: document.querySelector("#averageScore"),
  studentFilter: document.querySelector("#studentFilter"),
  dateFilter: document.querySelector("#dateFilter"),
  resultsTableBody: document.querySelector("#resultsTableBody"),
  emptyState: document.querySelector("#emptyState"),
  detailPanel: document.querySelector("#detailPanel"),
  detailContent: document.querySelector("#detailContent"),
  closeDetailBtn: document.querySelector("#closeDetailBtn"),
};

let currentTeacher = null;
let savedResults = [];

if (auth) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "./index.html";
      return;
    }

    currentTeacher = user;
    elements.authGate.classList.add("hidden");
    elements.dashboardContent.classList.remove("hidden");
    elements.teacherInfo.textContent = `${user.displayName || user.email} 교사 계정의 저장 결과`;
    await loadResults();
  });
} else {
  window.location.href = "./index.html";
}

elements.logoutBtn.addEventListener("click", async () => {
  if (!auth) return;
  await signOut(auth);
});

elements.refreshBtn.addEventListener("click", loadResults);
elements.studentFilter.addEventListener("input", renderDashboard);
elements.dateFilter.addEventListener("change", renderDashboard);
elements.closeDetailBtn.addEventListener("click", () => {
  elements.detailPanel.classList.add("hidden");
  elements.detailContent.replaceChildren();
});

async function loadResults() {
  if (!currentTeacher) return;

  elements.resultsTableBody.replaceChildren();
  elements.emptyState.textContent = "저장 결과를 불러오는 중입니다.";
  elements.emptyState.classList.remove("hidden");

  const resultQuery = query(
    collection(db, RESULTS_COLLECTION),
    where("teacherUid", "==", currentTeacher.uid),
  );
  const snapshot = await getDocs(resultQuery);

  savedResults = snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .sort((left, right) => getSortableDate(right) - getSortableDate(left));

  renderDashboard();
}

function renderDashboard() {
  const filteredResults = getFilteredResults();
  renderStats(filteredResults);
  renderTable(filteredResults);
}

function getFilteredResults() {
  const keyword = elements.studentFilter.value.trim().toLocaleLowerCase("ko-KR");
  const date = elements.dateFilter.value;

  return savedResults.filter((result) => {
    const student = result.student || {};
    const studentText = [
      student.name,
      student.studentId,
      student.grade,
      student.className,
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

function renderStats(results) {
  const studentKeys = new Set(
    results.map((result) => {
      const student = result.student || {};
      return student.studentId || `${student.name}-${student.grade}-${student.className}`;
    }),
  );
  const scores = results
    .map((result) => Number(result.finalScore?.score))
    .filter((score) => Number.isFinite(score));
  const average = scores.length
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    : null;

  elements.totalCount.textContent = String(results.length);
  elements.studentCount.textContent = String(studentKeys.size);
  elements.averageScore.textContent = average === null ? "-" : `${average}점`;
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
      const student = result.student || {};
      const cells = [
        result.testDate || "-",
        formatStudentName(student),
        [student.grade, student.className].filter(Boolean).join(" / ") || "-",
        formatReadingSpeed(result.readingSpeed),
        `${result.errorAnalysis?.accuracyPercent ?? "-"}%`,
        `${result.finalScore?.score ?? "-"}점`,
        formatErrorSummary(result.errorAnalysis?.counts),
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
      button.textContent = "보기";
      button.addEventListener("click", () => showDetail(result));
      actionCell.append(button);
      row.append(actionCell);

      return row;
    }),
  );
}

function showDetail(result) {
  const student = result.student || {};
  elements.detailPanel.classList.remove("hidden");
  elements.detailContent.replaceChildren(
    createDetailBlock("학생", formatStudentName(student)),
    createDetailBlock("검사일", result.testDate || "-"),
    createDetailBlock("읽기 자료", result.passageTitle || "제목 없음"),
    createDetailBlock("읽기 속도", formatReadingSpeed(result.readingSpeed)),
    createDetailBlock("오류 요약", formatErrorSummary(result.errorAnalysis?.counts)),
    createDetailBlock("최종 점수", `${result.finalScore?.score ?? "-"}점 (${result.finalScore?.band || "-"})`),
    createDetailBlock("보고서", result.report || "저장된 보고서가 없습니다.", true),
    createDetailBlock("전사 텍스트", result.transcriptText || "-", true),
  );
  elements.detailPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function createDetailBlock(label, value, preserveLineBreaks = false) {
  const wrapper = document.createElement("article");
  const title = document.createElement("h3");
  const content = document.createElement("p");

  wrapper.className = "detail-block";
  title.textContent = label;
  content.textContent = value;
  if (preserveLineBreaks) {
    content.className = "pre-line";
  }

  wrapper.append(title, content);
  return wrapper;
}

function formatStudentName(student) {
  return [student.name, student.studentId ? `ID ${student.studentId}` : ""].filter(Boolean).join(" · ") || "-";
}

function formatReadingSpeed(readingSpeed = {}) {
  const cpm = readingSpeed.cpm ?? "-";
  const wpm = readingSpeed.wpm ?? "-";
  return `${cpm} 글자/분 · ${wpm} 어절/분`;
}

function formatErrorSummary(counts = {}) {
  return [
    `누락 ${counts.omission ?? 0}`,
    `삽입 ${counts.insertion ?? 0}`,
    `대치 ${counts.substitution ?? 0}`,
    `반복 ${counts.repetition ?? 0}`,
  ].join(" · ");
}

function getSortableDate(result) {
  if (result.createdAt?.toMillis) {
    return result.createdAt.toMillis();
  }
  if (result.testDate) {
    return new Date(result.testDate).getTime();
  }
  return 0;
}
