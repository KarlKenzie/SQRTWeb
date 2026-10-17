/* ==========================================================================
   CARE – config.js
   Global settings + the page map. Every page links to another page through
   CARE.url('page-key', { id: 123 }) so file names live in ONE place.
   ========================================================================== */
window.CARE = window.CARE || {};

CARE.config = {
  /* Set to true once the back end issues real sessions. While false, every
     page can be opened directly so the front end can be built and reviewed. */
  REQUIRE_AUTH: false,
  /* Anything the back end needs as a base URL goes here. */
  API_BASE: ""
};

CARE.pages = {
  signIn:               "sign-in.html",
  adminSignIn:          "admin-sign-in.html",
  newPassword:          "new-password.html",
  forgotPassword:       "forgot-password.html",
  passwordSaved:        "password-saved.html",

  sqrtDashboard:        "sqrt-dashboard.html",
  sqrtStudentSearch:    "sqrt-student-search.html",
  sqrtStudentRecord:    "sqrt-student-record.html",
  sqrtNewRescueReport:  "sqrt-new-rescue-report.html",
  sqrtQuickRescueReport:"sqrt-quick-rescue-report.html",
  sqrtReportSubmitted:  "sqrt-report-submitted.html",
  sqrtRescueReports:    "sqrt-rescue-reports.html",
  sqrtRescueReportDetail:"sqrt-rescue-report-detail.html",

  clinicDashboard:      "clinic-dashboard.html",
  clinicSqrtRescueReports:"clinic-sqrt-rescue-reports.html",
  clinicRescueReportDetail:"clinic-rescue-report-detail.html",
  clinicStudentRecords: "clinic-student-records.html",
  clinicAddStudentRecord:"clinic-add-student-record.html",
  clinicStudentRecordCreated:"clinic-student-record-created.html",
  clinicStudentRecord:  "clinic-student-record.html",
  clinicEditStudentRecord:"clinic-edit-student-record.html",

  adminDashboard:       "admin-dashboard.html",
  adminUserAccounts:    "admin-user-accounts.html",
  adminAddAccount:      "admin-add-account.html",
  adminAccountDetail:   "admin-account-detail.html",
  adminEditAccount:     "admin-edit-account.html",
  adminDeactivateAccount:"admin-deactivate-account.html",
  adminAccountDeactivated:"admin-account-deactivated.html",
  adminReactivateAccount:"admin-reactivate-account.html",
  adminAccessLogs:      "admin-access-logs.html"
};

/* Where each role lands after signing in. */
CARE.home = {
  sqrt: "sqrtDashboard",
  clinic: "clinicDashboard",
  admin: "adminDashboard"
};

/* Fixed choices (not data): they are part of how the system works. */
CARE.enums = {
  yearLevels: ["1st year", "2nd year", "3rd year", "4th year"],
  roles: [
    { value: "sqrt",   label: "SQRT" },
    { value: "clinic", label: "Clinic" },
    { value: "admin",  label: "Admin" }
  ],
  accountStatus: [
    { value: "active",   label: "Active" },
    { value: "inactive", label: "Inactive" }
  ],
  yesNo: [
    { value: "yes", label: "Yes" },
    { value: "no",  label: "No" }
  ],
  reportStatus: {
    pending:  "Pending Clinic Review",
    reviewed: "Reviewed",
    resolved: "Resolved"
  },
  logActions: [
    "Signed in", "Sign-in attempt", "Searched students", "Viewed record",
    "Submitted rescue report", "Added student record", "Updated medical record",
    "Added clinic assessment", "Created user account", "Updated user account",
    "Deactivated user account", "Reactivated user account"
  ],
  logResults: [
    { value: "success", label: "Success" },
    { value: "failed",  label: "Failed" }
  ],
  reportStatusShort: { pending: "Pending" },
  reportSort: [
    { value: "pending-first", label: "Pending first" },
    { value: "newest",        label: "Newest first" },
    { value: "oldest",        label: "Oldest first" }
  ],
  studentSort: [
    { value: "last-az", label: "Last Name A-Z" },
    { value: "last-za", label: "Last Name Z-A" },
    { value: "id",      label: "Student ID" }
  ]
};

CARE.url = function (key, params) {
  var file = CARE.pages[key] || key;
  var qs = "";
  if (params) {
    var parts = [];
    Object.keys(params).forEach(function (k) {
      if (params[k] !== undefined && params[k] !== null && params[k] !== "") {
        parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(params[k]));
      }
    });
    if (parts.length) qs = "?" + parts.join("&");
  }
  return file + qs;
};
CARE.go = function (key, params) { window.location.href = CARE.url(key, params); };
