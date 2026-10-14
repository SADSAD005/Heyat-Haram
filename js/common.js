/* =====================================================
HTML Escape
===================================================== */

function escapeHtml(value) {

if (
value === null ||
value === undefined
) {
return "";
}

return String(value)
.replace(
/&/g,
"&amp;"
)
.replace(
/</g,
"&lt;"
)
.replace(
/>/g,
"&gt;"
)
.replace(
/"/g,
"&quot;"
)
.replace(
/'/g,
"&#039;"
);
}



/* =====================================================
اعداد فارسی
===================================================== */

function toPersianDigits(value) {

if (
value === null ||
value === undefined
) {
return "";
}

return String(value).replace(
/\d/g,
digit => "۰۱۲۳۴۵۶۷۸۹"[digit]
);
}



/* =====================================================
پیدا کردن عضو
===================================================== */

function getMember(memberId, members) {

return members.find(
member =>
member.id === memberId
);
}



/* =====================================================
لینک عضو
===================================================== */

function createMemberLink(member) {

const link =
document.createElement("a");

link.className =
"member-link";

link.href =
`member_viewer.html?id=${encodeURIComponent(member.id)}`;

link.textContent =
member.display_name ||
`${member.name || ""} ${member.family_name || ""}`.trim();

return link;
}
