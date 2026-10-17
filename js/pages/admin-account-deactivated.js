/* admin-account-deactivated.js – confirmation after an account is deactivated */
(function () {
  var $ = CARE.ui.$, ui = CARE.ui, id = ui.param("id");
  if (!id) { CARE.go("adminUserAccounts"); return; }
  CARE.api.getAccount({ id: id }).then(function (a) {
    CARE.views.accountDetail(a);
    $("#notice-text").textContent = ui.fullName(a) + "’s account is now inactive.";
  }).catch(ui.fail);
})();
