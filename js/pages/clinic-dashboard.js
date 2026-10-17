/* clinic-dashboard.js – clinic overview */
(function () {
  var $ = CARE.ui.$, ui = CARE.ui;

  $("#find-form").addEventListener("submit", function (e) {
    e.preventDefault();
    CARE.go("clinicStudentRecords", { q: this.q.value.trim() });
  });

  CARE.api.getClinicDashboard().then(function (d) {
    $("#record-count").textContent = (d.recordCount || 0) + ((d.recordCount === 1) ? " record" : " records");
    var n = d.pendingCount || 0;
    if (n > 0) {
      $("#pending-title").textContent = n + (n === 1 ? " rescue report awaiting your review" : " rescue reports awaiting your review");
      $("#pending-banner").hidden = false;
    }
    var list = d.recentReports || [];
    $("#recent-list").innerHTML = list.length ? list.map(function (r) {
      var by = r.submittedBy ? r.submittedBy.name + (r.submittedBy.code ? " (" + r.submittedBy.code + ")" : "") : "";
      return CARE.views.recentReportRow(r, "clinicRescueReportDetail", ui.dateTime(r.occurredAt) + " · " + by);
    }).join("") : '<p class="recent__empty">No open reports.</p>';
  }).catch(function (err) {
    $("#recent-list").innerHTML = '<p class="recent__empty">No open reports.</p>';
    ui.fail(err);
  });
})();
