/* Sign in page (index.html) */
(function () {
  "use strict";

  var tabs = document.querySelectorAll(".tabs__btn");
  var form = document.getElementById("signin-form");
  var username = document.getElementById("username");
  var password = document.getElementById("password");
  var toggle = document.getElementById("toggle-pw");
  var submit = document.getElementById("submit");
  var message = document.getElementById("form-message");
  var forgot = document.getElementById("forgot");

  var role = "SQRT Responder";

  // Already signed in? Skip straight to the dashboard.
  CareApi.get("/api/me").then(function (r) {
    if (r.ok && r.data.redirect) location.replace(r.data.redirect);
  });

  // Coming back from "Password saved": prefill the username, focus password.
  var prefill = CareApi.flash.get("prefillUser");
  if (prefill) {
    username.value = prefill;
    CareApi.flash.clear("prefillUser");
    password.focus();
  }

  // ---- Role tabs ----
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        var active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", String(active));
      });
      role = tab.dataset.role;
      submit.textContent = "Sign in as " + role;
      showMessage("");
      clearError(username);
      clearError(password);
    });
  });

  // ---- Show / hide password ----
  toggle.addEventListener("click", function () {
    var show = password.type === "password";
    password.type = show ? "text" : "password";
    toggle.textContent = show ? "Hide" : "Show";
    toggle.setAttribute("aria-pressed", String(show));
    toggle.setAttribute("aria-label", show ? "Hide password" : "Show password");
  });

  // ---- Helpers ----
  function setError(input, text) {
    input.closest(".field").classList.add("has-error");
    document.getElementById(input.id + "-error").textContent = text;
  }
  function clearError(input) {
    input.closest(".field").classList.remove("has-error");
    document.getElementById(input.id + "-error").textContent = "";
  }
  function showMessage(text, isError) {
    message.textContent = text;
    message.classList.toggle("is-error", !!isError);
  }

  [username, password].forEach(function (input) {
    input.addEventListener("input", function () {
      clearError(input);
      showMessage("");
    });
  });

  // ---- Forgot password: remember who is asking, then follow the link ----
  forgot.addEventListener("click", function () {
    CareApi.flash.set("resetUser", username.value.trim());
  });

  // ---- Submit ----
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;

    if (!username.value.trim()) { setError(username, "Enter your username."); ok = false; }
    if (!password.value) { setError(password, "Enter your password."); ok = false; }
    if (!ok) {
      (username.value.trim() ? password : username).focus();
      return;
    }

    submit.disabled = true;
    showMessage("Signing in…");

    CareApi.post("/api/login", {
      role: role,
      username: username.value.trim(),
      password: password.value
    }).then(function (r) {
      if (r.ok) {
        location.href = r.data.redirect;
        return;
      }
      submit.disabled = false;
      password.value = "";
      password.focus();
      showMessage(r.data.error || "Could not sign in. Please try again.", true);
    });
  });
})();
