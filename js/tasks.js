/* =====================================================
        وضعیت تکلیف

        فعلاً وضعیت‌های موجود را نگه می‌داریم.
        بعداً می‌توانیم statusهای جدید type study را
        مستقل تعریف کنیم.
        ===================================================== */

        function getTaskStatusLabel(status) {

        const statuses = {

        ongoing: "جاری",

        completed: "تکمیل",

        cancelled: "لغو",

        late_done: "تکمیل با تأخیر"

        };


        return (
        statuses[status] ||
        status ||
        "-"
        );
        }



        /* =====================================================
        آیا یک نفر سورس دارد؟
        ===================================================== */

        function hasSources(participant) {

        return (
        Array.isArray(
        participant?.sources
        ) &&
        participant.sources.length > 0
        );
        }



        /* =====================================================
        ساخت نشان سورس
        ===================================================== */

        function createSourceBadge(
    participant,
    taskId
) {

    const hasSource =
        hasSources(participant);

    if (!hasSource) {

        const badge =
            document.createElement("span");

        badge.className =
            "source-badge no-source";

        badge.textContent =
            "ندارد";

        return badge;
    }


    const link =
        document.createElement("a");

    link.className =
        "source-badge has-source";

    link.href =
        `task_source_viewer.html?task=${encodeURIComponent(taskId)}&member=${encodeURIComponent(participant.member)}`;

    link.textContent =
        participant.sources.length > 1
            ? `مشاهده ${toPersianDigits(participant.sources.length)} فایل`
            : "مشاهده";

    link.target =
        "_blank";

    return link;
}


        /* =====================================================
        نمایش تکلیف بر اساس type
        ===================================================== */

        function renderTaskByType(task, members) {

        switch (task.type) {

        case "study":
            return renderStudyTask(task, members);

        case "follow_up":
            return renderFollowUpTask(task, members);

        default:
            return renderUnknownTask(task);
        }
        }



        /* =====================================================
        type ناشناخته
        ===================================================== */

        function renderUnknownTask(task) {

        const box =
        document.createElement(
        "div"
        );


        box.className =
        "task";


        const title =
        document.createElement(
        "div"
        );


        title.className =
        "task-title";


        title.textContent =
        task.name ||
        "تکلیف";


        box.appendChild(
        title
        );


        const description =
        document.createElement(
        "div"
        );


        description.className =
        "task-description";


        description.textContent =
        "نمایش این نوع تکلیف هنوز تعریف نشده است.";


        box.appendChild(
        description
        );


        return box;
        }



        /* =====================================================
        نمایش تکالیف جلسه
        ===================================================== */

        async function renderTasks(
    meeting,
    members
) {

    const accordion =
        document.getElementById(
            "tasksAccordion"
        );

    const container =
        document.getElementById(
            "tasksContent"
        );

    container.innerHTML = "";

    const taskItems =
        Array.isArray(meeting.tasks)
            ? meeting.tasks
            : [];


    /*
     * اگر جلسه هیچ تکلیفی نداشته باشد
     */
    if (!taskItems.length) {

        accordion.style.display =
            "none";

        return;
    }


    /*
     * استخراج ID تکلیف
     *
     * هر دو حالت را قبول می‌کنیم:
     *
     * "task-001"
     *
     * یا:
     *
     * {
     *     "id": "task-001"
     * }
     */
    const taskIds =
        taskItems
            .map(
                item =>
                    typeof item === "string"
                        ? item
                        : item?.id
            )
            .filter(Boolean);


    if (!taskIds.length) {

        accordion.style.display =
            "none";

        return;
    }


    /*
     * بارگذاری فایل‌های تکلیف
     */
    const taskResults =
        await Promise.all(
            taskIds.map(
                async taskId => {

                    try {

                        const response =
                            await fetch(
                                `data/tasks/${encodeURIComponent(taskId)}.json`
                            );


                        if (!response.ok) {

                            console.error(
                                `فایل تکلیف پیدا نشد: ${taskId}`
                            );

                            return null;
                        }


                        return await response.json();

                    }

                    catch (error) {

                        console.error(
                            `خطا در بارگذاری تکلیف ${taskId}`,
                            error
                        );

                        return null;
                    }
                }
            )
        );


    /*
     * فقط تکالیف معتبر
     */
    const validTasks =
        taskResults.filter(
            task =>
                task &&
                task.id
        );


    /*
     * اگر هیچ تکلیف معتبری پیدا نشد
     */
    if (!validTasks.length) {

        accordion.style.display =
            "none";

        return;
    }


    /*
     * نمایش آکاردئون
     */
    accordion.style.display =
        "block";


    /*
     * نمایش تکالیف
     */
    validTasks.forEach(
        task => {

            const taskElement =
                renderTaskByType(
                    task,
                    members
                );

            container.appendChild(
                taskElement
            );
        }
    );
}