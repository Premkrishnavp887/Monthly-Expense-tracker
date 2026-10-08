/**
 * Date Utilities for Monthly Budget Cycles
 * Month ID format: "YYYY-MM" (e.g. "2026-10")
 */

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const SHORT_MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * Returns current month ID in "YYYY-MM" format.
 */
export function getCurrentMonthId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Formats "YYYY-MM" to "October 2026"
 */
export function formatMonthYear(monthId: string): string {
  if (!monthId || !monthId.includes('-')) return monthId;
  const [yearStr, monthStr] = monthId.split('-');
  const monthIndex = parseInt(monthStr, 10) - 1;
  if (isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) return monthId;
  return `${MONTH_NAMES[monthIndex]} ${yearStr}`;
}

/**
 * Gets previous month ID "YYYY-MM"
 */
export function getPrevMonthId(monthId: string): string {
  const [yearStr, monthStr] = monthId.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10) - 1;

  if (month < 1) {
    month = 12;
    year -= 1;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}

/**
 * Gets next month ID "YYYY-MM"
 */
export function getNextMonthId(monthId: string): string {
  const [yearStr, monthStr] = monthId.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10) + 1;

  if (month > 12) {
    month = 1;
    year += 1;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}

/**
 * Returns ISO date string YYYY-MM-DD
 */
export function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats ISO date string "2026-10-07" to "7 Oct 2026" or "Today, 7 Oct 2026"
 */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;

  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const formatted = `${day} ${SHORT_MONTH_NAMES[monthIdx] || ''} ${year}`;
  const today = getTodayIsoDate();

  if (dateStr === today) {
    return `Today, ${day} ${SHORT_MONTH_NAMES[monthIdx] || ''} ${year}`;
  }

  return formatted;
}
