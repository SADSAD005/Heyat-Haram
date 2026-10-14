 // admin_js/admin-tasks.js

import {
  $,
  tasks,
  setExpandedTaskIds,
  expandedTaskIds
} from "./admin-core.js";

// تاریخ نمایش تکلیف
export function taskDate(task) {
  return (
    task.due_date ||
    task.registered_date ||
    task.date ||
    "بدون تاریخ"
  );
}

// عنوان نمایشی تکلیف
export function taskTitle(task) {
  return (
    task.name ||
    task.title ||
    task.id ||
    "تکلیف بدون عنوان"
  );
}

// شناسه‌های تکالیف انتخاب‌شده برای جلسه
export function selectedTaskIds() {
  const list = $("selectedTasksList");

  if (!list) return [];

  return Array.from(
    list.querySelectorAll("[data-task-id]")
  ).map(item => item.dataset.taskId);
}

// به‌روزرسانی شمارنده تکالیف
export function updateTasksCount() {
  const count = $("tasksCount");
  const ids = selectedTaskIds();

  if (count) {
    count.textContent = ids.length + " تکلیف";
  }
}

// نمایش تکالیف انتخاب‌شده در جلسه
export function renderSelectedTasks(ids = []) {
  const list = $("selectedTasksList");

  if (!list) return;

  list.replaceChildren();

  const uniqueIds = [...new Set(
    (ids || []).map(id => String(id))
  )];

  uniqueIds.forEach(id => {
    const task = tasks.find(
      item => String(item.id) === id
    );

    const item = document.createElement("div");
    item.className = "member-chip";
    item.dataset.taskId = id;

    const title = document.createElement("span");
    title.textContent = task
      ? taskTitle(task)
      : "تکلیف " + id;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "حذف";
    removeButton.setAttribute(
      "aria-label",
      "حذف تکلیف " + title.textContent
    );

    removeButton.addEventListener("click", () => {
      item.remove();
      updateTasksCount();
      renderTaskPicker(selectedTaskIds());
    });

    item.append(title, removeButton);
    list.appendChild(item);
  });

  updateTasksCount();
}

// نمایش فهرست تکالیف قابل انتخاب
export function renderTaskPicker(selectedIds = selectedTaskIds()) {
  const picker = $("taskPicker");

  if (!picker) return;

  const selected = new Set(
    (selectedIds || []).map(id => String(id))
  );

  const search = ($("taskSearch")?.value || "")
    .trim()
    .toLocaleLowerCase();

  picker.replaceChildren();

  const filteredTasks = tasks.filter(task => {
    const title = String(taskTitle(task)).toLocaleLowerCase();
    const date = String(taskDate(task)).toLocaleLowerCase();
    const description = String(
      task.description || task.details || ""
    ).toLocaleLowerCase();

    return (
      title.includes(search) ||
      date.includes(search) ||
      description.includes(search)
    );
  });

  if (!filteredTasks.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = tasks.length
      ? "تکلیفی مطابق جست‌وجو پیدا نشد."
      : "فهرست تکالیف بارگذاری نشده یا خالی است.";

    picker.appendChild(empty);
    return;
  }

  filteredTasks.forEach(task => {
    const id = String(task.id);

    const card = document.createElement("button");
    card.type = "button";
    card.className = "task-card";
    card.dataset.taskId = id;

    const title = document.createElement("strong");
    title.textContent = taskTitle(task);

    const date = document.createElement("span");
    date.className = "task-date";
    date.textContent = taskDate(task);

    const description = document.createElement("p");
    description.textContent =
      task.description || task.details || "شرحی ثبت نشده است.";
    description.hidden = !expandedTaskIds.has(id);

    const hint = document.createElement("small");

    if (selected.has(id)) {
      hint.textContent = "این تکلیف به جلسه اضافه شده است";
      card.disabled = true;
    } else if (expandedTaskIds.has(id)) {
      hint.textContent = "برای افزودن، دوباره کلیک کن";
    } else {
      hint.textContent = "برای مشاهده شرح کلیک کن";
    }

    card.append(title, date, description, hint);

    card.addEventListener("click", () => {
      if (selected.has(id)) return;

      if (!expandedTaskIds.has(id)) {
        const next = new Set(expandedTaskIds);
        next.add(id);
        setExpandedTaskIds(next);
        renderTaskPicker(selectedTaskIds());
        return;
      }

      renderSelectedTasks([
        ...selectedTaskIds(),
        id
      ]);

      const next = new Set(expandedTaskIds);
      next.delete(id);
      setExpandedTaskIds(next);

      renderTaskPicker(selectedTaskIds());
    });

    picker.appendChild(card);
  });
}