        /* =====================================================
   نمایش یک تکلیف پیگیری
===================================================== */

function renderFollowUpTask(task, members) {

    const box = document.createElement("div");
    box.className = "task";

    /* -------------------------
       عنوان
    ------------------------- */

    const title = document.createElement("div");
    title.className = "task-title";
    title.textContent = task.name || "-";

    box.appendChild(title);


    /* -------------------------
       شرح پیگیری
    ------------------------- */

    if (task.description) {

        const description = document.createElement("div");
        description.className = "task-description";
        description.textContent = task.description;

        box.appendChild(description);
    }


    /* -------------------------
       مشخصات تکلیف
    ------------------------- */

    const meta = document.createElement("div");
    meta.className = "task-meta follow-up-meta";

    const createdBy = getMember(task.created_by, members);

    const createdByName = createdBy
        ? (
            createdBy.display_name ||
            `${createdBy.name || ""} ${createdBy.family_name || ""}`.trim()
        )
        : "-";

    const startDate = task.start_date
        ? toPersianDigits(task.start_date)
        : "-";

    const endDate = task.end_date
        ? toPersianDigits(task.end_date)
        : "-";

    function addMetaItem(label, value) {

        const item = document.createElement("span");

        const strong = document.createElement("strong");
        strong.textContent = label;

        const text = document.createElement("span");
        text.textContent = value;

        item.append(strong, " ", text);
        meta.appendChild(item);
    }

    addMetaItem("شماره:", toPersianDigits(task.number ?? "-"));
    addMetaItem("ایجادکننده:", createdByName);
    addMetaItem("شروع:", startDate);
    addMetaItem("پایان:", endDate);

    box.appendChild(meta);


    /* -------------------------
       مسئولان پیگیری
    ------------------------- */

    const assignedMembers = Array.isArray(task.for)
        ? task.for
        : [];

    if (assignedMembers.length) {

        const assignedSection = document.createElement("div");
        assignedSection.className = "follow-up-assignees";

        const assignedTitle = document.createElement("div");
        assignedTitle.className = "follow-up-section-title";
        assignedTitle.textContent = "مسئولان پیگیری";

        assignedSection.appendChild(assignedTitle);

        const assignedList = document.createElement("div");
        assignedList.className = "follow-up-member-list";

        assignedMembers.forEach(memberId => {

            const member = getMember(memberId, members);

            if (member) {
                assignedList.appendChild(createMemberLink(member));
            }
        });

        assignedSection.appendChild(assignedList);
        box.appendChild(assignedSection);
    }


    /* -------------------------
       گزارش‌های پیگیری
    ------------------------- */

    const comments = Array.isArray(task.comments)
        ? task.comments
            .map((comment, index) => ({
                comment,
                index
            }))
            .sort((a, b) => {
                const dateA = a.comment.date || "";
                const dateB = b.comment.date || "";

                return dateB.localeCompare(dateA)
                    || a.index - b.index;
            })
            .map(item => item.comment)
        : [];

    const commentsSection = document.createElement("div");
    commentsSection.className = "follow-up-comments";

    const commentsHeader = document.createElement("div");
    commentsHeader.className = "follow-up-comments-header";

    const commentsTitle = document.createElement("div");
    commentsTitle.className = "follow-up-section-title";
    commentsTitle.textContent = "گزارش‌های پیگیری";

    const commentsCount = document.createElement("span");
    commentsCount.className = "follow-up-comments-count";
    commentsCount.textContent =
        `${toPersianDigits(comments.length)} گزارش`;

    commentsHeader.append(commentsTitle, commentsCount);
    commentsSection.appendChild(commentsHeader);

    if (!comments.length) {

        const empty = document.createElement("div");
        empty.className = "follow-up-empty";
        empty.textContent = "هنوز گزارشی برای این پیگیری ثبت نشده است.";

        commentsSection.appendChild(empty);

    } else {

        comments.forEach((comment, index) => {

            const commentBox = document.createElement("div");
            commentBox.className = "follow-up-comment";

            /* عنوان گزارش و تاریخ */

            const commentHeader = document.createElement("div");
            commentHeader.className = "follow-up-comment-header";

            const commentNumber = document.createElement("strong");
            commentNumber.textContent =
                `گزارش ${toPersianDigits(index + 1)}`;

            const commentDate = document.createElement("span");
            commentDate.className = "follow-up-comment-date";
            commentDate.textContent = comment.date
                ? toPersianDigits(comment.date)
                : "بدون تاریخ";

            commentHeader.append(commentNumber, commentDate);
            commentBox.appendChild(commentHeader);


            /* نویسنده */

            const author = getMember(comment.author, members);

            const authorRow = document.createElement("div");
            authorRow.className = "follow-up-comment-author";

            authorRow.append("نویسنده: ");

            if (author) {
                authorRow.appendChild(createMemberLink(author));
            } else {
                authorRow.append(
                    comment.author || "-"
                );
            }

            commentBox.appendChild(authorRow);


            /* توضیحات */

            const commentDescription = document.createElement("div");
            commentDescription.className = "follow-up-comment-description";
            commentDescription.textContent =
                comment.description || "-";

            commentBox.appendChild(commentDescription);


            /* سورس اختیاری */

            const sourceRow = document.createElement("div");
            sourceRow.className = "follow-up-comment-source";

            sourceRow.appendChild(
                createFollowUpSourceBadge(
                    comment,
                    task.id
                )
            );

            commentBox.appendChild(sourceRow);
            commentsSection.appendChild(commentBox);
        });
    }

    box.appendChild(commentsSection);

    return box;
}


/* =====================================================
   سورس یک گزارش پیگیری
===================================================== */

function createFollowUpSourceBadge(comment, taskId) {

    const source = comment.source;

    if (!source || !source.url) {

        const badge = document.createElement("span");
        badge.className = "source-badge no-source";
        badge.textContent = "بدون سورس";

        return badge;
    }

    const link = document.createElement("a");

    link.className = "source-badge has-source";
    link.href =
        `task_source_viewer.html?task=${encodeURIComponent(taskId)}&member=${encodeURIComponent(comment.author || "")}`;

    link.textContent = "مشاهده سورس";
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    return link;
}


        