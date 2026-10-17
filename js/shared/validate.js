/* ==========================================================================
   CARE – validate.js
   Field rules shared by the forms. Opt in with attributes in the HTML:

     data-no-digits       text field: numbers are not allowed (names etc.).
                          Digits are removed as the person types or pastes,
                          and a short message explains why.
     data-username-check  username field: only a-z, 0-9, "." "_" "-" allowed,
                          and the name is checked for duplicates through
                          CARE.api.checkUsername({ username, excludeId })
                              -> { available: boolean }
                          The form cannot be submitted while the name is taken.

   The server must still enforce both rules; it can answer a create/update
   with an error whose code is "USERNAME_TAKEN" and the form will show it.
   ========================================================================== */
(function () {
  var V = {};
  var TAKEN_MSG = "This username is not available. Try another one.";

  function fieldOf(input) { return input.closest(".field") || input.parentNode; }

  /* Permanent hint under the field. It is hidden while an error/status message is showing. */
  function addHint(input, text) {
    var host = fieldOf(input);
    var h = document.createElement("div");
    h.className = "field__hint"; h.setAttribute("data-hint-for", input.id); h.textContent = text;
    host.appendChild(h);
  }

  function message(input, text, kind) {
    var host = fieldOf(input);
    var el = host.querySelector(".field__error[data-for='" + input.id + "']");
    var hint = host.querySelector(".field__hint[data-hint-for='" + input.id + "']");
    if (hint) hint.hidden = !!text;
    if (!text) { if (el) el.remove(); return; }
    if (!el) {
      el = document.createElement("div");
      el.className = "field__error"; el.setAttribute("data-for", input.id); el.setAttribute("role", "alert");
      host.appendChild(el);
    }
    el.style.color = kind === "ok" ? "#1e7a46" : "";
    el.textContent = text;
  }

  /* ---------- numbers not allowed ---------- */
  function initNoDigits(input) {
    var timer;
    function clean() {
      var v = input.value;
      if (!/\d/.test(v)) return;
      var pos = input.selectionStart - (v.slice(0, input.selectionStart).match(/\d/g) || []).length;
      input.value = v.replace(/\d+/g, "");
      try { input.setSelectionRange(pos, pos); } catch (e) {}
      input.classList.add("is-invalid");
      message(input, "Numbers are not allowed in this field.");
      clearTimeout(timer);
      timer = setTimeout(function () { input.classList.remove("is-invalid"); message(input, ""); }, 2500);
    }
    addHint(input, "Letters only. Numbers are not allowed.");
    input.addEventListener("input", clean);
    input.addEventListener("blur", clean);
    input.setAttribute("inputmode", "text");
  }

  /* ---------- username: characters + duplicate check ---------- */
  function initUsername(input) {
    var form = input.form, seq = 0, timer, state = "idle"; // idle | checking | taken | free
    var excludeId = CARE.ui.param ? CARE.ui.param("id") : null;

    function set(s, text, kind) {
      state = s;
      input.classList.toggle("is-invalid", s === "taken");
      message(input, text, kind);
    }

    function check() {
      var name = input.value.trim().toLowerCase();
      if (!name) { set("idle", ""); return; }
      var mine = ++seq;
      set("checking", "");
      CARE.api.checkUsername({ username: name, excludeId: excludeId || undefined }).then(function (res) {
        if (mine !== seq) return;
        if (res && res.available === false) set("taken", TAKEN_MSG);
        else if (res && res.available === true) set("free", "Username is available.", "ok");
        else set("idle", "");
      }, function () {
        /* back end not connected / unreachable: no verdict, the server decides on save */
        if (mine === seq) set("idle", "");
      });
    }

    addHint(input, "No spaces. Must be unique.");
    input.addEventListener("input", function () {
      var v = input.value, clean = v.toLowerCase().replace(/[^a-z0-9._-]/g, "");
      if (clean !== v.toLowerCase()) {
        input.value = clean;
        input.classList.add("is-invalid");
        message(input, "Use letters, numbers, \".\" \"_\" or \"-\" only. No spaces.");
        setTimeout(function () { if (state !== "taken") { input.classList.remove("is-invalid"); message(input, ""); } }, 2500);
      } else if (v !== clean) { input.value = clean; }
      seq++; state = "idle"; message(input, "");
      clearTimeout(timer);
      timer = setTimeout(check, 450);
    });
    input.addEventListener("blur", function () { clearTimeout(timer); if (state === "idle") check(); });
    /* edit form fills the field from the server after load: do not flag the person's own name */

    if (form) form.addEventListener("submit", function (e) {
      if (state === "taken") {
        e.preventDefault(); e.stopImmediatePropagation();
        input.focus();
        var err = document.getElementById("form-error");
        if (err) err.textContent = TAKEN_MSG;
      }
    });

    input._careUsername = { markTaken: function () { set("taken", TAKEN_MSG); } };
  }

  /* A create/update failed: if it was a duplicate username, show it on the field. */
  V.serverError = function (err, usernameInput, errorEl) {
    if (err && err.code === "USERNAME_TAKEN" && usernameInput) {
      if (usernameInput._careUsername) usernameInput._careUsername.markTaken();
      if (errorEl) errorEl.textContent = TAKEN_MSG;
      usernameInput.focus();
      return true;
    }
    return false;
  };

  /* true when a value contains a digit (for page scripts that want to double-check) */
  V.hasDigits = function (s) { return /\d/.test(s || ""); };

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.forEach.call(document.querySelectorAll("[data-no-digits]"), initNoDigits);
    Array.prototype.forEach.call(document.querySelectorAll("[data-username-check]"), initUsername);
  });

  CARE.validate = V;
})();
