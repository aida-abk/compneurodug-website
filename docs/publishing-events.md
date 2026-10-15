# Publishing events

Events reach the website through a Google Form. A co-leader fills in the form, the answer lands in a Google Sheet, and the site rebuilds itself about three minutes later.

```
Google Form → Google Sheet → Apps Script feed → Vercel rebuild → browncompneuro.com
```

- **Everyday use** (any co-leader): the first section below.
- **One-time setup** (Aida, or whoever maintains the site): the second section.

---

## Everyday use

### Add an event

1. Open the **Add an event** form (bookmark it; only DUG leaders have the link).
2. Fill it in and submit.
3. The event appears on the homepage and on [/events](https://www.browncompneuro.com/events) about 3 minutes later.

Tips:

- **One-line summary** shows in lists. **Description** shows on the event's own page. In the description, a blank line starts a new paragraph, `**bold**` makes bold text and lines starting with `- ` become a list.
- Paste the full RSVP link, starting with `https://`. The site shows an RSVP button until the event is over.
- Times are Providence time. The site handles daylight saving.

### Change or remove an event

Open the **events sheet** (the form's responses) and edit the cell directly. The site rebuilds 2 minutes after your last edit.

The last column, **Status**, controls visibility:

| Status | What happens |
|---|---|
| *(empty)* | Live on the site |
| `Draft` | Only visible in the local preview (`npm run dev`), not on the live site |
| `Hidden` | Removed from the site. The row stays in the sheet. |

Don't rename columns or reorder the form questions: the site finds data by column name.

### When an event is over

Nothing to do. Past events move to the archive on [/events](https://www.browncompneuro.com/events) automatically (the site rebuilds every night at 4 AM).

### Something looks wrong

- **Event missing:** check the Status column, and that the date and start time are filled in. Rows with an unreadable date are skipped.
- **Nothing updates at all:** open the Apps Script (sheet → Extensions → Apps Script), run `testRebuild`, and read the log. Tell the site maintainer.

---

## One-time setup

Takes about 20 minutes. Do it from the Google account that should own the form (a DUG account is better than a personal one).

### 1. Create the form

Create a Google Form called **Add an event** with these questions. **Use these titles exactly** — the site looks them up by name.

| # | Question title | Type | Required |
|---|---|---|---|
| 1 | Event title | Short answer | Yes |
| 2 | Date | Date | Yes |
| 3 | Start time | Time | Yes |
| 4 | End time | Time | No |
| 5 | Location | Short answer | Yes |
| 6 | Event type | Dropdown: Speaker series, Journal club, Social, Workshop, Other | Yes |
| 7 | One-line summary | Short answer | Yes |
| 8 | Description | Paragraph | No |
| 9 | RSVP link | Short answer (Response validation → Text → URL) | No |
| 10 | Event page link | Short answer (Response validation → Text → URL) | No |

Form **Settings → Responses**:

- **Collect email addresses: Do not collect.** Nothing personal goes into the sheet.
- **Restrict to users in Brown University: On.**
- Share the form link only with DUG leaders.

### 2. Link the sheet

1. In the form: **Responses → Link to Sheets → Create a new spreadsheet**.
2. In the sheet: **File → Settings**. Set **Locale: United States** and **Time zone: (GMT-05:00) Eastern Time - New York**.
3. Add a header **Status** in the first empty column to the right of the form's columns.

### 3. Add the Apps Script

1. In the sheet: **Extensions → Apps Script**.
2. Replace the contents of `Code.gs` with [`google-apps-script/Code.gs`](../google-apps-script/Code.gs) from this repository.
3. **Project Settings (gear icon) → Show "appsscript.json" manifest file in editor: on.** Then replace `appsscript.json` with [`google-apps-script/appsscript.json`](../google-apps-script/appsscript.json).
4. Save.

### 4. Connect it to Vercel

1. In Vercel: **Project → Settings → Git → Deploy Hooks**. Create a hook named `events-form` for the `main` branch and copy its URL.
2. In Apps Script: **Project Settings → Script properties → Add**. Property `VERCEL_DEPLOY_HOOK`, value: the hook URL. (Keep this URL private: anyone with it can trigger rebuilds.)
3. In the editor, pick the `setup` function and click **Run**. Approve the permissions. This creates three triggers: on form submit, on sheet edit, and daily at 4 AM.
4. Pick `testRebuild` and click **Run**. The log shows the events as JSON and `Vercel responded 201`.

### 5. Publish the feed

1. In Apps Script: **Deploy → New deployment → Select type: Web app**.
2. **Execute as: Me**. **Who has access: Anyone**. Deploy and copy the **Web app URL**.
3. Open that URL in a private browser window. You should see `{"events":[…]}`.
4. In Vercel: **Project → Settings → Environment Variables**. Add `EVENTS_FEED_URL` with the web app URL, for Production and Preview. Redeploy once.

The feed only exposes the event fields listed above. The sheet itself stays private.

### 6. Move the existing Markdown event

Submit the Comp Neuro Welcome event through the form. The site prefers the form version of an event with the same date and title, so the Markdown copy stops showing. You can then delete `src/content/events/2026-10-21-comp-neuro-welcome.md`. Its page URL changes to `/events/2026-10-21-comp-neuro-welcome-with-prof-david-sheinberg`.

### If you change the script later

Edits to `Code.gs` only reach the live feed after **Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy**. The URL stays the same. Keep the copy in this repository in sync.

---

## How it works (for maintainers)

- `google-apps-script/Code.gs` reads the sheet's display values, converts date + time to ISO with the Eastern offset (DST-aware), drops `Hidden` rows and serves JSON. Its triggers call the Vercel deploy hook; edits within 2 minutes are batched into one rebuild.
- `src/lib/events-feed.ts` is an Astro content loader for the `formEvents` collection. It validates each row against the same schema as Markdown events, renders the description as Markdown and skips bad rows with a warning.
- `src/lib/events.ts` merges `formEvents` with Markdown `events`. Same day and title → the form version wins.
- If `EVENTS_FEED_URL` is set but unreachable, the production build fails on purpose, so Vercel keeps the last good deploy. If it's unset, only Markdown events are used.
- Markdown events (`src/content/events/*.md`) still work for anything the form can't express.
