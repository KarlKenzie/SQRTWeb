/* admin-edit-account.js – change an existing account */
(function () {
  var $ = CARE.ui.$, ui = CARE.ui, id = ui.param("id");
  if (!id) { CARE.go("adminUserAccounts"); return; }
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

  $("#cancel").href = CARE.url("adminAccountDetail", { id: id });

  CARE.api.getAccount({ id: id }).then(function (a) {
    CARE.views.setText("page-sub", ui.fullName(a) + " · " + a.username);
    form.firstName.value = a.firstName || ""; form.lastName.value = a.lastName || "";
    form.username.value = a.username || ""; form.email.value = a.email || "";
    form.role.value = a.role; form.status.value = a.status;
    setTimeout(function () {
      var has = Array.prototype.some.call(form.department.options, function (o) { return o.value === a.department; });
      if (!has && a.department) form.department.insertAdjacentHTML("beforeend", '<option value="' + ui.esc(a.department) + '">' + ui.esc(a.department) + "</option>");
      form.department.value = a.department || "";
    }, 300);
  }).catch(ui.fail);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = collect();
    if (!validate(data)) return;
    data.id = id;
    ui.busy(btn, CARE.api.updateAccount(data)).then(function () {
      CARE.go("adminAccountDetail", { id: id, notice: "saved" });
    }).catch(function (err) {
      if (CARE.validate.serverError(err, form.username, error, form.email)) return;
      error.textContent = err.message; ui.fail(err);
    });
  });
})();
