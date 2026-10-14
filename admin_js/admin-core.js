// admin_js/admin-core.js
export const ADMIN_UID = "81eddee5-8203-4e5a-9eaa-e1031853d3a6";
export const PAGE_SIZE = 10;

export const $ = id => document.getElementById(id);

export const loginPanel = $("loginPanel");
export const adminPanel = $("adminPanel");
export const editorPanel = $("editorPanel");
export const loginForm = $("loginForm");
export const editorForm = $("editorForm");
export const statusBox = $("status");
export const meetingsList = $("meetingsList");
export const saveButton = $("saveButton");

export let currentMeetingId = null;
export let originalMeeting = null;
export let saving = false;
export let isCreating = false;

export let allMeetings = [];
export let currentPage = 0;
export let currentContentType = "meetings";

export let members = [];
export let tasks = [];
export let expandedTaskIds = new Set();

export function setCurrentMeetingId(value) {
  currentMeetingId = value;
}

export function setOriginalMeeting(value) {
  originalMeeting = value;
}

export function setSaving(value) {
  saving = value;
}

export function setIsCreating(value) {
  isCreating = value;
}

export function setAllMeetings(value) {
  allMeetings = value;
}

export function setCurrentPage(value) {
  currentPage = value;
}

export function setCurrentContentType(value) {
  currentContentType = value;
}

export function setMembers(value) {
  members = value;
}

export function setTasks(value) {
  tasks = value;
}

export function setExpandedTaskIds(value) {
  expandedTaskIds = value;
}

export function setStatus(message = "", type = "") {
  statusBox.textContent = message;
  statusBox.classList.toggle("error", type === "error");
  statusBox.classList.toggle("success", type === "success");
}

export function closeAccountMenu() {
  $("accountMenu").hidden = true;
  $("accountButton").setAttribute("aria-expanded", "false");
}

export function toggleAccountMenu() {
  const opening = $("accountMenu").hidden;
  $("accountMenu").hidden = !opening;
  $("accountButton").setAttribute("aria-expanded", String(opening));
}

export function showLogin() {
  loginPanel.hidden = false;
  adminPanel.hidden = true;
  editorPanel.hidden = true;
  $("accountArea").hidden = true;
  closeAccountMenu();
}

export function showAdmin() {
  loginPanel.hidden = true;
  adminPanel.hidden = false;
  $("accountArea").hidden = false;
}

export function jsonText(value) {
  return JSON.stringify(value ?? [], null, 2);
}

export function parseJSONField(id, expectedType, label) {
  let value;

  try {
    value = JSON.parse($(id).value);
  } catch {
    throw new Error(
      "ساختار JSON فیلد «" + label + "» معتبر نیست."
    );
  }

  const valid = expectedType === "array"
    ? Array.isArray(value)
    : expectedType === "object"
      ? value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
      : true;

  if (!valid) {
    throw new Error(
      "نوع دادهٔ فیلد «" + label + "» باید " +
      (expectedType === "array" ? "آرایه" : "شیء JSON") +
      " باشد."
    );
  }

  return value;
}

export function makeId(prefix) {
  if (
    window.crypto &&
    typeof window.crypto.randomUUID === "function"
  ) {
    return prefix + "-" + window.crypto.randomUUID();
  }

  return prefix + "-" + Date.now() + "-" +
    Math.random().toString(36).slice(2, 8);
}

export async function loadLocalJSON(path) {
  const response = await fetch(path, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(
      "خواندن " + path +
      " ناموفق بود (HTTP " + response.status + ")."
    );
  }

  return response.json();
}

async function checkSession(loadMeetings) {
  showLogin();

  const { data, error } =
    await supabaseClient.auth.getSession();

  if (error) {
    setStatus(
      "خطا در بررسی ورود: " + error.message,
      "error"
    );
    return;
  }

  const user = data.session?.user;

  if (!user) {
    setStatus("");
    return;
  }

  if (user.id !== ADMIN_UID) {
    await supabaseClient.auth.signOut();

    setStatus(
      "این حساب اجازهٔ ورود به پنل مدیریت را ندارد.",
      "error"
    );
    return;
  }

  showAdmin();
  await loadMeetings();
}

function bindAuthenticationEvents(loadMeetings) {
  loginForm.addEventListener("submit", async event => {
    event.preventDefault();

    const email = $("email").value.trim();
    const password = $("password").value;

    setStatus("در حال ورود...");

    const { data, error } =
      await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

    if (error) {
      setStatus(
        "ورود ناموفق بود: " + error.message,
        "error"
      );
      return;
    }

    if (data.user?.id !== ADMIN_UID) {
      await supabaseClient.auth.signOut();

      setStatus(
        "این حساب، مدیر مجاز این پنل نیست.",
        "error"
      );
      return;
    }

    loginForm.reset();
    showAdmin();

    await loadMeetings();
  });

  $("accountButton").addEventListener("click", event => {
    event.stopPropagation();
    toggleAccountMenu();
  });

  document.addEventListener("click", event => {
    if (!$("accountArea").contains(event.target)) {
      closeAccountMenu();
    }
  });

  $("logoutButton").addEventListener("click", async () => {
    closeAccountMenu();

    const { error } =
      await supabaseClient.auth.signOut();

    if (error) {
      setStatus("خطا در خروج: " + error.message, "error");
      return;
    }

    setAllMeetings([]);
    meetingsList.replaceChildren();
    editorPanel.hidden = true;

    setCurrentMeetingId(null);
    setOriginalMeeting(null);
    setIsCreating(false);

    showLogin();
    setStatus("");
  });
}

async function init() {
  if (
    !window.supabase ||
    typeof supabaseClient === "undefined"
  ) {
    setStatus(
      "کتابخانه یا اتصال Supabase بارگذاری نشده است. " +
      "اتصال شبکه و js/supabase_client.js را بررسی کن.",
      "error"
    );
    return;
  }

  try {
    const membersModule =
      await import("./admin-members.js");

    const meetingsModule =
      await import("./admin-meetings.js");

    const uiModule =
      await import("./admin-ui.js");

    bindAuthenticationEvents(meetingsModule.loadMeetings);
    uiModule.initUI();

    await membersModule.loadReferenceData();
    await checkSession(meetingsModule.loadMeetings);
  } catch (error) {
    console.error("خطا در راه‌اندازی پنل مدیریت:", error);

    setStatus(
      "راه‌اندازی پنل ناموفق بود: " + error.message,
      "error"
    );
  }
}

init();