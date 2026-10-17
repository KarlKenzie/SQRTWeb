/* admin-user-accounts.js – list, filter and open accounts */
(function () {
  var $ = CARE.ui.$, ui = CARE.ui, esc = ui.esc;
  var form = $("#filters");
  ui.fillSelect(form.role, CARE.enums.roles);
  ui.fillSelect(form.status, CARE.enums.accountStatus);

  function row(a) {
    var name = ui.lastFirst(a), inactive = a.status === "inactive";
    return '<div class="atable__row">' +
      '<span class="person"><span class="person__avatar">' + esc(ui.initials(ui.fullName(a))) + "</span>" + esc(name) + "</span>" +
      "<span>" + esc(a.username) + "</span>" +
      '<span><span class="chip chip--' + esc(a.role) + '">' + esc(a.role) + "</span></span>" +
      "<span>" + esc(a.department) + "</span>" +
      '<span><span class="tag' + (inactive ? " tag--inactive" : "") + '">' + (inactive ? "Inactive" : "Active") + "</span></span>" +
      "<span>" + esc(ui.dateTime(a.lastSignIn)) + "</span>" +
      '<span class="row-actions"><a class="btn btn--outline" href="' + CARE.url("adminAccountDetail", { id: a.id }) + '">Open</a>' +
      '<a class="btn btn--tint" href="' + CARE.url("adminEditAccount", { id: a.id }) + '">Edit</a></span></div>';
  }
  var failed = false;
  function load() {
    CARE.api.listAccounts({ q: form.q.value.trim(), role: form.role.value, status: form.status.value }).then(function (res) {
      var list = res.accounts || [];
      $("#count").textContent = "Showing " + list.length + " of " + (res.total != null ? res.total : list.length) + " accounts";
      $("#rows").innerHTML = list.length ? list.map(row).join("") : '<p class="atable__empty">No accounts found.</p>';
    }).catch(function (err) {
      $("#count").textContent = "Showing 0 of 0 accounts";
      $("#rows").innerHTML = '<p class="atable__empty">No accounts found.</p>';
      if (!failed) { failed = true; ui.fail(err); }
    });
  }
  form.addEventListener("input", ui.debounce(load, 250));
  form.addEventListener("change", load);
  load();
})();
