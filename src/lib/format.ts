// Dates are shown in Providence time regardless of where the site is built.
const TZ = 'America/New_York';

export const formatDay = (d: Date) =>
  new Intl.DateTimeFormat('en-US', { day: '2-digit', timeZone: TZ }).format(d);

export const formatMonth = (d: Date) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: TZ }).format(d);

export const formatWeekdayTime = (d: Date) =>
  new Intl.DateTimeFormat('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit', timeZone: TZ }).format(d);

export const formatLongDate = (d: Date) =>
  new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: TZ }).format(d);

export const formatYear = (d: Date) => new Intl.DateTimeFormat('en-US', { year: 'numeric', timeZone: TZ }).format(d);
