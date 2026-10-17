# CARE – Campus Assistance & Response Environment (front end)

Plain HTML + CSS + JavaScript. No build step, no libraries. Open `index.html`
(or serve the folder with VS Code Live Server). The back end is intentionally blank.

```
care-frontend/
├─ index.html            → redirects to html/sign-in.html
├─ html/                 29 pages (one file per screen)
├─ css/
│  ├─ shared/            base, layout, components, + layouts reused by several pages
│  └─ pages/             one CSS file per page (same name as the page)
├─ js/
│  ├─ shared/            config, icons, session, api, ui, layout (sidebar), views
│  └─ pages/             one JS file per page (same name as the page)
└─ img/                  campus-building.jpg (sign-in photo)
```

## Pages (29)
Sign-in: sign-in, admin-sign-in, new-password, password-saved
SQRT: sqrt-dashboard, sqrt-student-search, sqrt-student-record, sqrt-new-rescue-report,
      sqrt-quick-rescue-report, sqrt-report-submitted, sqrt-rescue-reports, sqrt-rescue-report-detail
Clinic: clinic-dashboard, clinic-sqrt-rescue-reports, clinic-rescue-report-detail,
        clinic-student-records, clinic-add-student-record, clinic-student-record-created,
        clinic-student-record, clinic-edit-student-record
Admin: admin-dashboard, admin-user-accounts, admin-add-account, admin-account-detail,
       admin-edit-account, admin-deactivate-account, admin-account-deactivated,
       admin-reactivate-account, admin-access-logs

Every page loads `css/pages/<name>.css` and `js/pages/<name>.js`. Pages link to each
other through `CARE.url("pageKey", {id})` – all file names live in `js/shared/config.js`.

## Connecting the back end
All server calls go through `js/shared/api.js`. Every method (signIn, searchStudents,
getReport, createAccount, …) returns a Promise. Replace the body of `CARE.api.request(name, payload)`
with your real call (fetch/axios). The expected data shapes are documented at the top of that file.
Until then every page shows its empty state and a "server is not connected" notice.

Set `REQUIRE_AUTH: true` in `js/shared/config.js` once real sessions exist; pages then
redirect to sign-in when nobody is signed in. While it is `false` every page opens directly.

## What was cleaned from the Figma
- All sample people, IDs, reports, dates and counts removed (lists render empty until data arrives).
- Typos fixed: "Open reocrd", "Add student secord", "Official reocrd", "SQR-014", "Sign in  again".
- Sidebar label is "Search" on every SQRT page (the design mixed "Search" / "Student search").
- Account page shows "Reactivate" (not "Deactivate") when the account is inactive.

## Responsive / mobile
`css/shared/responsive.css` (linked last on every page) handles all screen sizes.
- 1100px and below: the sidebar becomes a slide-in drawer opened by the 3-line menu button in the header (built by `js/shared/layout.js`).
- 900px and below: tables become stacked cards (column titles are copied onto each cell by `layout.js`).
- 600px and below: single column layouts and full-width buttons.

## Field rules (`js/shared/validate.js`)
- `data-no-digits` on a text input blocks numbers (used on every first/last name field).
- `data-username-check` on the username input limits it to a-z, 0-9, `.` `_` `-`, and checks for duplicates through `CARE.api.checkUsername({ username, excludeId })` -> `{ available: boolean }`. The form will not submit while the name is taken. If create/update fails with error code `USERNAME_TAKEN`, the form shows the same message.
- To apply either rule to another field, add the attribute to the input and load `validate.js`.

## Forgot password
`html/forgot-password.html` (30th page) asks for the username and calls `CARE.api.requestPasswordReset({ username })`. The back end should notify the clinic/admin, who issue a temporary password; the user then signs in with it and lands on `new-password.html`. The reply must be the same whether or not the username exists.
