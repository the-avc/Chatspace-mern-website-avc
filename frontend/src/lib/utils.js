export function formatTimestamp(timestamp) {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    // Format time
    const timeString = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    // Return time only for today, date + time for older messages
    return isToday ? timeString : `${date.toLocaleDateString('en-US')} ${timeString}`;
}