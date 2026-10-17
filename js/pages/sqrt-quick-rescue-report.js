/* sqrt-quick-rescue-report.js – essentials-only rescue report */
(function () {
  var $ = CARE.ui.$, ui = CARE.ui;
  var form = $("#report-form"), error = $("#form-error"), btn = $("#submit-btn");
  var stamped = new Date();                       // the moment the form was opened
  var picked = {};                                // "Last, First — ID" -> student id
  var preset = ui.param("student");

  CARE.views.setText("page-sub", "Stamped " + ui.dateTime(stamped));

  /* A student chosen on the record page arrives pre-filled. */
  if (preset) {
    CARE.api.getStudent({ id: preset }).then(function (s) {
      var label = ui.fullName(s) + " — " + s.studentId;
      picked[label] = s.id; form.student.value = label;
    }).catch(function () {});
    $("#full-link").href = CARE.url("sqrtNewRescueReport", { student: preset });
  } else {
    $("#full-link").addEventListener("click", function (e) {
      var id = picked[form.student.value];
      if (!id) { e.preventDefault(); form.student.classList.add("is-invalid"); form.student.focus(); error.textContent = "Choose a student first."; return; }
      this.href = CARE.url("sqrtNewRescueReport", { student: id });
    });
  }

  /* Suggest students while typing. */
  form.student.addEventListener("input", ui.debounce(function () {
    var q = form.student.value.trim();
    if (q.length < 2 || picked[form.student.value]) return;
    CARE.api.searchStudents({ q: q, sort: "last-az" }).then(function (res) {
      picked = {};
      $("#student-options").innerHTML = (res.students || []).map(function (s) {
        var label = ui.fullName(s) + " — " + s.studentId;
        picked[label] = s.id;
        return '<option value="' + ui.esc(label) + '"></option>';
      }).join("");
    }).catch(function () {});
  }, 250));

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var bad = null;
    ["student", "location", "reason", "observed", "actions"].forEach(function (n) {
      var empty = !form[n].value.trim();
      form[n].classList.toggle("is-invalid", empty);
      if (empty && !bad) bad = form[n];
    });
    var studentId = picked[form.student.value];
    if (!bad && !studentId) { form.student.classList.add("is-invalid"); bad = form.student; error.textContent = "Choose the student from the suggestions."; }
    else if (bad) error.textContent = "Fill in the highlighted fields.";
    if (bad) { bad.focus(); return; }
    error.textContent = "";

    ui.busy(btn, CARE.api.submitQuickReport({
      studentId: studentId, type: "quick", occurredAt: stamped.toISOString(),
      location: form.location.value.trim(), reason: form.reason.value.trim(),
      observed: form.observed.value.trim(), actions: form.actions.value.trim()
    })).then(function (r) {
      CARE.go("sqrtReportSubmitted", { id: r.id });
    }).catch(function (err) { error.textContent = err.message; ui.fail(err); });
  });
})();
