/* sqrt-new-rescue-report.js – full rescue report for one student */
(function () {
  var $ = CARE.ui.$, ui = CARE.ui;
  var form = $("#report-form"), error = $("#form-error"), btn = $("#submit-btn");
  var studentId = ui.param("student");
  if (!studentId) { CARE.go("sqrtStudentSearch"); return; }

  ui.fillSelect($("#referred"), CARE.enums.yesNo, false);
  form.when.value = ui.dateTime(new Date());
  $("#cancel").href = CARE.url("sqrtStudentRecord", { id: studentId });
  $("#switch-quick").href = CARE.url("sqrtQuickRescueReport", { student: studentId });

  CARE.api.getStudent({ id: studentId }).then(function (s) {
    var meta = [s.studentId, s.programName, s.block ? "Block " + s.block : "", CARE.views.yearTitle(s.yearLevel)].filter(Boolean).join(" · ");
    CARE.views.setText("page-sub", "For " + ui.fullName(s) + " · " + meta);
    form.student.value = ui.fullName(s) + " — " + s.studentId;
  }).catch(ui.fail);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var required = ["location", "reason", "observed", "actions", "when"], bad = null;
    required.forEach(function (n) {
      var empty = !form[n].value.trim();
      form[n].classList.toggle("is-invalid", empty);
      if (empty && !bad) bad = form[n];
    });
    var when = new Date(form.when.value);
    if (!bad && isNaN(when)) { form.when.classList.add("is-invalid"); bad = form.when; error.textContent = "Enter the date and time like 26 Sep 2026, 7:41 AM."; }
    else if (bad) error.textContent = "Fill in the highlighted fields.";
    if (bad) { bad.focus(); return; }
    error.textContent = "";

    ui.busy(btn, CARE.api.submitReport({
      studentId: studentId, type: "full",
      location: form.location.value.trim(), reason: form.reason.value.trim(),
      observed: form.observed.value.trim(), actions: form.actions.value.trim(),
      occurredAt: when.toISOString(), referred: form.referred.value === "yes",
      intervention: form.intervention.value.trim(), notes: form.notes.value.trim()
    })).then(function (r) {
      CARE.go("sqrtReportSubmitted", { id: r.id });
    }).catch(function (err) { error.textContent = err.message; ui.fail(err); });
  });
})();
