/* sqrt-rescue-report-detail.js – read-only view of one report */
(function () {
  var $ = CARE.ui.$, ui = CARE.ui, id = ui.param("id");
  if (!id) { CARE.go("sqrtRescueReports"); return; }
  CARE.api.getReport({ id: id }).then(function (r) {
    CARE.views.reportDetail(r);
    if (r.student && r.student.id) $("#open-record").href = CARE.url("sqrtStudentRecord", { id: r.student.id });
  }).catch(function (err) {
    CARE.views.reportDetail({ student: {}, code: "" });
    ui.fail(err);
  });
})();
