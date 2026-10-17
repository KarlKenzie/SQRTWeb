/* sqrt-student-search.js – filter and list students */
(function () {
  var $ = CARE.ui.$, ui = CARE.ui, esc = ui.esc;
  var form = $("#filters");

  ui.fillSelect($("#year"), CARE.enums.yearLevels.map(function (y) { return { value: y, label: y.charAt(0).toUpperCase() + y.slice(1) }; }));
  ui.fillSelect($("#sort"), CARE.enums.studentSort, false);
  CARE.views.loadLookups({ program: $("#program"), block: $("#block") });
  if (ui.param("q")) form.q.value = ui.param("q");

  function row(s) {
    return '<div class="table__row">' +
      "<strong>" + esc(ui.lastFirst(s)) + "</strong>" +
      "<span>" + esc(s.studentId) + "</span>" +
      '<span><span class="program__code">' + esc(s.programCode) + '</span><span class="program__name">' + esc(s.programName) + "</span></span>" +
      '<span class="muted">' + esc(s.block) + "</span>" +
      '<span class="muted">' + esc(s.yearLevel) + "</span>" +
      '<a class="btn btn--sm" href="' + CARE.url("sqrtStudentRecord", { id: s.id }) + '">View record</a></div>';
  }

  var failed = false;
  function load() {
    var f = { q: form.q.value.trim(), program: form.program.value, block: form.block.value, year: form.year.value, sort: form.sort.value };
    CARE.api.searchStudents(f).then(function (res) {
      var list = res.students || [];
      $("#count").textContent = "Showing " + list.length + " of " + (res.total != null ? res.total : list.length) + " students";
      $("#rows").innerHTML = list.length ? list.map(row).join("") : ui.emptyRow("No students found.");
    }).catch(function (err) {
      $("#count").textContent = "Showing 0 of 0 students";
      $("#rows").innerHTML = ui.emptyRow("No students found.");
      if (!failed) { failed = true; ui.fail(err); }
    });
  }
  form.addEventListener("input", ui.debounce(load, 250));
  form.addEventListener("change", load);
  load();
})();
