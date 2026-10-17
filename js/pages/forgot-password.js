/* forgot-password.js – asks the clinic to issue a temporary password (no reset happens here) */
(function () {
  var $ = CARE.ui.$, ui = CARE.ui;
  var form = $("#forgot-form"), error = $("#form-error"), btn = $("#submit-btn");

  /* Come back with the username typed on the sign-in page, if there was one. */
  var prefill = ui.param("username");
  if (prefill) form.username.value = prefill;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var username = form.username.value.trim().toLowerCase();
    if (!username) {
      form.username.classList.add("is-invalid");
      error.textContent = "Enter your username.";
      form.username.focus();
      return;
    }
    form.username.classList.remove("is-invalid");
    error.textContent = "";
    ui.busy(btn, CARE.api.requestPasswordReset({ username: username })).then(function () {
      /* The same answer whether or not the username exists, so usernames cannot be probed. */
      form.hidden = true;
      $("#forgot-done").hidden = false;
    }).catch(function (err) {
      error.textContent = err.message || "The request could not be sent.";
    });
  });
})();
