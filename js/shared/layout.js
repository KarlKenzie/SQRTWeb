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
        { key: "dashboard", label: "Dashboard",      short: "Dashboard", icon: "home",      page: "sqrtDashboard" },
        { key: "search",    label: "Search",         short: "Search",    icon: "search",    page: "sqrtStudentSearch" },
        { key: "reports",   label: "Rescue reports", short: "Reports",   icon: "file-text", page: "sqrtRescueReports" }
      ]
    },
    clinic: {
      badge: { cls: "clinic", icon: "shield-plus", label: "Clinic Staff" },
      items: [
        { key: "dashboard", label: "Dashboard",           short: "Dashboard", icon: "home",     page: "clinicDashboard" },
        { key: "records",   label: "Student records",     short: "Records",   icon: "users",    page: "clinicStudentRecords" },
        { key: "reports",   label: "SQRT rescue reports", short: "Reports",   icon: "activity", page: "clinicSqrtRescueReports" }
      ]
    },
    admin: {
      badge: { cls: "admin", icon: "lock", label: "Administrator" },
      items: [
        { key: "dashboard", label: "Dashboard",     short: "Dashboard", icon: "home",  page: "adminDashboard" },
        { key: "accounts",  label: "User accounts", short: "User",      icon: "users", page: "adminUserAccounts" },
        { key: "logs",      label: "Access logs",   short: "Access",    icon: "clock", page: "adminAccessLogs" }
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
      '<button type="button" class="sidebar__close" id="nav-close" aria-label="Close menu">&times;</button>' +
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

  /* Bottom tab bar shown on phones and small tablets (the sidebar is hidden there) */
  function tabbarHtml(role, active) {
    var items = ROLES[role].items.map(function (it) {
      var on = it.key === active;
      return '<a class="tabbar__item' + (on ? " is-active" : "") + '" href="' + CARE.url(it.page) + '"' + (on ? ' aria-current="page"' : "") + ">" +
        CARE.icons.html(it.icon) + "<span>" + it.short + "</span></a>";
    }).join("");
    return items + '<button type="button" class="tabbar__item" id="tabbar-signout">' + CARE.icons.html("log-out") + "<span>Sign out</span></button>";
  }

  function paintUser() {
    var u = CARE.session.user();
    var $ = CARE.ui.$;
    if (!u) { $("#sidebar-user").hidden = true; return; }
    $("#sidebar-user").hidden = false;
    var roleLabel = { sqrt: "SQRT responder", clinic: "Clinic Staff", admin: "Administrator" }[u.role] || "";
    $("#user-initials").textContent = CARE.ui.initials(u.name);
    $("#user-name").textContent = u.name || "";
    $("#user-meta").textContent = [roleLabel, u.code].filter(Boolean).join(" · ");
  }

  /* ---- Mobile menu: 3-line button in the header opens the sidebar drawer ---- */
  var MOBILE_MQ = "(max-width: 1100px)";

  function setNav(open) {
    var btn = document.getElementById("menu-btn");
    document.body.classList.toggle("nav-open", open);
    if (btn) { btn.setAttribute("aria-expanded", open ? "true" : "false"); btn.setAttribute("aria-label", open ? "Close menu" : "Open menu"); }
    var aside = document.getElementById("sidebar");
    if (aside) { if (open) aside.removeAttribute("inert"); else if (window.matchMedia(MOBILE_MQ).matches) aside.setAttribute("inert", ""); }
  }

  function initMobileNav() {
    var header = document.querySelector(".header");
    var aside = document.getElementById("sidebar");
    if (!header || !aside || document.getElementById("menu-btn")) return;

    var btn = document.createElement("button");
    btn.type = "button"; btn.id = "menu-btn"; btn.className = "menu-btn";
    btn.setAttribute("aria-label", "Open menu"); btn.setAttribute("aria-controls", "sidebar"); btn.setAttribute("aria-expanded", "false");
    btn.innerHTML = "<span></span><span></span><span></span>";
    header.insertBefore(btn, header.firstChild);

    var scrim = document.createElement("div");
    scrim.className = "scrim"; scrim.id = "scrim";
    document.body.appendChild(scrim);

    btn.addEventListener("click", function () { setNav(!document.body.classList.contains("nav-open")); });
    scrim.addEventListener("click", function () { setNav(false); });
    var close = document.getElementById("nav-close");
    if (close) close.addEventListener("click", function () { setNav(false); btn.focus(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && document.body.classList.contains("nav-open")) { setNav(false); btn.focus(); } });
    aside.addEventListener("click", function (e) { if (e.target.closest && e.target.closest(".nav__item")) setNav(false); });

    var mq = window.matchMedia(MOBILE_MQ);
    var onChange = function () { if (!mq.matches) { document.body.classList.remove("nav-open"); aside.removeAttribute("inert"); btn.setAttribute("aria-expanded", "false"); } else if (!document.body.classList.contains("nav-open")) aside.setAttribute("inert", ""); };
    if (mq.addEventListener) mq.addEventListener("change", onChange); else if (mq.addListener) mq.addListener(onChange);
    onChange();
  }

  /* ---- Tables become stacked cards on phones: copy each column title onto its cell ---- */
  var HEAD_SEL = ".table__head, .atable__head, .reports__head";
  var ROW_SEL = ".table__row, .atable__row, .reports__row";

  function labelRows() {
    var head = document.querySelector(HEAD_SEL);
    if (!head) return;
    var labels = Array.prototype.map.call(head.children, function (c) { return (c.textContent || "").trim(); });
    Array.prototype.forEach.call(document.querySelectorAll(ROW_SEL), function (row) {
      Array.prototype.forEach.call(row.children, function (cell, i) {
        if (labels[i] !== undefined && cell.getAttribute("data-label") !== labels[i]) cell.setAttribute("data-label", labels[i]);
      });
    });
  }

  function initTableLabels() {
    if (!document.querySelector(HEAD_SEL)) return;
    labelRows();
    var rows = document.getElementById("rows");
    if (rows && window.MutationObserver) new MutationObserver(labelRows).observe(rows, { childList: true });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var body = document.body, role = body.getAttribute("data-role");
    if (!role || !ROLES[role]) return;
    if (!CARE.session.guard(role)) return;

    var aside = document.getElementById("sidebar");
    if (aside) {
      aside.innerHTML = sidebarHtml(role, body.getAttribute("data-nav"));
      paintUser();
      initMobileNav();
      var doSignOut = function () {
        var done = function () { CARE.session.clear(); CARE.go(role === "admin" ? "adminSignIn" : "signIn"); };
        CARE.api.signOut().then(done, done);
      };
      document.getElementById("signout").addEventListener("click", doSignOut);

      var bar = document.createElement("nav");
      bar.className = "tabbar"; bar.setAttribute("aria-label", "Main");
      bar.innerHTML = tabbarHtml(role, body.getAttribute("data-nav"));
      body.appendChild(bar);
      CARE.icons.render(bar);
      document.getElementById("tabbar-signout").addEventListener("click", doSignOut);
    }

    initTableLabels();

    CARE.ui.$$("[data-back]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (window.history.length > 1 && document.referrer) window.history.back();
        else CARE.go(btn.getAttribute("data-back"));
      });
    });
  });
})();
