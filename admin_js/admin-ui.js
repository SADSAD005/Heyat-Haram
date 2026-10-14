
import {
  $,
  currentContentType,
  setCurrentContentType,
  setCurrentPage,
  setStatus
} from "./admin-core.js";

import {
  renderMeetings,
  addMeeting,
  loadMeetings
} from "./admin-meetings.js";

import {
  selectedTaskIds,
  renderTaskPicker
} from "./admin-tasks.js";

import {
  renderAttendance,
  createAttendanceItem
} from "./admin-members.js";

// شمارش موضوعات باز
export function updateOpenTopicsCount() {
  const list = $("openTopicsList");
  const count = $("openTopicsCount");

  if (!list || !count) return;

  count.textContent = String(
    list.querySelectorAll(".open-topic-item").length
  );
}

// ساخت ردیف موضوع باز
export function createOpenTopicItem(topic = {}) {
  const list = $("openTopicsList");
  if (!list) return null;

  const item = document.createElement("div");
  item.className = "open-topic-item";

  const title = document.createElement("input");
  title.type = "text";
  title.className = "open-topic-title";
  title.placeholder = "عنوان موضوع";
  title.value = topic.title || "";

  const description = document.createElement("textarea");
  description.className = "open-topic-description";
  description.placeholder = "توضیحات موضوع";
  description.value = topic.description || "";

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "remove-open-topic";
  removeButton.textContent = "حذف";

  removeButton.addEventListener("click", () => {
    item.remove();
    updateOpenTopicsCount();
  });

  item.append(title, description, removeButton);
  list.appendChild(item);

  updateOpenTopicsCount();

  return item;
}

// نمایش موضوعات باز
export function renderOpenTopics(topics = []) {
  const list = $("openTopicsList");
  if (!list) return;

  list.innerHTML = "";

  topics.forEach(topic => createOpenTopicItem(topic));

  updateOpenTopicsCount();
}

// خواندن موضوعات باز
export function readOpenTopics() {
  const list = $("openTopicsList");
  if (!list) return [];

  return Array.from(
    list.querySelectorAll(".open-topic-item")
  )
    .map(item => ({
      title:
        item.querySelector(".open-topic-title")?.value.trim() || "",
      description:
        item.querySelector(".open-topic-description")?.value.trim() || ""
    }))
    .filter(topic => topic.title || topic.description);
}

// تغییر نوع محتوای مدیریت
export function changeContentType(type) {
  setCurrentContentType(type);
  setCurrentPage(0);

  document.querySelectorAll(".content-tab").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.type === type
    );
  });

  const meetingsView = $("meetingsView");
  const tasksView = $("tasksView");
  const membersView = $("membersView");

  if (meetingsView) {
    meetingsView.hidden = type !== "meetings";
  }

  if (tasksView) {
    tasksView.hidden = type !== "tasks";
  }

  if (membersView) {
    membersView.hidden = type !== "members";
  }

  if (type === "meetings") {
    renderMeetings();
  }

  if (type === "tasks") {
    renderTaskPicker(selectedTaskIds());
  }
}

// اتصال رویدادهای رابط کاربری
export function initUI() {
  document.querySelectorAll(".content-tab").forEach(button => {
    button.addEventListener("click", () => {
      changeContentType(button.dataset.type);
    });
  });

  const addButton = $("addButton");

  if (addButton) {
    addButton.addEventListener("click", addMeeting);
  }

  const refreshButton = $("refreshMeetingsButton");

  if (refreshButton) {
    refreshButton.addEventListener("click", async () => {
      await loadMeetings();
    });
  }

  const addOpenTopicButton = $("addOpenTopicButton");

  if (addOpenTopicButton) {
    addOpenTopicButton.addEventListener("click", () => {
      createOpenTopicItem();
    });
  }


const addAttendanceButton = $("addAttendanceButton");

if (addAttendanceButton) {
  addAttendanceButton.addEventListener("click", () => {
    const memberSelect = $("addAttendanceMember");
    const statusSelect = $("newAttendanceStatus");

    const memberId = memberSelect?.value || "";
    const status = statusSelect?.value || "present";

    if (!memberId) {
      setStatus("ابتدا عضو موردنظر را انتخاب کن.", "error");
      return;
    }

    const list = $("attendanceList");

    const alreadyAdded = Array.from(
      list?.querySelectorAll(".attendance-member") || []
    ).some(select => select.value === memberId);

    if (alreadyAdded) {
      setStatus("این عضو قبلاً به فهرست حضور و غیاب اضافه شده است.", "error");
      return;
    }

    createAttendanceItem({
      member_id: memberId,
      status
    });

    // آماده‌سازی برای انتخاب عضو بعدی
    memberSelect.value = "";
    setStatus("");
  });
}


  const taskSearch = $("taskSearch");

  if (taskSearch) {
    taskSearch.addEventListener("input", () => {
      renderTaskPicker(selectedTaskIds());
    });
  }
}
