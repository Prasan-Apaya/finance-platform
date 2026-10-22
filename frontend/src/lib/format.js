import { format, formatDistanceToNowStrict, parseISO, startOfMonth, endOfMonth, subMonths, addMonths, isSameMonth, isBefore } from 'date-fns';

export const CURRENCY = 'INR';
export const LOCALE = 'en-IN';

export function formatCurrency(value) {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: CURRENCY,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCompactCurrency(value) {
  if (value === null || value === undefined) return '₹0';
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 10000000) {
    return `${sign}₹${(abs / 10000000).toFixed(1)}Cr`;
  }
  if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(1)}L`;
  }
  if (abs >= 1000) {
    return `${sign}₹${(abs / 1000).toFixed(1)}K`;
  }
  return `${sign}₹${abs.toFixed(0)}`;
}

export function formatMonth(yyyyMm) {
  const [year, month] = yyyyMm.split('-').map(Number);
  return format(new Date(year, month - 1, 1), 'MMMM yyyy');
}

export function formatShortMonth(yyyyMm) {
  const [year, month] = yyyyMm.split('-').map(Number);
  return format(new Date(year, month - 1, 1), 'MMM');
}

export function formatDate(isoString) {
  if (!isoString) return '-';
  return format(parseISO(isoString), 'dd MMM yyyy');
}

export function getCurrentMonth() {
  return format(new Date(), 'yyyy-MM');
}

export function getPreviousMonth(yyyyMm) {
  const [year, month] = yyyyMm.split('-').map(Number);
  return format(subMonths(new Date(year, month - 1, 1), 1), 'yyyy-MM');
}

export function getNextMonth(yyyyMm) {
  const [year, month] = yyyyMm.split('-').map(Number);
  return format(addMonths(new Date(year, month - 1, 1), 1), 'yyyy-MM');
}

export function isCurrentMonthOrLater(yyyyMm) {
  const current = getCurrentMonth();
  return yyyyMm >= current;
}