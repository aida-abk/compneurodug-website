/**
 * CompNeuro DUG — events feed for browncompneuro.com
 *
 * Bound to the Google Sheet that collects the "Add an event" form responses.
 * Does two jobs:
 *   1. Serves the events as JSON (deployed as a web app). The website reads
 *      this at build time, so the sheet itself never has to be public.
 *   2. Asks Vercel to rebuild the site when the form is submitted, when the
 *      sheet is edited, and once a day (so past events move to the archive).
 *
 * Setup: see docs/publishing-events.md in the website repository.
 */

const TIMEZONE = 'America/New_York';

// Form question titles = sheet column headers. Change both together.
const COLUMNS = {
  title: 'Event title',
  date: 'Date',
  start: 'Start time',
  end: 'End time',
  location: 'Location',
  type: 'Event type',
  summary: 'One-line summary',
  description: 'Description',
  rsvp: 'RSVP link',
  link: 'Event page link',
  status: 'Status', // Added by hand: blank = live, "Draft" = preview only, "Hidden" = off the site
};

const REBUILD_HANDLER = 'runQueuedRebuild';
const REBUILD_DELAY_MS = 2 * 60 * 1000; // batch edits made within two minutes

// ---------------------------------------------------------------------------
// 1. JSON feed
// ---------------------------------------------------------------------------

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({ events: readEvents() })).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function readEvents() {
  const sheet = getResponsesSheet();
  // Display values ("10/21/2026", "5:00:00 PM") avoid Sheets' time-only
  // Date quirks; the spreadsheet locale must be United States.
  const rows = sheet.getDataRange().getDisplayValues();
  const header = rows.shift().map((h) => String(h).trim().toLowerCase());
  const col = {};
  Object.keys(COLUMNS).forEach((key) => {
    col[key] = header.indexOf(COLUMNS[key].toLowerCase());
  });
  const get = (row, key) => (col[key] >= 0 ? String(row[col[key]] || '').trim() : '');

  const events = [];
  rows.forEach((row, i) => {
    const title = get(row, 'title');
    const status = get(row, 'status').toLowerCase();
    if (!title || status === 'hidden') return;

    const day = parseUsDate(get(row, 'date'));
    const start = parseTime(get(row, 'start'));
    if (!day || !start) return; // Unreadable date or time: skip rather than guess.
    const end = parseTime(get(row, 'end'));

    events.push({
      row: i + 2,
      title: title,
      start: toIso(day, start),
      end: end ? toIso(day, end) : null,
      location: get(row, 'location'),
      type: get(row, 'type'),
      summary: get(row, 'summary'),
      description: get(row, 'description'),
      rsvp: get(row, 'rsvp'),
      link: get(row, 'link'),
      draft: status === 'draft',
    });
  });
  return events;
}

/** "10/21/2026" or "2026-10-21" → { y, m, d } */
function parseUsDate(text) {
  let match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text);
  if (match) return { y: +match[3], m: +match[1], d: +match[2] };
  match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (match) return { y: +match[1], m: +match[2], d: +match[3] };
  return null;
}

/** "5:00:00 PM", "5:00 PM", "17:00" → { h, min } */
function parseTime(text) {
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?\s*([AaPp][Mm])?$/.exec(text);
  if (!match) return null;
  let h = +match[1];
  const meridiem = (match[3] || '').toUpperCase();
  if (meridiem === 'PM' && h < 12) h += 12;
  if (meridiem === 'AM' && h === 12) h = 0;
  return { h: h, min: +match[2] };
}

/** Wall-clock time in Providence → "2026-10-21T17:00:00-04:00" (DST-aware). */
function toIso(day, time) {
  // Script time zone is America/New_York (appsscript.json), so this Date
  // is constructed in Eastern time.
  const date = new Date(day.y, day.m - 1, day.d, time.h, time.min);
  return Utilities.formatDate(date, TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX");
}

function getResponsesSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  return spreadsheet.getSheets().find((s) => s.getFormUrl()) || spreadsheet.getSheets()[0];
}

// ---------------------------------------------------------------------------
// 2. Rebuilds
// ---------------------------------------------------------------------------

/** Run once from the editor. Creates the form, edit and daily triggers. */
function setup() {
  ScriptApp.getProjectTriggers().forEach((t) => ScriptApp.deleteTrigger(t));
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  ScriptApp.newTrigger('onEventSubmitted').forSpreadsheet(spreadsheet).onFormSubmit().create();
  ScriptApp.newTrigger('onSheetEdited').forSpreadsheet(spreadsheet).onEdit().create();
  ScriptApp.newTrigger('rebuildNow').timeBased().everyDays(1).atHour(4).inTimezone(TIMEZONE).create();
  Logger.log('Triggers created. Now run testRebuild to check the deploy hook.');
}

function onEventSubmitted() {
  queueRebuild();
}

function onSheetEdited() {
  queueRebuild();
}

/** Several edits in a row cause one rebuild, two minutes after the first. */
function queueRebuild() {
  const pending = ScriptApp.getProjectTriggers().some((t) => t.getHandlerFunction() === REBUILD_HANDLER);
  if (pending) return;
  ScriptApp.newTrigger(REBUILD_HANDLER).timeBased().after(REBUILD_DELAY_MS).create();
}

function runQueuedRebuild() {
  ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === REBUILD_HANDLER)
    .forEach((t) => ScriptApp.deleteTrigger(t));
  rebuildNow();
}

function rebuildNow() {
  const hook = PropertiesService.getScriptProperties().getProperty('VERCEL_DEPLOY_HOOK');
  if (!hook) throw new Error('Set the VERCEL_DEPLOY_HOOK script property (Project Settings → Script properties).');
  const response = UrlFetchApp.fetch(hook, { method: 'post', muteHttpExceptions: true });
  Logger.log('Vercel responded ' + response.getResponseCode());
}

/** Run from the editor to check the setup end to end. */
function testRebuild() {
  Logger.log(JSON.stringify(readEvents(), null, 2));
  rebuildNow();
}
