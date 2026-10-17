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

     data-email-check     email field: valid format, no spaces, and a duplicate check through
                          CARE.api.checkEmail({ email, excludeId }) -> { available: boolean }

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

  /* ---------- email: format + duplicate check ---------- */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var EMAIL_DOMAIN = "gmail.com"; // only Gmail addresses are accepted
  var EMAIL_BAD_MSG = "Email must be a Gmail address ending in @gmail.com.";
  function emailMsg(v) {
    if (v.indexOf("@") === -1) return "Add @gmail.com at the end. Only the username was entered.";
    return EMAIL_BAD_MSG;
  }
  function emailOk(v) { return EMAIL_RE.test(v) && v.toLowerCase().slice(-(EMAIL_DOMAIN.length + 1)) === "@" + EMAIL_DOMAIN && v.indexOf("@") === v.length - EMAIL_DOMAIN.length - 1; }
  var EMAIL_TAKEN_MSG = "This email is already used by another account.";

  function initEmail(input) {
    var form = input.form, seq = 0, timer, state = "idle"; // idle | bad | taken | free
    var excludeId = CARE.ui.param ? CARE.ui.param("id") : null;

    function set(s, text, kind) {
      state = s;
      input.classList.toggle("is-invalid", s === "bad" || s === "taken");
      message(input, text, kind);
    }
    function check() {
      var v = input.value.trim().toLowerCase();
      if (!v) { set("idle", ""); return; }
      if (!emailOk(v)) { set("bad", emailMsg(v)); return; }
      var mine = ++seq;
      CARE.api.checkEmail({ email: v, excludeId: excludeId || undefined }).then(function (res) {
        if (mine !== seq) return;
        if (res && res.available === false) set("taken", EMAIL_TAKEN_MSG);
        else set("idle", "");
      }, function () { if (mine === seq) set("idle", ""); });
    }

    input.addEventListener("input", function () {
      var v = input.value;
      if (/\s/.test(v)) { input.value = v.replace(/\s+/g, ""); }
      seq++; state = "idle"; input.classList.remove("is-invalid"); message(input, "");
      clearTimeout(timer); timer = setTimeout(check, 500);
    });
    input.addEventListener("blur", function () { clearTimeout(timer); if (state === "idle") check(); });

    if (form) form.addEventListener("submit", function (e) {
      var v = input.value.trim();
      if (v && !emailOk(v)) set("bad", emailMsg(v));
      if (state === "taken" || state === "bad") {
        e.preventDefault(); e.stopImmediatePropagation(); input.focus();
        var err = document.getElementById("form-error");
        if (err) err.textContent = state === "taken" ? EMAIL_TAKEN_MSG : emailMsg(v);
      }
    });
    input._careEmail = { markTaken: function () { set("taken", EMAIL_TAKEN_MSG); } };
  }

  /* A create/update failed: if it was a duplicate username, show it on the field. */
  V.serverError = function (err, usernameInput, errorEl, emailInput) {
    if (err && err.code === "EMAIL_TAKEN" && emailInput) {
      if (emailInput._careEmail) emailInput._careEmail.markTaken();
      if (errorEl) errorEl.textContent = EMAIL_TAKEN_MSG;
      emailInput.focus();
      return true;
    }
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
    Array.prototype.forEach.call(document.querySelectorAll("[data-email-check]"), initEmail);
  });

  CARE.validate = V;
})();
