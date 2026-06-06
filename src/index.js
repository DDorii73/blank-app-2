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
      authStatus.textContent = "먼저 교사 Google 계정으로 로그인해 주세요.";
    }
  });
});

onAuthStateChanged(auth, (user) => {
  const isLoggedIn = Boolean(user);

  googleLoginBtn.classList.toggle("hidden", isLoggedIn);
  logoutBtn.classList.toggle("hidden", !isLoggedIn);

  protectedLinks.forEach((link) => {
    link.classList.toggle("disabled", !isLoggedIn);
    link.setAttribute("aria-disabled", String(!isLoggedIn));
  });

  authStatus.textContent = isLoggedIn
    ? `${user.displayName || user.email} 교사 계정으로 로그인되었습니다.`
    : "로그인하면 학생 검사 페이지와 교사 모니터링 페이지에 접근할 수 있습니다.";
});
