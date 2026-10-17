/* clinic-edit-student-record.js – change an official student record */
(function () {
  var $ = CARE.ui.$, ui = CARE.ui, id = ui.param("id");
  if (!id) { CARE.go("clinicStudentRecords"); return; }
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

  $("#cancel").href = CARE.url("clinicStudentRecord", { id: id });
  ui.fillSelect(form.year, CARE.enums.yearLevels.map(function (y) { return { value: y, label: y.charAt(0).toUpperCase() + y.slice(1) }; }));
  CARE.views.loadLookups({ program: form.program, block: form.block });

  function pick(select, value) {
    if (!value) return;
    var has = Array.prototype.some.call(select.options, function (o) { return o.value === value; });
    if (!has) select.insertAdjacentHTML("beforeend", '<option value="' + ui.esc(value) + '">' + ui.esc(value) + "</option>");
    select.value = value;
  }

  CARE.api.getStudent({ id: id }).then(function (s) {
    CARE.views.setText("page-sub", ui.fullName(s) + "  " + s.studentId);
    form.firstName.value = s.firstName || ""; form.lastName.value = s.lastName || "";
    form.studentId.value = s.studentId || "";
    /* lookups load in parallel; wait a tick so their options exist before selecting */
    setTimeout(function () { pick(form.program, s.programCode); pick(form.block, s.block); pick(form.year, s.yearLevel); }, 300);
    form.allergies.value = s.allergies && s.allergies !== "None recorded" ? s.allergies : "";
    form.conditions.value = s.conditions && s.conditions !== "None recorded" ? s.conditions : "";
    form.treatments.value = s.pastTreatments || ""; form.contact.value = s.emergencyContact || "";
  }).catch(ui.fail);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate(form, error)) return;
    var data = fieldsOf(form); data.id = id;
    ui.busy(btn, CARE.api.updateStudent(data)).then(function () {
      CARE.go("clinicStudentRecord", { id: id });
    }).catch(function (err) { error.textContent = err.message; ui.fail(err); });
  });
})();
