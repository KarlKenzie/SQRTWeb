/* clinic-rescue-report-detail.js – read the SQRT report, add the clinic assessment, see the medical record */
(function () {
  var $ = CARE.ui.$, ui = CARE.ui, id = ui.param("id");
  if (!id) { CARE.go("clinicSqrtRescueReports"); return; }
  var form = $("#assess-form"), error = $("#assess-error"), btn = $("#assess-btn");

  function show(r) {
    CARE.views.reportDetail(r);
    form.hidden = !!(r.assessment && r.assessment.text);
    var s = r.student || {};
    if (s.id) {
      $("#med-update").href = CARE.url("clinicEditStudentRecord", { id: s.id });
      $("#med-open").href = CARE.url("clinicStudentRecord", { id: s.id });
      CARE.api.getStudent({ id: s.id }).then(function (st) {
        CARE.views.setText("med-allergies", st.allergies || "None recorded");
        CARE.views.setText("med-conditions", st.conditions || "None recorded");
        CARE.views.setText("med-treatments", st.pastTreatments || "—");
        CARE.views.setText("med-updated", ui.dateTime(st.updatedAt));
      }).catch(function () {});
    }
  }

  CARE.api.getReport({ id: id }).then(show).catch(function (err) {
    CARE.views.reportDetail({ student: {}, code: "" });
    form.hidden = true;
    ui.fail(err);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = form.assessment.value.trim();
    if (!text) { form.assessment.classList.add("is-invalid"); error.textContent = "Write your assessment first."; return; }
    form.assessment.classList.remove("is-invalid"); error.textContent = "";
    ui.busy(btn, CARE.api.saveAssessment({ reportId: id, text: text })).then(show)
      .catch(function (err) { error.textContent = err.message; ui.fail(err); });
  });
})();
