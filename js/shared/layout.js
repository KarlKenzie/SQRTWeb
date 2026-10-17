/* ==========================================================================
   CARE – layout.js
   Builds the sidebar for signed-in pages from two body attributes:
       <body data-role="sqrt|clinic|admin" data-nav="dashboard|search|reports|...">
   and wires the back arrow and Sign Out. Also runs the page guard.
   ========================================================================== */
(function () {
  var ROLES = {
    sqrt: {
      badge: { cls: "sqrt", icon: "shield-plus", label: "SQRT Responder" },
      items: [
        { key: "dashboard", label: "Dashboard",      icon: "home",      page: "sqrtDashboard" },
        { key: "search",    label: "Search",         icon: "search",    page: "sqrtStudentSearch" },
        { key: "reports",   label: "Rescue reports", icon: "file-text", page: "sqrtRescueReports" }
      ]
    },
    clinic: {
      badge: { cls: "clinic", icon: "shield-plus", label: "Clinic Staff" },
      items: [
        { key: "dashboard", label: "Dashboard",           icon: "home",     page: "clinicDashboard" },
        { key: "records",   label: "Student records",     icon: "users",    page: "clinicStudentRecords" },
        { key: "reports",   label: "SQRT rescue reports", icon: "activity", page: "clinicSqrtRescueReports" }
      ]
    },
    admin: {
      badge: { cls: "admin", icon: "lock", label: "Administrator" },
      items: [
        { key: "dashboard", label: "Dashboard",     icon: "home",  page: "adminDashboard" },
        { key: "accounts",  label: "User accounts", icon: "users", page: "adminUserAccounts" },
        { key: "logs",      label: "Access logs",   icon: "clock", page: "adminAccessLogs" }
      ]
    }
  };

  function sidebarHtml(role, active) {
    var cfg = ROLES[role];
    var nav = cfg.items.map(function (it) {
      return '<a class="nav__item' + (it.key === active ? " is-active" : "") + '" href="' + CARE.url(it.page) + '"' +
        (it.key === active ? ' aria-current="page"' : "") + ">" + CARE.icons.html(it.icon) + "<span>" + it.label + "</span></a>";
    }).join("");
    return (
      '<div class="brand">' +
        '<div class="brand__mark">CARE</div>' +
        '<div class="brand__sub">Campus Assistance &amp; Response Environment</div>' +
        '<div class="brand__loc">CTU - Consolacion Campus</div>' +
      "</div>" +
      '<div class="role-badge role-badge--' + cfg.badge.cls + '">' + CARE.icons.html(cfg.badge.icon) + "<span>" + cfg.badge.label + "</span></div>" +
      '<nav class="nav" aria-label="Main">' + nav + "</nav>" +
      '<div class="sidebar__foot">' +
        '<div class="user" id="sidebar-user">' +
          '<div class="user__avatar" id="user-initials"></div>' +
          '<div><div class="user__name" id="user-name"></div><div class="user__meta" id="user-meta"></div></div>' +
        "</div>" +
        '<button type="button" class="signout" id="signout">' + CARE.icons.html("log-out") + "<span>Sign Out</span></button>" +
      "</div>"
    );
  }

  function paintUser() {
    var u = CARE.session.user();
    var $ = CARE.ui.$;
    if (!u) { $("#sidebar-user").style.visibility = "hidden"; return; }
    var roleLabel = { sqrt: "SQRT responder", clinic: "Clinic Staff", admin: "Administrator" }[u.role] || "";
    $("#user-initials").textContent = CARE.ui.initials(u.name);
    $("#user-name").textContent = u.name || "";
    $("#user-meta").textContent = [roleLabel, u.code].filter(Boolean).join(" · ");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var body = document.body, role = body.getAttribute("data-role");
    if (!role || !ROLES[role]) return;
    if (!CARE.session.guard(role)) return;

    var aside = document.getElementById("sidebar");
    if (aside) {
      aside.innerHTML = sidebarHtml(role, body.getAttribute("data-nav"));
      paintUser();
      document.getElementById("signout").addEventListener("click", function () {
        var done = function () { CARE.session.clear(); CARE.go(role === "admin" ? "adminSignIn" : "signIn"); };
        CARE.api.signOut().then(done, done);
      });
    }

    CARE.ui.$$("[data-back]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (window.history.length > 1 && document.referrer) window.history.back();
        else CARE.go(btn.getAttribute("data-back"));
      });
    });
  });
})();
