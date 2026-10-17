/* clinic-student-record.js – official record, clinic view */
(function () {
  var $ = CARE.ui.$, ui = CARE.ui, id = ui.param("id");
  if (!id) { CARE.go("clinicStudentRecords"); return; }

  function load() {
    CARE.api.getStudent({ id: id }).then(function (s) {
      CARE.views.setText("page-title", ui.fullName(s));
      CARE.views.recordCard($("#record"), s);
      $("#edit-link").href = CARE.url("clinicEditStudentRecord", { id: id });
      var reports = s.reports || [];
      $("#related").innerHTML = reports.length ? reports.map(function (r) {
        return '<a class="related__item" href="' + CARE.url("clinicRescueReportDetail", { id: r.id }) + '"><span><strong>' + ui.esc(r.code) +
          '</strong> <span class="muted">· ' + ui.esc(ui.dateTime(r.occurredAt)) + " · " + ui.esc(r.location) + "</span></span>" + ui.reportPill(r.status) + "</a>";
      }).join("") : '<p class="related__empty">No rescue reports for this student</p>';
    }).catch(function (err) {
      $("#related").innerHTML = '<p class="related__empty">No rescue reports for this student</p>';
      ui.fail(err);
    });
  }
  load();
})();
