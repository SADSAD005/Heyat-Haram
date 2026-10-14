/* =====================================================
        نمایش یک تکلیف مطالعاتی
        ===================================================== */

        function renderStudyTask(
        task,
        members
        ) {

        const box =
        document.createElement(
        "div"
        );


        box.className =
        "task";


        /* -------------------------
        عنوان
        ------------------------- */

        const title =
        document.createElement(
        "div"
        );


        title.className =
        "task-title";


        title.textContent =
        task.name ||
        "-";


        box.appendChild(title);



        /* -------------------------
        شرح
        ------------------------- */

        if (task.description) {

        const description =
        document.createElement(
        "div"
        );


        description.className =
        "task-description";


        description.textContent =
        task.description;


        box.appendChild(
        description
        );
        }



        /* -------------------------
        مشخصات تکلیف
        ------------------------- */

        const meta =
        document.createElement(
        "div"
        );


        meta.className =
        "task-meta";


        const registeredBy =
        getMember(
        task.registered_by,
        members
        );


        const registeredByName =
        registeredBy
        ? (
        registeredBy.display_name ||
        `${registeredBy.name || ""} ${registeredBy.family_name || ""}`.trim()
        )
        : "-";


        const registeredDate =
        task.registered_date
        ? toPersianDigits(
        task.registered_date
        )
        : "-";


        const dueDate =
        task.due_date
        ? toPersianDigits(
        task.due_date
        )
        : "-";


        meta.innerHTML = `

        <strong>
        تعریف‌کننده:
        </strong>

        <span>
        ${escapeHtml(registeredByName)}
        </span>

        <span class="task-meta-separator">
        |
        </span>

        <strong>
        شروع:
        </strong>

        <span>
        ${escapeHtml(registeredDate)}
        </span>

        <span class="task-meta-separator">
        |
        </span>

        <strong>
        مقرری:
        </strong>

        <span>
        ${escapeHtml(dueDate)}
        </span>

        `;


        box.appendChild(
        meta
        );



        /* -------------------------
        جدول افراد
        ------------------------- */

        const participants =
        Array.isArray(
        task.participants
        )
        ? task.participants
        : [];


        if (participants.length) {

        const wrapper =
        document.createElement(
        "div"
        );


        wrapper.className =
        "task-table-wrapper";


        const table =
        document.createElement(
        "table"
        );


        table.className =
        "task-table";


        table.innerHTML = `

        <thead>

        <tr>

        <th>
        اسم
        </th>

        <th>
        شرح
        </th>

        <th>
        وضعیت
        </th>

        <th>
        منبع
        </th>

        </tr>

        </thead>

        <tbody>
        </tbody>

        `;


        const tbody =
        table.querySelector(
        "tbody"
        );


        participants.forEach(
        participant => {

        const tr =
        document.createElement(
        "tr"
        );


        /* اسم */

        const nameCell =
        document.createElement(
        "td"
        );


        const member =
        getMember(
        participant.member,
        members
        );


        if (member) {

        const memberLink =
        createMemberLink(
        member
        );


        memberLink.style.padding =
        "5px 10px";


        memberLink.style.borderRadius =
        "8px";


        nameCell.appendChild(
        memberLink
        );

        } else {

        nameCell.textContent =
        "-";
        }



        /* شرح */

        const responsibilityCell =
        document.createElement(
        "td"
        );


        responsibilityCell.textContent =
        participant.responsibility ||
        "-";



        /* وضعیت */

        const statusCell =
        document.createElement(
        "td"
        );


        statusCell.className =
        "task-status";


        statusCell.textContent =
        getTaskStatusLabel(
        participant.status
        );



        /* سورس */

        const sourceCell =
        document.createElement(
        "td"
        );


        sourceCell.appendChild(
        createSourceBadge(
        participant,
        task.id
        )
        );


        tr.appendChild(
        nameCell
        );


        tr.appendChild(
        responsibilityCell
        );


        tr.appendChild(
        statusCell
        );


        tr.appendChild(
        sourceCell
        );


        tbody.appendChild(
        tr
        );
        }
        );


        wrapper.appendChild(
        table
        );


        box.appendChild(
        wrapper
        );
        }


        return box;
        }
