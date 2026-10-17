/* ==========================================================================
   CARE – views.js
   Renderers shared by several pages (record card, report detail, account
   detail, dropdown lookups). Pages pass in data that came from CARE.api.
   ========================================================================== */
(function () {
  var ui = CARE.ui, esc = ui.esc;

  function setText(id, value) { var el = document.getElementById(id); if (el) el.textContent = value == null ? "" : value; }
  function dash(v) { return v ? v : "—"; }

  CARE.views = {
    setText: setText,

    /* Fill Program / Block / Department dropdowns from the back end. Silent on failure. */
    loadLookups: function (map) {
      if (map.program) CARE.api.getPrograms().then(function (list) {
        ui.fillSelect(map.program, (list || []).map(function (p) { return { value: p.code, label: p.code + " – " + p.name }; }));
      }).catch(function () {});
      if (map.block) CARE.api.getBlocks().then(function (list) { ui.fillSelect(map.block, list || []); }).catch(function () {});
      if (map.department) CARE.api.getDepartments().then(function (list) { ui.fillSelect(map.department, list || []); }).catch(function () {});
    },

    programLabel: function (s) { return s.programName || s.programCode || ""; },
    yearTitle: function (y) { return String(y || "").replace(/ year$/i, " Year"); },

    /* Student record card. `el` receives the inner markup. */
    recordCard: function (el, s) {
      var meta = [s.studentId, s.programName, s.block ? "Block " + s.block : "", CARE.views.yearTitle(s.yearLevel)].filter(Boolean).join(" · ");
      el.innerHTML =
        '<div class="record__head">' +
          "<div>" +
            '<h2 class="record__name">' + esc(ui.fullName(s)) + "</h2>" +
            '<p class="record__meta">' + esc(meta) + "</p>" +
          "</div>" +
          '<div class="record__right">' +
            '<span class="source-chip">' + CARE.icons.html("shield-check") + "Verified Clinic Information</span>" +
            '<p class="record__updated"><strong>Last updated:</strong> ' + esc(ui.dateTime(s.updatedAt)) + "</p>" +
          "</div>" +
        "</div>" +
        '<hr class="record__rule">' +
        '<div class="record__boxes">' +
          '<div class="infobox infobox--danger">' + CARE.icons.html("triangle-alert") +
            '<div><div class="infobox__title">Allergies</div><div class="infobox__value">' + esc(s.allergies || "None recorded") + "</div></div></div>" +
          '<div class="infobox infobox--warn">' + CARE.icons.html(el.getAttribute("data-condition-icon") || "heart-pulse") +
            '<div><div class="infobox__title">Existing medical conditions</div><div class="infobox__value">' + esc(s.conditions || "None recorded") + "</div></div></div>" +
        "</div>" +
        '<div class="record__details">' +
          "<div><div class=\"record__label\">Past treatments</div><div class=\"record__value\">" + esc(dash(s.pastTreatments)) + "</div></div>" +
          "<div><div class=\"record__label\">Emergency contact</div><div class=\"record__value\">" + esc(dash(s.emergencyContact)) + "</div></div>" +
        "</div>";
    },

    /* Rescue report: fills the shared ids used by both report detail pages. */
    reportDetail: function (r) {
      var name = ui.fullName(r.student);
      setText("page-title", "Rescue report " + r.code);
      setText("rr-title", r.code + " — " + name);
      setText("rr-meta", [r.student && r.student.studentId, ui.dateTime(r.occurredAt), r.location].filter(Boolean).join(" · "));
      var status = document.getElementById("rr-status");
      if (status) status.innerHTML = ui.reportPill(r.status);
      setText("rr-submitted", r.submittedBy ? r.submittedBy.name + (r.submittedBy.code ? " (" + r.submittedBy.code + ")" : "") : "");
      setText("rr-reason", r.reason);
      setText("rr-referred", r.referred ? "Yes" : "No");
      setText("rr-observed", dash(r.observed));
      setText("rr-actions", dash(r.actions));
      setText("rr-intervention", dash(r.intervention));
      setText("rr-notes", dash(r.notes));

      var box = document.getElementById("rr-assessment");
      if (box) {
        if (r.assessment && r.assessment.text) {
          box.className = "rr-note rr-note--done";
          box.innerHTML = "<p>" + esc(r.assessment.text) + "</p>" +
            "<small>" + esc([r.assessment.by, ui.dateTime(r.assessment.at)].filter(Boolean).join(" · ")) + "</small>";
        } else {
          box.className = "rr-note";
          box.innerHTML = CARE.icons.html("triangle-alert") + "<span>Not yet assessed.</span>";
        }
      }
    },

    /* Small rows in "Recent reports" lists on dashboards. */
    recentReportRow: function (r, detailPage, subLine, shortPill) {
      return '<a class="recent__row" href="' + CARE.url(detailPage, { id: r.id }) + '">' +
        "<div>" +
          '<div class="recent__title">' + esc(r.code) + " · " + esc(ui.fullName(r.student)) + "</div>" +
          '<div class="recent__sub">' + esc(subLine) + "</div>" +
        "</div>" +
        ui.reportPill(r.status, false, shortPill) +
      "</a>";
    },

    /* Account (admin) – shared by the four account pages */
    accountDetail: function (a) {
      var name = ui.fullName(a);
      var roleLabel = { sqrt: "SQRT", clinic: "CLINIC", admin: "ADMIN" }[a.role] || "";
      var roleLong = { sqrt: "SQRT responder", clinic: "Clinic staff", admin: "Administrator" }[a.role] || "";
      var inactive = a.status === "inactive";
      setText("page-title", name);
      setText("page-sub", roleLong);
      setText("acc-avatar", ui.initials(name));
      setText("acc-name", name);
      var role = document.getElementById("acc-role"); if (role) role.textContent = roleLabel;
      var tag = document.getElementById("acc-status-tag");
      if (tag) { tag.textContent = inactive ? "Inactive" : "Active"; tag.className = "acc__tag" + (inactive ? " acc__tag--inactive" : ""); }
      setText("acc-username", a.username);
      setText("acc-email", a.email);
      setText("acc-department", a.department);
      setText("acc-id", a.accountId);
      setText("acc-last", a.lastSignIn ? ui.dateTime(a.lastSignIn) : "—");
      setText("acc-created", a.createdAt ? ui.date(a.createdAt) : "—");
      setText("acc-status", inactive ? "Inactive" : "Active");
      var toggle = document.getElementById("acc-toggle");
      if (toggle) {
        toggle.setAttribute("href", CARE.url(inactive ? "adminReactivateAccount" : "adminDeactivateAccount", { id: a.id }));
        toggle.innerHTML = inactive ? CARE.icons.html("circle-check") + "Reactivate" : CARE.icons.html("x") + "Deactivate";
      }
      var edit = document.getElementById("acc-edit"); if (edit) edit.setAttribute("href", CARE.url("adminEditAccount", { id: a.id }));
      var full = document.getElementById("acc-fulllog"); if (full) full.setAttribute("href", CARE.url("adminAccessLogs", { q: name }));

      var list = document.getElementById("acc-activity");
      if (list) {
        var items = a.activity || [];
        list.innerHTML = items.length ? items.map(function (e) {
          return '<div class="acc-act__row"><div><div class="acc-act__title">' + esc(e.action) + "</div>" +
            '<div class="acc-act__sub">' + esc(e.student ? e.student.name + " — " + e.student.studentId : "—") + "</div></div>" +
            '<div class="acc-act__when"><span class="tag tag--' + esc(e.result || "success") + '">' + (e.result === "failed" ? "Failed" : "Success") + "</span>" +
            "<span>" + esc(ui.logTime(e.at).replace(/ : /, ":")) + "</span></div></div>";
        }).join("") : '<p class="acc-act__empty">No activity recorded yet.</p>';
      }
      return { name: name, roleLabel: roleLabel, roleLong: roleLong, roleName: { sqrt: "SQRT", clinic: "Clinic", admin: "Administrator" }[a.role] || "", inactive: inactive };
    }
  };
})();
