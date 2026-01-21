export function formatTime(dateLike: Date | string | number | null | undefined): string {
    if (dateLike == null) return "";

    const date = dateLike instanceof Date ? dateLike : new Date(dateLike);
    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
    }).format(date);
}

export function formatDateTime(dateLike: Date | string | number | null | undefined): string {
    if (dateLike == null) return "";

    const date = dateLike instanceof Date ? dateLike : new Date(dateLike);
    if (Number.isNaN(date.getTime())) return "";

    const datePart = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });

    const timePart = formatTime(date);
    if (!timePart) return datePart;

    return `${datePart} ${timePart}`;
}
