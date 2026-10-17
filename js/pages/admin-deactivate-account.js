/* admin-deactivate-account.js – account page behind a confirmation dialog */
(function () {
  var $ = CARE.ui.$, ui = CARE.ui, id = ui.param("id");
  if (!id) { CARE.go("adminUserAccounts"); return; }
  var confirmBtn = $("#m-confirm"), error = $("#m-error");
  var back = CARE.url("adminAccountDetail", { id: id });
  $("#m-cancel").href = back;

  CARE.api.getAccount({ id: id }).then(function (a) {
    var v = CARE.views.accountDetail(a);
    CARE.views.setText("m-name", v.name);
    CARE.views.setText("m-username", a.username);
    CARE.views.setText("m-role", v.roleName);
    CARE.views.setText("m-role-long", v.roleName);
    CARE.views.setText("m-status", v.inactive ? "Inactive" : "Active");
  }).catch(ui.fail);

  document.addEventListener("keydown", function (e) { if (e.key === "Escape") window.location.href = back; });
  $("#overlay").addEventListener("click", function (e) { if (e.target === this) window.location.href = back; });

  confirmBtn.addEventListener("click", function () {
    ui.busy(confirmBtn, CARE.api.setAccountStatus({ id: id, status: "inactive" })).then(function () {
      CARE.go("adminAccountDeactivated", { id: id });
    }).catch(function (err) { error.textContent = err.message; ui.fail(err); });
  });
})();
