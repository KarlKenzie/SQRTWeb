/* admin-access-logs.js – every sign-in, view and change, newest first */
(function () {
  var $ = CARE.ui.$, ui = CARE.ui, esc = ui.esc;
  var form = $("#filters");
  ui.fillSelect(form.role, CARE.enums.roles);
  ui.fillSelect(form.action, CARE.enums.logActions);
  ui.fillSelect(form.result, CARE.enums.logResults);
  if (ui.param("q")) form.q.value = ui.param("q");

  function row(e) {
    var result = e.result === "failed" ? "Failed" : "Success";
    return '<div class="atable__row">' +
      "<span>" + esc(ui.logTime(e.at)) + "</span>" +
      '<span class="name">' + esc(e.user) + "</span>" +
      '<span><span class="chip chip--' + esc(e.role) + '">' + esc(e.role) + "</span></span>" +
      '<span class="name">' + esc(e.action) + "</span>" +
      "<span>" + (e.student ? esc(e.student.name + " — " + e.student.studentId) : "–") + "</span>" +
      '<span><span class="tag tag--' + (e.result === "failed" ? "failed" : "success") + '">' + result + "</span></span></div>";
  }
  var failed = false;
  function load() {
    CARE.api.listLogs({ q: form.q.value.trim(), role: form.role.value, action: form.action.value, result: form.result.value }).then(function (res) {
      var list = res.entries || [];
      $("#count").textContent = "Showing " + list.length + " of " + (res.total != null ? res.total : list.length) + " entries";
      $("#rows").innerHTML = list.length ? list.map(row).join("") : '<p class="atable__empty">No log entries found.</p>';
    }).catch(function (err) {
      $("#count").textContent = "Showing 0 of 0 entries";
      $("#rows").innerHTML = '<p class="atable__empty">No log entries found.</p>';
      if (!failed) { failed = true; ui.fail(err); }
    });
  }
  form.addEventListener("input", ui.debounce(load, 250));
  form.addEventListener("change", load);
  load();
})();
