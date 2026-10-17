/* new-password.js – shows a generated password, asks the user to type it back, saves it */
(function () {
  var $ = CARE.ui.$, ui = CARE.ui;
  var form = $("#password-form"), error = $("#form-error"), btn = $("#save-btn");
  var password = ui.generatePassword(7);
  $("#new-password").textContent = password;

  /* A reset link can carry a one-time token; the back end decides what it means. */
  var token = ui.param("token");

  $("#toggle-confirm").addEventListener("click", function () {
    var show = form.confirm.type === "password";
    form.confirm.type = show ? "text" : "password";
    this.textContent = show ? "Hide" : "Show";
    this.setAttribute("aria-pressed", show ? "true" : "false");
    this.setAttribute("aria-label", show ? "Hide password" : "Show password");
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (form.confirm.value !== password) {
      error.textContent = "That does not match the password above. Type it exactly as shown.";
      form.confirm.focus();
      return;
    }
    error.textContent = "";
    ui.busy(btn, CARE.api.setPassword({ password: password, token: token })).then(function () {
      CARE.session.flash("newPassword", password);
      CARE.go("passwordSaved");
    }).catch(function (err) {
      error.textContent = err.message || "The password could not be saved.";
    });
  });
})();
