import {
  auth,
  googleProvider,
  isFirebaseConfigured,
  missingFirebaseConfigKeys,
} from "./firebaseConfig.js";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";

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
  configNotice.innerHTML = `
    Firebase 설정이 아직 입력되지 않았습니다.
    환경변수 ${missingFirebaseConfigKeys.join(", ")} 값을 확인해 주세요.
  `;
  googleLoginBtn.disabled = true;
}

googleLoginBtn.addEventListener("click", async () => {
  if (!auth) {
    authStatus.textContent = "Firebase 설정을 먼저 확인해 주세요.";
    return;
  }

  try {
    authStatus.textContent = "Google 로그인 창을 여는 중입니다.";
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    authStatus.textContent = `로그인 실패: ${error.message}`;
  }
});

logoutBtn.addEventListener("click", async () => {
  if (!auth) return;
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

if (auth) {
  onAuthStateChanged(auth, (user) => {
    updateLandingAuthState(user);
  });
} else {
  updateLandingAuthState(null);
}

function updateLandingAuthState(user) {
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
}

function getTeacherDisplayName(user) {
  if (!user) return "";
  return user.displayName || user.email?.split("@")[0] || "교사";
}
