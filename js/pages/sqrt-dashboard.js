/* sqrt-dashboard.js – search box, pending-review banner, recent reports */
(function () {
  var $ = CARE.ui.$, ui = CARE.ui;

  $("#find-form").addEventListener("submit", function (e) {
    e.preventDefault();
    CARE.go("sqrtStudentSearch", { q: this.q.value.trim() });
  });

  CARE.api.getSqrtDashboard().then(function (d) {
    var n = d.pendingCount || 0;
    if (n > 0) {
      $("#pending-title").textContent = n + (n === 1 ? " report awaiting clinic review" : " reports awaiting clinic review");
      $("#pending-codes").textContent = (d.pendingCodes || []).join(", ");
      $("#pending-banner").hidden = false;
    }
    var list = d.recentReports || [];
    $("#recent-list").innerHTML = list.length ? list.map(function (r) {
      return CARE.views.recentReportRow(r, "sqrtRescueReportDetail", ui.dateTime(r.occurredAt) + " · " + r.location, true);
    }).join("") : '<p class="recent__empty">No reports yet.</p>';
  }).catch(function (err) {
    $("#recent-list").innerHTML = '<p class="recent__empty">No reports yet.</p>';
    ui.fail(err);
  });
})();
