/* ==========================================================================
   CARE – api.js   (BACK END HOOK – intentionally blank)
   --------------------------------------------------------------------------
   Every page talks to the server ONLY through CARE.api.<method>(...).
   Each method returns a Promise. Until the back end exists they all reject
   with { code: "NOT_CONNECTED" }, and the pages show an empty state.

   To connect the back end, replace the body of CARE.api.request() with a
   real call (fetch / axios / etc.) – nothing else in the front end changes.

   request(name, payload) receives the method name and its payload and must
   resolve with the data described below.

   ---- Data shapes the pages expect ------------------------------------
   user      { name, code, role: "sqrt"|"clinic"|"admin" }        e.g. code "SQRT-014"
   student   { id, studentId, firstName, lastName, programCode, programName,
               block, yearLevel, allergies, conditions, pastTreatments,
               emergencyContact, updatedAt }
   report    { id, code, type:"full"|"quick", status:"pending"|"reviewed"|"resolved",
               student:{ id, studentId, firstName, lastName, programName, block, yearLevel },
               location, reason, observed, actions, intervention, notes,
               referred:true|false, occurredAt, submittedBy:{ name, code },
               assessment: null | { text, by, at } }
   account   { id, accountId, firstName, lastName, username, email, role,
               department, status:"active"|"inactive", lastSignIn, createdAt }
   logEntry  { at, user, role, action, student: null | { name, studentId }, result:"success"|"failed" }
   Dates are ISO-8601 strings.
   ========================================================================== */
(function () {
  function notConnected(name) {
    var err = new Error("The server is not connected yet.");
    err.code = "NOT_CONNECTED";
    err.method = name;
    return err;
  }

  /* >>> BACK END: implement this single function. <<< */
  function request(name, payload) {
    return Promise.reject(notConnected(name));
  }

  var api = { request: request };

  [
    /* auth */
    "signIn",               // { role, username, password } -> { user, mustChangePassword }
    "signOut",              // () -> void
    "setPassword",          // { password, token? } -> void
    /* lookups for dropdowns */
    "getPrograms",          // () -> [{ code, name }]
    "getBlocks",            // () -> [string]
    "getDepartments",       // () -> [string]
    "getNextStudentId",     // () -> string
    /* SQRT */
    "getSqrtDashboard",     // () -> { pendingCount, pendingCodes:[string], recentReports:[report] }
    "searchStudents",       // { q, program, block, year, sort } -> { total, students:[student] }
    "getStudent",           // { id } -> student & { reports:[report] }   (also logs the view)
    "submitReport",         // report fields -> report
    "submitQuickReport",    // quick fields -> report
    "listReports",          // { sort } -> [report]
    "getReport",            // { id } -> report
    /* Clinic */
    "getClinicDashboard",   // () -> { recordCount, pendingCount, recentReports:[report] }
    "createStudent",        // student fields -> student
    "updateStudent",        // { id, ...fields } -> student
    "saveAssessment",       // { reportId, text } -> report   (marks it resolved)
    /* Admin */
    "getAdminDashboard",    // () -> { accountCount, activeCount, sqrtCount, clinicCount, logCount, failedCount, recent:[logEntry] }
    "checkUsername",        // { username, excludeId? } -> { available: boolean }   (false when another account already uses it)
    "listAccounts",         // { q, role, status } -> { total, accounts:[account] }
    "getAccount",           // { id } -> account & { activity:[logEntry] }
    "createAccount",        // account fields + password -> account
    "updateAccount",        // { id, ...fields } -> account
    "setAccountStatus",     // { id, status } -> account
    "listLogs"              // { q, role, action, result } -> { total, entries:[logEntry] }
  ].forEach(function (name) {
    api[name] = function (payload) { return api.request(name, payload || {}); };
  });

  CARE.api = api;
})();
