/* admin-add-account.js – create a user account with a generated first password */
(function () {
  var $ = CARE.ui.$, ui = CARE.ui;
  var form = $("#account-form"), error = $("#form-error"), btn = $("#submit-btn");

  ui.fillSelect(form.role, CARE.enums.roles, false);
  ui.fillSelect(form.status, CARE.enums.accountStatus, false);
  CARE.views.loadLookups({ department: form.department });

  function collect() {
    return {
      firstName: form.firstName.value.trim(), lastName: form.lastName.value.trim(),
      username: form.username.value.trim().toLowerCase(), email: form.email.value.trim(),
      role: form.role.value, department: form.department.value, status: form.status.value
    };
  }
  function validate(data) {
    var bad = null;
    ["firstName", "lastName", "username", "email", "department"].forEach(function (n) {
      var empty = !form[n].value.trim();
      form[n].classList.toggle("is-invalid", empty);
      if (empty && !bad) bad = form[n];
    });
    if (!bad && data.username.indexOf(data.role + ".") !== 0) {
      form.username.classList.add("is-invalid"); bad = form.username;
      error.textContent = "The username must start with the role, like " + data.role + ".surname.";
      form.username.focus(); return false;
    }
    error.textContent = bad ? "Fill in the highlighted fields." : "";
    if (bad) bad.focus();
    return !bad;
  }

  var pw = $("#password");
  function newPassword() { pw.textContent = ui.generatePassword(6); }
  newPassword();
  $("#new-pw").addEventListener("click", newPassword);

  /* Suggest the username prefix from the chosen role. */
  form.role.addEventListener("change", function () { form.username.placeholder = form.role.value + ".surname"; });
  form.username.placeholder = form.role.value + ".surname";

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = collect();
    if (!validate(data)) return;
    data.password = pw.textContent;
    ui.busy(btn, CARE.api.createAccount(data)).then(function (a) {
      CARE.go("adminAccountDetail", { id: a.id, notice: "created" });
    }).catch(function (err) {
      if (CARE.validate.serverError(err, form.username, error)) return;
      error.textContent = err.message; ui.fail(err);
    });
  });
})();
