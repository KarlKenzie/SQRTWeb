/* admin-account-detail.js – one account, with its recent activity */
(function () {
  var $ = CARE.ui.$, ui = CARE.ui, id = ui.param("id");
  if (!id) { CARE.go("adminUserAccounts"); return; }

  CARE.api.getAccount({ id: id }).then(function (a) {
    var v = CARE.views.accountDetail(a);
    var notices = { created: "'s account was created.", saved: "'s account was updated.", reactivated: "'s account is now active." };
    var n = notices[ui.param("notice")];
    if (n) { $("#notice-text").textContent = ui.fullName(a) + n; $("#notice").hidden = false; }
    document.title = v.name + " · CARE";
  }).catch(ui.fail);
})();
