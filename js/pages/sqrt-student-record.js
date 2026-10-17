/* sqrt-student-record.js – loads one student (the back end logs the view) */
(function () {
  var $ = CARE.ui.$, ui = CARE.ui, id = ui.param("id");
  if (!id) { CARE.go("sqrtStudentSearch"); return; }

  $("#full-report").href = CARE.url("sqrtNewRescueReport", { student: id });
  $("#quick-report").href = CARE.url("sqrtQuickRescueReport", { student: id });

  CARE.api.getStudent({ id: id }).then(function (s) {
    CARE.views.setText("page-title", ui.fullName(s));
    CARE.views.recordCard($("#record"), s);
    document.title = ui.fullName(s) + " · CARE";
  }).catch(ui.fail);
})();
