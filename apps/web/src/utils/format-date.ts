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


