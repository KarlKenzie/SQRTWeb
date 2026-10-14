/* New password page (forgot-password.html) */
(function () {
  "use strict";

  var pwEl = document.getElementById("new-password");
  var form = document.getElementById("reset-form");
  var confirmEl = document.getElementById("confirm");
  var errorEl = document.getElementById("reset-error");
  var saveBtn = document.getElementById("save");

  var resetUser = CareApi.flash.get("resetUser");
  var token = null;
  var newPassword = "";

  function showError(text) {
    errorEl.textContent = text;
    confirmEl.classList.toggle("has-error", !!text);
  }

  // Ask the server for a new password for this account.
  if (!resetUser) {
    // Opened directly, without the username from the sign-in page.
    location.replace("index.html");
    return;
  }

  CareApi.post("/api/forgot", { username: resetUser }).then(function (r) {
    if (!r.ok) {
      pwEl.textContent = "—";
      showError(r.data.error || "Could not create a new password. Please try again.");
      return;
    }
    token = r.data.token;
    newPassword = r.data.password;
    pwEl.textContent = newPassword;
    saveBtn.disabled = false;
    confirmEl.focus();
  });

  confirmEl.addEventListener("input", function () { showError(""); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!token) return;

    var typed = confirmEl.value.replace(/\s+/g, "");
    if (!typed) { showError("Type the new password shown above."); return; }
    if (typed !== newPassword) { showError("That doesn't match the password above."); return; }

    saveBtn.disabled = true;
    CareApi.post("/api/reset", { token: token, confirm: typed }).then(function (r) {
      if (!r.ok) {
        saveBtn.disabled = false;
        showError(r.data.error || "Could not save the password. Please try again.");
        return;
      }
      CareApi.flash.set("savedPassword", newPassword);
      CareApi.flash.set("prefillUser", resetUser);
      CareApi.flash.clear("resetUser");
      location.href = "save-password.html";
    });
  });
})();
