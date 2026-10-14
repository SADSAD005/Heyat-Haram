
 // admin_js/admin-meetings.js

import {
  $,
  PAGE_SIZE,
  setStatus,
  setAllMeetings,
  setCurrentPage,
  setCurrentMeetingId,
  setOriginalMeeting,
  setSaving,
  setIsCreating,
  allMeetings,
  currentPage,
  currentContentType,
  originalMeeting,
  currentMeetingId,
  isCreating,
  makeId,
  jsonText,
  parseJSONField
} from "./admin-core.js";

import {
  populateMemberSelect,
  renderAttendance,
  readAttendance
} from "./admin-members.js";

import {
  selectedTaskIds,
  renderSelectedTasks
} from "./admin-tasks.js";

import {
  renderOpenTopics,
  readOpenTopics
} from "./admin-ui.js";


// ---------------- نمایش وضعیت خالی ----------------

export function renderEmpty(message, detail = "") {
  const meetingsList = $("meetingsList");
  meetingsList.replaceChildren();

  const state = document.createElement("div");
  state.className = "empty-state";

  const title = document.createElement("strong");
  title.textContent = message;
  state.appendChild(title);

  if (detail) {
    const description = document.createElement("span");
    description.textContent = detail;
    state.appendChild(description);
  }

  meetingsList.appendChild(state);
}


// ---------------- نمایش جلسات ----------------

export function renderMeetings() {
  const meetingsList = $("meetingsList");
  meetingsList.replaceChildren();

  const total = allMeetings.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const page = Math.max(
    0,
    Math.min(currentPage, totalPages - 1)
  );

  if (page !== currentPage) {
    setCurrentPage(page);
  }

  $("listTitle").textContent = "جلسات";
  $("listCount").textContent = total + " گزارش";

  if (!total) {
    renderEmpty("گزارشی پیدا نشد.");
  } else {
    allMeetings
      .slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)
      .forEach(row => {
        const meeting = row.data || {};

        const item = document.createElement("div");
        item.className = "report-row";

        const title = document.createElement("div");
        title.className = "report-title";
        title.textContent = meeting.name || "جلسه " + row.id;

        const meta = document.createElement("div");
        meta.className = "report-meta";

        const date = document.createElement("div");
        date.className = "report-date";
        date.textContent =
          meeting.datetime?.date_solar ||
          meeting.datetime?.date_gregorian ||
          "بدون تاریخ";

        const topic = document.createElement("div");
        topic.className = "report-topic";
        topic.textContent = "شناسه: " + row.id;

        meta.append(date, topic);

        const edit = document.createElement("button");
        edit.type = "button";
        edit.className = "edit-button";
        edit.textContent = "ویرایش";

        edit.addEventListener("click", () => {
          openMeetingEditor({
            ...meeting,
            id: row.id
          });
        });

        item.append(title, meta, edit);
        meetingsList.appendChild(item);
      });
  }

  $("pageIndicator").textContent =
    "صفحهٔ " + (page + 1) + " از " + totalPages;

  $("previousPage").disabled = page <= 0;
  $("nextPage").disabled = page >= totalPages - 1;
}


// ---------------- دریافت جلسات از Supabase ----------------

export async function loadMeetings() {
  renderEmpty("در حال دریافت اطلاعات...");

  $("listCount").textContent = "";
  $("previousPage").disabled = true;
  $("nextPage").disabled = true;

  const { data, error } = await supabaseClient
    .from("meetings")
    .select("id,data,updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    setAllMeetings([]);
    renderEmpty("دریافت گزارش‌ها ناموفق بود.");

    setStatus(
      "خطا در دریافت گزارش‌ها: " + error.message,
      "error"
    );
    return;
  }

  setAllMeetings(data || []);
  setCurrentPage(0);

  setStatus("");
  renderMeetings();
}


// ---------------- بازکردن فرم جلسه ----------------

export function openMeetingEditor(meeting, creating = false) {
  setIsCreating(creating);
  setOriginalMeeting(structuredClone(meeting));
  setCurrentMeetingId(meeting.id);

  const dt = meeting.datetime || {};

  $("editorTitle").textContent = creating
    ? "ایجاد جلسهٔ جدید"
    : "ویرایش: " + (meeting.name || meeting.id);

  $("meetingName").value = meeting.name || "";

  $("dateGregorian").value = dt.date_gregorian || "";
  $("dateSolar").value = dt.date_solar || "";
  $("dateLunar").value = dt.date_lunar || "";

  $("startTime").value = dt.start_time || "";
  $("endTime").value = dt.end_time || "";

  populateMemberSelect(
    $("moderator"),
    meeting.moderator || "",
    true
  );

  populateMemberSelect(
    $("secretary"),
    meeting.secretary || "",
    true
  );

  populateMemberSelect(
    $("addAttendanceMember"),
    "",
    true
  );

  $("description").value = meeting.description || "";
  $("minutes").value = meeting.minutes || "";

  $("topics").value = Array.isArray(meeting.topics)
    ? meeting.topics.join("\n")
    : "";

  renderAttendance(meeting.attendance || []);

  $("interruptions").value =
    jsonText(dt.interruptions || []);

  $("totalInterruptionMinutes").value =
    dt.total_interruption_minutes ?? 0;

  $("taskSearch").value = "";

  renderSelectedTasks(meeting.tasks || []);
  renderOpenTopics(meeting.open_topics || []);

  $("media").value = JSON.stringify(
    meeting.media || {
      audio: [],
      video: [],
      images: []
    },
    null,
    2
  );

  $("tags").value = Array.isArray(meeting.tags)
    ? meeting.tags.join("\n")
    : "";

  $("editorPanel").hidden = false;

  $("editorPanel").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}


// ---------------- ساخت شناسه جلسه ----------------

export function createMeetingId() {
  const ids = allMeetings.map(row => String(row.id));

  let max = 0;

  ids.forEach(id => {
    const match = id.match(/^meeting-(\d+)$/);

    if (match) {
      max = Math.max(max, Number(match[1]));
    }
  });

  let candidate;

  do {
    max += 1;
    candidate = "meeting-" + String(max).padStart(3, "0");
  } while (ids.includes(candidate));

  return candidate;
}


// ---------------- ایجاد جلسه جدید ----------------

export function addMeeting() {
  if (currentContentType !== "meetings") {
    setStatus(
      "افزودن مستقل اعضا و تکالیف هنوز فعال نشده است.",
      "error"
    );
    return;
  }

  const id = createMeetingId();

  const newMeeting = {
    id,
    name: "",
    datetime: {
      date_gregorian: "",
      date_solar: "",
      date_lunar: "",
      start_time: "",
      end_time: "",
      interruptions: [],
      total_interruption_minutes: 0
    },
    moderator: "",
    attendance: [],
    secretary: "",
    topics: [],
    description: "",
    minutes: "",
    tasks: [],
    open_topics: [],
    media: {
      audio: [],
      video: [],
      images: []
    },
    tags: []
  };

  openMeetingEditor(newMeeting, true);
}


// ---------------- ذخیره جلسه ----------------

async function saveMeeting(event) {
  event.preventDefault();

  if (originalMeeting === null || currentMeetingId === null) {
    return;
  }

  // از ذخیره هم‌زمان چندباره جلوگیری می‌کند.
  // وضعیت saving در فایل اصلی نگهداری می‌شود.
  setSaving(true);
  $("saveButton").disabled = true;

  try {
    const updated = structuredClone(originalMeeting);

    updated.id = currentMeetingId;
    updated.name = $("meetingName").value.trim();
    updated.moderator = $("moderator").value;
    updated.secretary = $("secretary").value;
    updated.description = $("description").value;
    updated.minutes = $("minutes").value;

    updated.datetime = {
      ...(updated.datetime || {}),
      date_gregorian: $("dateGregorian").value,
      date_solar: $("dateSolar").value.trim(),
      date_lunar: $("dateLunar").value.trim(),
      start_time: $("startTime").value,
      end_time: $("endTime").value,

      interruptions: parseJSONField(
        "interruptions",
        "array",
        "وقفه‌ها"
      ),

      total_interruption_minutes:
        Number($("totalInterruptionMinutes").value || 0)
    };

    updated.topics = $("topics").value
      .split("\n")
      .map(value => value.trim())
      .filter(Boolean);

    updated.attendance = readAttendance();
    updated.tasks = selectedTaskIds();
    updated.open_topics = readOpenTopics();

    updated.media = parseJSONField(
      "media",
      "object",
      "رسانه‌ها"
    );

    updated.tags = $("tags").value
      .split("\n")
      .map(value => value.trim())
      .filter(Boolean);

    if (!updated.name) {
      throw new Error("عنوان جلسه را وارد کن.");
    }

    const {
      data: sessionData,
      error: sessionError
    } = await supabaseClient.auth.getSession();

    if (
      sessionError ||
      !sessionData.session ||
      sessionData.session.user.id !==
        "81eddee5-8203-4e5a-9eaa-e1031853d3a6"
    ) {
      throw new Error(
        "نشست مدیر معتبر نیست؛ دوباره وارد شو."
      );
    }

    setStatus("در حال ذخیرهٔ تغییرات...");

    let result;

    if (isCreating) {
      result = await supabaseClient
        .from("meetings")
        .insert({
          id: currentMeetingId,
          data: updated,
          updated_at: new Date().toISOString()
        });
    } else {
      result = await supabaseClient
        .from("meetings")
        .update({
          data: updated,
          updated_at: new Date().toISOString()
        })
        .eq("id", currentMeetingId);
    }

    if (result.error) {
      throw new Error(result.error.message);
    }

    $("editorPanel").hidden = true;

    setCurrentMeetingId(null);
    setOriginalMeeting(null);
    setIsCreating(false);

    await loadMeetings();

    setStatus(
      "جلسه با موفقیت در Supabase ذخیره شد.",
      "success"
    );
  } catch (error) {
    setStatus(
      "ذخیره انجام نشد: " + error.message,
      "error"
    );
  } finally {
    setSaving(false);
    $("saveButton").disabled = false;
  }
}


// ---------------- رویدادهای جلسه ----------------

// این رویدادها هنگام بارگذاری ماژول ثبت می‌شوند.
$("previousPage").addEventListener("click", () => {
  if (currentPage > 0) {
    setCurrentPage(currentPage - 1);
    renderMeetings();
  }
});

$("nextPage").addEventListener("click", () => {
  if ((currentPage + 1) * PAGE_SIZE < allMeetings.length) {
    setCurrentPage(currentPage + 1);
    renderMeetings();
  }
});

$("editorForm").addEventListener("submit", saveMeeting);

$("cancelButton").addEventListener("click", () => {
  $("editorPanel").hidden = true;

  setCurrentMeetingId(null);
  setOriginalMeeting(null);
  setIsCreating(false);

  $("editorForm").reset();
  setStatus("");
});
