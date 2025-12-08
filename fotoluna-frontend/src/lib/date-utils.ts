import {
    isToday as isTodayFns,
    isThisWeek as isThisWeekFns,
    isFuture as isFutureFns,
    startOfWeek,
    isThisMonth as isThisMonthFns,
    isSameDay as isSameDayFns,
    isWithinInterval as isWithinIntervalFns,
    startOfMonth,
    endOfMonth,
    parseISO, // Import parseISO to handle ISO 8601 strings
} from 'date-fns';

/**
 * Checks if a date is today.
 * @param date The date to check.
 * @returns True if the date is today, false otherwise.
 */
export const isToday = (date: Date): boolean => {
    return isTodayFns(date);
};

/**
 * Checks if a date is within the current week (starting on Sunday).
 * @param date The date to check.
 * @returns True if the date is in the current week, false otherwise.
 */
export const isThisWeek = (date: Date): boolean => {
    // isThisWeekFns considers the week to start on Sunday by default.
    // If your week starts on Monday, you might need extra options:
    // return isThisWeekFns(date, { weekStartsOn: 1 });
    return isThisWeekFns(date);
};

/**
 * Checks if a date is in the future.
 * @param date The date to check.
 * @returns True if the date is in the future, false otherwise.
 */
export const isFuture = (date: Date): boolean => {
    return isFutureFns(date);
};

/**
 * Checks if a date is within the current month.
 * @param date The date to check.
 * @returns True if the date is in the current month, false otherwise.
 */
export const isThisMonth = (date: Date): boolean => {
    return isThisMonthFns(date);
};

/**
 * Checks if two dates are the same day.
 * @param date1 The first date to compare.
 * @param date2 The second date to compare.
 * @returns True if the dates are the same day, false otherwise.
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
    return isSameDayFns(date1, date2);
};

/**
 * Checks if a date is within a given interval.
 * @param date The date to check.
 * @param start The start of the interval.
 * @param end The end of the interval.
 * @returns True if the date is within the interval, false otherwise.
 */
export const isWithinInterval = (date: Date, start: Date, end: Date): boolean => {
    return isWithinIntervalFns(date, { start, end });
};

export { startOfMonth, endOfMonth, parseISO };
