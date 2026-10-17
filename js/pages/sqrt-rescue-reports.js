/* sqrt-rescue-reports.js – every report this SQRT has filed */
(function () {
  var $ = CARE.ui.$, ui = CARE.ui, esc = ui.esc;
  var sort = $("#sort");
  ui.fillSelect(sort, CARE.enums.reportSort, false);

  function row(r) {
    return '<a class="reports__row reports__row--link" href="' + CARE.url("sqrtRescueReportDetail", { id: r.id }) + '">' +
      '<span class="reports__id is-left">' + esc(r.code) + "</span>" +
      "<span>" + esc(ui.fullName(r.student)) + "</span>" +
      "<span>" + esc(ui.dateTime(r.occurredAt)) + "</span>" +
      "<span>" + esc(r.location) + "</span>" +
      "<span>" + ui.reportPill(r.status, true) + "</span><span></span></a>";
  }
  var failed = false;
  function load() {
    CARE.api.listReports({ sort: sort.value }).then(function (list) {
      $("#rows").innerHTML = (list && list.length) ? list.map(row).join("") : '<p class="reports__empty">No rescue reports yet.</p>';
    }).catch(function (err) {
      $("#rows").innerHTML = '<p class="reports__empty">No rescue reports yet.</p>';
      if (!failed) { failed = true; ui.fail(err); }
    });
  }
  sort.addEventListener("change", load);
  load();
})();
