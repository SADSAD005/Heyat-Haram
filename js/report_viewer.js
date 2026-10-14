        /* =====================================================
        مدت زمان
        ===================================================== */

        function formatDuration(totalMinutes) {

        totalMinutes =
        Math.max(
        0,
        Number(totalMinutes) || 0
        );


        const hours =
        Math.floor(
        totalMinutes / 60
        );


        const minutes =
        totalMinutes % 60;


        if (hours === 0) {

        return `${toPersianDigits(minutes)} دقیقه`;
        }


        if (minutes === 0) {

        return `${toPersianDigits(hours)} ساعت`;
        }


        return `${toPersianDigits(hours)} ساعت و ${toPersianDigits(minutes)} دقیقه`;
        }



        /* =====================================================
        اختلاف ساعت
        ===================================================== */

        function timeDifference(start, end) {

        if (!start || !end) {
        return 0;
        }


        const [
        startHour,
        startMinute
        ] =
        start
        .split(":")
        .map(Number);


        const [
        endHour,
        endMinute
        ] =
        end
        .split(":")
        .map(Number);


        const startTotal =
        startHour * 60 +
        startMinute;


        const endTotal =
        endHour * 60 +
        endMinute;


        let difference =
        endTotal -
        startTotal;


        if (difference < 0) {
        difference += 24 * 60;
        }


        return difference;
        }





        /* =====================================================
        بارگذاری جلسه
        ===================================================== */

/* =====================================================
   بارگذاری جلسه از Supabase
   ===================================================== */

async function loadMeeting() {
    if (!meetingId) {
        document.getElementById("meetingTitle").textContent =
            "شناسه جلسه مشخص نشده است.";
        return;
    }

    try {
        if (!window.supabase || !window.supabase.createClient) {
            throw new Error("کتابخانه Supabase بارگذاری نشده است.");
        }

        if (typeof supabaseClient === "undefined") {
            throw new Error("اتصال Supabase در دسترس نیست.");
        }

        const [meetingResult, membersResponse] = await Promise.all([
            supabaseClient
                .from("meetings")
                .select("id, data")
                .eq("id", meetingId)
                .maybeSingle(),

            fetch("data/members.json")
        ]);

        if (meetingResult.error) {
            throw meetingResult.error;
        }

        if (!meetingResult.data) {
            throw new Error("گزارش جلسه در Supabase پیدا نشد.");
        }

        if (!membersResponse.ok) {
            throw new Error("فایل اعضا پیدا نشد.");
        }

        const meeting = {
            ...meetingResult.data.data,
            id: meetingResult.data.id
        };

        const membersData = await membersResponse.json();
        const members = membersData.members || [];

        /* عنوان جلسه */
        let meetingNumber = meeting.id
            ? meeting.id.replace("meeting-", "")
            : "";

        const parsedMeetingNumber = parseInt(meetingNumber, 10);

        meetingNumber = Number.isNaN(parsedMeetingNumber)
            ? ""
            : String(parsedMeetingNumber);

        const meetingTitle =
            meeting.name && meeting.name.trim() !== ""
                ? meeting.name.trim()
                : `جلسه شماره ${toPersianDigits(meetingNumber)}`;

        document.getElementById("meetingTitle").textContent =
            meetingTitle;

        /* تاریخ هدر */
        document.getElementById("meetingDate").textContent =
            toPersianDigits(meeting.datetime?.date_solar || "-");

        /* تاریخ و زمان */
        document.getElementById("solarDate").textContent =
            toPersianDigits(meeting.datetime?.date_solar || "-");

        document.getElementById("lunarDate").textContent =
            toPersianDigits(meeting.datetime?.date_lunar || "-");

        document.getElementById("startTime").textContent =
            toPersianDigits(meeting.datetime?.start_time || "-");

        document.getElementById("endTime").textContent =
            toPersianDigits(meeting.datetime?.end_time || "-");

        /* مدت جلسه */
        const totalDuration = timeDifference(
            meeting.datetime?.start_time,
            meeting.datetime?.end_time
        );

        document.getElementById("totalDuration").textContent =
            formatDuration(totalDuration);

        /* مدت مفید */
        const interruptionMinutes = Number(
            meeting.datetime?.total_interruption_minutes || 0
        );

        const usefulDuration = Math.max(
            0,
            totalDuration - interruptionMinutes
        );

        document.getElementById("usefulDuration").textContent =
            formatDuration(usefulDuration);

        /* اطلاعات جلسه */
        renderTopics(meeting);

        document.getElementById("description").textContent =
            meeting.description || "-";

        document.getElementById("minutes").textContent =
            meeting.minutes || "-";

        renderModerator(meeting, members);
        renderAttendees(meeting, members);
        renderSecretary(meeting, members);
        renderOpenTopics(meeting);

        /* تکالیف: شناسه‌ها از جلسه خوانده می‌شوند */
        await renderTasks(meeting, members);

        /* اسناد */
        renderDocuments(meeting);

        /* تگ‌ها */
        renderTags(meeting);

        /* آکاردئون‌ها */
        setupAccordions();

    } catch (error) {
        console.error("خطا در بارگذاری گزارش جلسه:", error);

        document.getElementById("meetingTitle").textContent =
            "خطا در بارگذاری گزارش جلسه";

        document.getElementById("description").textContent =
            error.message || "خطای نامشخصی رخ داده است.";
    }
}







                /* =====================================================
        گرفتن شناسه جلسه از URL
        ===================================================== */

        const params =
        new URLSearchParams(
        window.location.search
        );


        const meetingId =
        params.get("id");






        /* =====================================================
        شروع
        ===================================================== */

        loadMeeting();