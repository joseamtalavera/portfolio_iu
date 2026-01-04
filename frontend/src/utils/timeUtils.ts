/**
 * Converts a time string to minutes
 * @param timeStr is a time string in in format "HH:MM" or "HH:MM:SS"
 * @returns Number of minutes since midnight
 */

export const parseTimeToMinutes = (timeStr: string): number => {
    const parts = timeStr.split(':').map(Number);
    return parts[0] * 60 + (parts[1] || 0); // Ignore seconds if present
};