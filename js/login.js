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
      message.textContent = "";
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

  // ---- Validation helpers ----
  function setError(input, text) {
    var field = input.closest(".field");
    field.classList.add("has-error");
    document.getElementById(input.id + "-error").textContent = text;
  }
  function clearError(input) {
    var field = input.closest(".field");
    field.classList.remove("has-error");
    document.getElementById(input.id + "-error").textContent = "";
  }

  [username, password].forEach(function (input) {
    input.addEventListener("input", function () { clearError(input); });
  });

  // ---- Submit ----
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;

    if (!username.value.trim()) {
      setError(username, "Enter your username.");
      ok = false;
    }
    if (!password.value) {
      setError(password, "Enter your password.");
      ok = false;
    }
    if (!ok) {
      (username.value.trim() ? password : username).focus();
      return;
    }

    submit.disabled = true;
    message.textContent = "Signing in…";

    // TODO: replace with a real request to your backend, e.g.
    // fetch("/api/login", { method: "POST", body: JSON.stringify({ role, username, password }) })
    setTimeout(function () {
      submit.disabled = false;
      message.textContent = "Demo only: no server is connected yet (" + role + ").";
    }, 700);
  });

  forgot.addEventListener("click", function (e) {
    e.preventDefault();
    message.textContent = "Accounts are issued by the University Clinic. Please contact them to reset your password.";
  });
})();
