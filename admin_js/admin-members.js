
import {
  $,
  members,
  setMembers,
  setStatus,
  loadLocalJSON
} from "./admin-core.js";

// نام نمایشی عضو
export function memberName(id) {
  const member = members.find(item => item.id === id);

  if (!member) {
    return id || "نامشخص";
  }

  return (
    member.display_name ||
    [member.name, member.family_name].filter(Boolean).join(" ") ||
    member.name ||
    member.id
  );
}

// مرتب‌سازی اعضا بر اساس نام
export function memberSort(a, b) {
  return memberName(a.id).localeCompare(
    memberName(b.id),
    "fa"
  );
}

// پر کردن فهرست انتخاب اعضا
export function populateMemberSelect(
  select,
  selected = "",
  includeEmpty = true
) {
  if (!select) return;

  const previousValue = selected || select.value || "";

  select.innerHTML = "";

  if (includeEmpty) {
    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = "انتخاب عضو";
    select.appendChild(emptyOption);
  }

  const sortedMembers = [...members].sort(memberSort);

  sortedMembers.forEach(member => {
    const option = document.createElement("option");

    option.value = member.id;
    option.textContent = memberName(member.id);

    select.appendChild(option);
  });

  // حفظ مقدار قبلی، حتی اگر عضو در فهرست فعلی نباشد
  if (
    previousValue &&
    !Array.from(select.options).some(
      option => option.value === previousValue
    )
  ) {
    const option = document.createElement("option");

    option.value = previousValue;
    option.textContent = memberName(previousValue);

    select.appendChild(option);
  }

  select.value = previousValue;
}

// پر کردن فهرست وضعیت حضور
export function populateStatusSelect(
  select,
  selected = "present"
) {
  if (!select) return;

  const statuses = [
    ["present", "حاضر"],
    ["absent", "غایب"],
    ["late", "با تأخیر"],
    ["excused", "با عذر"]
  ];

  select.innerHTML = "";

  statuses.forEach(([value, label]) => {
    const option = document.createElement("option");

    option.value = value;
    option.textContent = label;

    select.appendChild(option);
  });

  // حفظ وضعیت‌های قدیمی و ناشناخته
  if (
    selected &&
    !statuses.some(([value]) => value === selected)
  ) {
    const option = document.createElement("option");

    option.value = selected;
    option.textContent = selected;

    select.appendChild(option);
  }

  select.value = selected;
}


export async function loadReferenceData() {
  try {
    const { data, error } = await supabaseClient
      .from("members")
      .select("id, data")
      .order("id", { ascending: true });

    if (error) {
      throw error;
    }

    // استخراج اطلاعات اعضا از ستون jsonb
    const loadedMembers = (data || [])
      .map((row) => {
        const memberData =
          row.data && typeof row.data === "object"
            ? row.data
            : {};

        return {
          ...memberData,

          // شناسه اصلی جدول، در صورت نبود شناسه داخل JSON
          id: memberData.id || row.id,
        };
      })
      .filter((member) => member.active !== false)
      .sort(
        (a, b) =>
          (Number(a.sort_order) || 99999) -
          (Number(b.sort_order) || 99999)
      );

    setMembers(loadedMembers);

    populateMemberSelect($("moderator"));
    populateMemberSelect($("secretary"));
    populateMemberSelect($("addAttendanceMember"));

    populateStatusSelect($("newAttendanceStatus"), "present");

    console.log("اعضا از Supabase بارگذاری شدند:", loadedMembers.length);
  } catch (error) {
    console.error("خطا در بارگذاری اعضا از Supabase:", error);
    setStatus(
      "بارگذاری فهرست اعضا از پایگاه داده ناموفق بود: " + error.message,
      "error"
    );
  }
}


// به‌روزرسانی شمارنده حضور و غیاب
export function updateAttendanceCount() {
  const list = $("attendanceList");
  const count = $("attendanceCount");

  if (!list || !count) return;

  count.textContent = String(
    list.querySelectorAll(".attendance-item").length
  );
}


export function createAttendanceItem(entry = {}) {
  const list = $("attendanceList");
  if (!list) return null;

  const memberId = String(
    entry.member_id || entry.memberId || entry.member || ""
  );

  const status = entry.status || "present";

  const item = document.createElement("div");
  item.className = "attendance-item";
  item.dataset.memberId = memberId;

  // نام عضو به صورت متن ثابت
  const name = document.createElement("span");
  name.className = "attendance-member-name";
  name.textContent = memberName(memberId);

  // وضعیت حضور همچنان قابل تغییر است
  const statusSelect = document.createElement("select");
  statusSelect.className = "attendance-status";
  populateStatusSelect(statusSelect, status);

  // دکمه حذف
  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "remove-attendance";
  removeButton.textContent = "حذف";

  removeButton.addEventListener("click", () => {
    item.remove();
    updateAttendanceCount();
    refreshAttendanceMemberOptions();
  });

  item.append(name, statusSelect, removeButton);
  list.appendChild(item);

  updateAttendanceCount();
  refreshAttendanceMemberOptions();

  return item;
}


// جلوگیری از انتخاب تکراری یک عضو در حضور و غیاب
export function refreshAttendanceMemberOptions() {
  const list = $("attendanceList");
  const addMemberSelect = $("addAttendanceMember");

  if (!list) return;

  const selectedIds = new Set(
    Array.from(list.querySelectorAll(".attendance-item"))
      .map(item => item.dataset.memberId)
      .filter(Boolean)
  );

  // کم‌رنگ‌کردن و غیرفعال‌کردن اعضایی که قبلاً اضافه شده‌اند
  if (addMemberSelect) {
    Array.from(addMemberSelect.options).forEach(option => {
      if (!option.value) return;

      const isSelected = selectedIds.has(option.value);

      option.disabled = isSelected;
      option.style.color = isSelected ? "#888" : "";
    });
  }
}


// نمایش فهرست حضور و غیاب
export function renderAttendance(entries = []) {
  const list = $("attendanceList");

  if (!list) return;

  list.innerHTML = "";

  entries.forEach(entry => {
    createAttendanceItem(entry);
  });

  updateAttendanceCount();
  refreshAttendanceMemberOptions();
}

// خواندن اطلاعات حضور و غیاب از فرم

export function readAttendance() {
  const list = $("attendanceList");
  if (!list) return [];

  const entries = Array.from(
    list.querySelectorAll(".attendance-item")
  ).map(item => ({
    member: item.dataset.memberId || "",
    status:
      item.querySelector(".attendance-status")?.value || "present"
  }));

  const validEntries = entries.filter(entry => entry.member);
  const memberIds = validEntries.map(entry => entry.member);

  if (new Set(memberIds).size !== memberIds.length) {
    throw new Error(
      "یک عضو را بیش از یک بار در فهرست حضور و غیاب انتخاب کرده‌اید."
    );
  }

  return validEntries;
}


