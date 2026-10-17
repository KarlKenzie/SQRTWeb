/* sqrt-report-submitted.js – confirmation after a rescue report is filed */
(function () {
  var $ = CARE.ui.$, ui = CARE.ui, id = ui.param("id");
  if (!id) { CARE.go("sqrtRescueReports"); return; }
  $("#view-report").href = CARE.url("sqrtRescueReportDetail", { id: id });

  CARE.api.getReport({ id: id }).then(function (r) {
    $("#done-code").textContent = r.code;
    $("#done-name").textContent = ui.fullName(r.student);
    if (r.student && r.student.id) $("#open-record").href = CARE.url("sqrtStudentRecord", { id: r.student.id });
  }).catch(ui.fail);
})();
