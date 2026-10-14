/* =====================================================
حضار
===================================================== */

function renderAttendees(
meeting,
members
) {
const container =
document.getElementById(
"attendees"
);

container.innerHTML = "";

const attendance = meeting.attendance || [];

const presentStatuses = [
"present",
"late_15",
"late"
];

const presentMembers =
attendance.filter(
item =>
presentStatuses.includes(
item.status
)
);

document.getElementById(
"presentCount"
).textContent =
toPersianDigits(
presentMembers.length
);

presentMembers.forEach(
item => {
const member =
getMember(
item.member,
members
);

if (!member) {return;}

container.appendChild(
createMemberLink(member)
);
}
);
}



/* =====================================================
کاتب
===================================================== */

function renderSecretary(
meeting,
members
) {

const container =
document.getElementById(
"secretary"
);

container.innerHTML = "";
const secretary =
getMember(
meeting.secretary,
members
);

if (!secretary) {return;}

container.appendChild(
createMemberLink(secretary)
);
}



/* =====================================================
جلسه گردان
===================================================== */

function renderModerator(
meeting,
members
) {

const container =
document.getElementById(
"moderatorName"
);

container.innerHTML = "";
const moderator =
getMember(
meeting.moderator,
members
);

if (!moderator) {
container.textContent =
"-";
return;
}

container.appendChild(
createMemberLink(moderator)
);
}



/* =====================================================
موضوعات
===================================================== */

        function renderTopics(meeting) {

        const container =
        document.getElementById(
        "topics"
        );


        const topics =
        meeting.topics || [];


        if (!topics.length) {

        container.textContent =
        "-";

        return;
        }


        container.innerHTML =
        topics
        .map(
        topic =>
        `<span>${escapeHtml(topic)}</span>`
        )
        .join(
        " &nbsp; | &nbsp; "
        );
        }



        /* =====================================================
        موضوعات جلسه بعد
        ===================================================== */

        function renderOpenTopics(meeting) {

        const container =
        document.getElementById(
        "openTopics"
        );


        const topics =
        meeting.open_topics || [];


        if (!topics.length) {

        container.textContent =
        "-";

        return;
        }


        container.innerHTML =
        topics
        .map(
        topic => {

        let html =
        `<div style="margin-bottom:15px;">`;


        html +=
        `<strong>${escapeHtml(topic.title || "")}</strong>`;


        if (topic.description) {

        html +=
        `<div style="color:#bbb;margin-top:5px;">
        ${escapeHtml(topic.description)}
        </div>`;
        }


        html +=
        `</div>`;


        return html;
        }
        )
        .join("");
        }


        /* =====================================================
        نمایش اسناد جلسه
        ===================================================== */

        function renderDocuments(meeting) {

        const accordion =
        document.getElementById(
        "documentsAccordion"
        );


        const container =
        document.getElementById(
        "documents"
        );


        const media =
        meeting.media || {};


        const audio =
        Array.isArray(media.audio)
        ? media.audio
        : [];


        const video =
        Array.isArray(media.video)
        ? media.video
        : [];


        const images =
        Array.isArray(media.images)
        ? media.images
        : [];


        if (
        !audio.length &&
        !video.length &&
        !images.length
        ) {

        accordion.style.display =
        "none";

        return;
        }


        accordion.style.display =
        "block";


        container.innerHTML =
        "";


        if (images.length) {

        const title =
        document.createElement(
        "div"
        );


        title.textContent =
        `تصاویر: ${toPersianDigits(images.length)} فایل`;


        container.appendChild(
        title
        );
        }


        if (video.length) {

        const title =
        document.createElement(
        "div"
        );


        title.textContent =
        `ویدئو: ${toPersianDigits(video.length)} فایل`;


        container.appendChild(
        title
        );
        }


        if (audio.length) {

        const title =
        document.createElement(
        "div"
        );


        title.textContent =
        `صوت: ${toPersianDigits(audio.length)} فایل`;


        container.appendChild(
        title
        );
        }
        }



        /* =====================================================
        هشتگ‌ها
        ===================================================== */

        function renderTags(meeting) {

        const container =
        document.getElementById(
        "tags"
        );


        container.innerHTML =
        "";


        const tags =
        meeting.tags || [];


        tags.forEach(
        tag => {

        const link =
        document.createElement(
        "a"
        );


        link.className =
        "tag";


        link.href =
        `tag_viewer.html?tag=${encodeURIComponent(tag)}`;


        link.textContent =
        `#${tag}`;


        container.appendChild(
        link
        );
        }
        );
        }



        



        /* =====================================================
        Accordion
        ===================================================== */

        function setupAccordions() {

        document
        .querySelectorAll(
        ".accordion"
        )
        .forEach(
        accordion => {

        const header =
        accordion.querySelector(
        ".accordion-header"
        );


        if (!header) {
        return;
        }


        header.addEventListener(
        "click",
        () => {

        accordion.classList.toggle(
        "open"
        );
        }
        );
        }
        );
        }