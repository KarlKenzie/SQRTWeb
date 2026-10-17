/* admin-dashboard.js – administrator overview */
(function () {
  var $ = CARE.ui.$, ui = CARE.ui, esc = ui.esc;
  var set = CARE.views.setText;

  CARE.api.getAdminDashboard().then(function (d) {
    set("s-accounts", d.accountCount || 0);
    set("s-active", (d.activeCount || 0) + " active");
    set("s-sqrt", d.sqrtCount || 0);
    set("s-clinic", d.clinicCount || 0);
    set("s-logs", d.logCount || 0);
    var f = d.failedCount || 0;
    if (f > 0) {
      set("failed-title", f + (f === 1 ? " failed sign-in attempt in the log" : " failed sign-in attempts in the log"));
      $("#failed-banner").hidden = false;
    }
    var list = d.recent || [];
    $("#activity").innerHTML = list.length ? list.map(function (e) {
      var who = [e.user, e.student ? e.student.name + " — " + e.student.studentId : "—"].join(" · ");
      return '<div class="act__row"><div><div class="act__title">' + esc(e.action) + '</div><div class="act__sub">' + esc(who) + "</div></div>" +
        '<div class="act__when"><span class="chip chip--' + esc(e.role) + '">' + esc(e.role) + "</span><span>" + esc(ui.time(e.at)) + "</span></div></div>";
    }).join("") : '<p class="act__empty">No activity recorded yet.</p>';
  }).catch(function (err) {
    $("#activity").innerHTML = '<p class="act__empty">No activity recorded yet.</p>';
    ui.fail(err);
  });
})();
