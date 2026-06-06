import { auth, googleProvider, isFirebaseConfigured } from "./firebaseConfig.js";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const googleLoginBtn = document.querySelector("#googleLoginBtn");
const logoutBtn = document.querySelector("#logoutBtn");
const authStatus = document.querySelector("#authStatus");
const configNotice = document.querySelector("#configNotice");
const routeGrid = document.querySelector("#routeGrid");
const protectedLinks = [
  document.querySelector("#studentPageLink"),
  document.querySelector("#monitorPageLink"),
];

if (!isFirebaseConfigured) {
  configNotice.classList.remove("hidden");
}

googleLoginBtn.addEventListener("click", async () => {
  try {
    authStatus.textContent = "Google 로그인 창을 여는 중입니다.";
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    authStatus.textContent = `로그인 실패: ${error.message}`;
  }
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
});

protectedLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    if (link.getAttribute("aria-disabled") === "true") {
      event.preventDefault();
      authStatus.textContent = "교사 로그인이 필요합니다.";
    }
  });
});

onAuthStateChanged(auth, (user) => {
  const isLoggedIn = Boolean(user);
  const teacherName = getTeacherDisplayName(user);

  googleLoginBtn.classList.toggle("hidden", isLoggedIn);
  logoutBtn.classList.toggle("hidden", !isLoggedIn);
  routeGrid.classList.toggle("hidden", !isLoggedIn);

  protectedLinks.forEach((link) => {
    link.classList.toggle("disabled", !isLoggedIn);
    link.setAttribute("aria-disabled", String(!isLoggedIn));
  });

  authStatus.textContent = isLoggedIn
    ? `${teacherName} 선생님, 환영합니다.`
    : "교사 로그인이 필요합니다.";
});

function getTeacherDisplayName(user) {
  if (!user) return "";
  return user.displayName || user.email?.split("@")[0] || "교사";
}
