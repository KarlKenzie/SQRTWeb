/* clinic-add-student-record.js – create an official student record */
(function () {
  var $ = CARE.ui.$, ui = CARE.ui;
  var form = $("#student-form"), error = $("#form-error"), btn = $("#submit-btn");

  function fieldsOf(form) {
    return {
      firstName: form.firstName.value.trim(), lastName: form.lastName.value.trim(),
      studentId: form.studentId.value.trim(), programCode: form.program.value,
      block: form.block.value, yearLevel: form.year.value,
      allergies: form.allergies.value.trim() || "None recorded",
      conditions: form.conditions.value.trim() || "None recorded",
      pastTreatments: form.treatments.value.trim(), emergencyContact: form.contact.value.trim()
    };
  }
  function validate(form, error) {
    var bad = null;
    ["firstName", "lastName", "studentId", "program", "block", "year"].forEach(function (n) {
      var empty = !form[n].value.trim();
      form[n].classList.toggle("is-invalid", empty);
      if (empty && !bad) bad = form[n];
    });
    error.textContent = bad ? "Fill in the highlighted fields." : "";
    if (bad) bad.focus();
    return !bad;
  }

  ui.fillSelect(form.year, CARE.enums.yearLevels.map(function (y) { return { value: y, label: y.charAt(0).toUpperCase() + y.slice(1) }; }));
  CARE.views.loadLookups({ program: form.program, block: form.block });
  CARE.api.getNextStudentId().then(function (id) { if (id && !form.studentId.value) form.studentId.value = id; }).catch(function () {});

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate(form, error)) return;
    ui.busy(btn, CARE.api.createStudent(fieldsOf(form))).then(function (s) {
      CARE.go("clinicStudentRecordCreated", { id: s.id });
    }).catch(function (err) { error.textContent = err.message; ui.fail(err); });
  });
})();
