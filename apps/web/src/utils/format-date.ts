export function formatDate(
    date: string | Date,
    locale = "en-PH"
) {
    return new Intl.DateTimeFormat(locale, {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(date));
}



export function formatDateTime(
    value: string | Date | null | undefined
): string {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    const formattedDate = date.toLocaleDateString("en-US", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const formattedTime = date.toLocaleTimeString("en-US", {
        timeZone: "Asia/Manila",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    }).toLowerCase();

    return `${formattedDate} | ${formattedTime}`;
}