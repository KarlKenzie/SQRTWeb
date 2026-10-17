/* ==========================================================================
   CARE – ui.js
   Small helpers shared by all pages: query string, formatting, escaping,
   toasts, select filling, debounce, modal helpers.
   ========================================================================== */
(function () {
  var MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function toDate(v) { var d = v instanceof Date ? v : new Date(v); return isNaN(d) ? null : d; }

  var ui = {
    $: function (sel, root) { return (root || document).querySelector(sel); },
    $$: function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); },

    param: function (name) { return new URLSearchParams(window.location.search).get(name); },

    esc: function (s) {
      return String(s === undefined || s === null ? "" : s)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    },

    /* "21 Sep 2026" */
    date: function (v) {
      var d = toDate(v); if (!d) return "";
      return pad(d.getDate()) + " " + MONTHS[d.getMonth()] + " " + d.getFullYear();
    },
    /* "21 Sep 2026, 10:28 AM" */
    dateTime: function (v) {
      var d = toDate(v); if (!d) return "";
      var h = d.getHours(), ap = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      return ui.date(d) + ", " + h + ":" + pad(d.getMinutes()) + " " + ap;
    },
    /* "10:28 AM" */
    time: function (v) {
      var d = toDate(v); if (!d) return "";
      var h = d.getHours(), ap = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      return pad(h) + ":" + pad(d.getMinutes()) + " " + ap;
    },
    /* "21 Sep 2026, 10 : 28 AM" – spacing used by the access log table */
    logTime: function (v) {
      var d = toDate(v); if (!d) return "";
      var h = d.getHours(), ap = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      return ui.date(d) + ", " + pad(h) + " : " + pad(d.getMinutes()) + " " + ap;
    },

    initials: function (name) {
      var parts = String(name || "").replace(/^(Engr\.|Dr\.|Mr\.|Ms\.|Mrs\.)\s*/i, "").replace(/,.*$/, "").trim().split(/\s+/);
      if (!parts[0]) return "";
      var first = parts[0].charAt(0), last = parts.length > 1 ? parts[1].charAt(0) : "";
      return (first + last).toUpperCase();
    },
    fullName: function (p) { return p ? [p.firstName, p.lastName].filter(Boolean).join(" ") : ""; },
    lastFirst: function (p) { return p ? [p.lastName, p.firstName].filter(Boolean).join(", ") : ""; },

    debounce: function (fn, ms) {
      var t; return function () { var a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms || 250); };
    },

    /* Fill a <select>. Keeps the first <option> (the "All ..." default). */
    fillSelect: function (select, options, keepFirst) {
      if (!select) return;
      var first = keepFirst === false ? "" : (select.options[0] ? select.options[0].outerHTML : "");
      select.innerHTML = first + options.map(function (o) {
        var v = typeof o === "string" ? o : o.value, l = typeof o === "string" ? o : o.label;
        return '<option value="' + ui.esc(v) + '">' + ui.esc(l) + "</option>";
      }).join("");
    },

    /* Server errors */
    toast: function (message, kind) {
      var stack = document.querySelector(".toast-stack");
      if (!stack) { stack = document.createElement("div"); stack.className = "toast-stack"; document.body.appendChild(stack); }
      var el = document.createElement("div");
      el.className = "toast" + (kind === "error" ? " toast--error" : "");
      el.setAttribute("role", "alert");
      el.textContent = message;
      stack.appendChild(el);
      setTimeout(function () { el.remove(); }, 5000);
    },
    /* Standard handling for a failed API call. */
    fail: function (err) {
      if (window.console) console.warn("[CARE]", err && err.method ? err.method + ":" : "", err && err.message);
      ui.toast((err && err.message) || "Something went wrong. Please try again.", "error");
    },

    emptyRow: function (text) { return '<div class="table__empty">' + ui.esc(text) + "</div>"; },

    reportPill: function (status, outlined, short) {
      var label = (short && CARE.enums.reportStatusShort[status]) || CARE.enums.reportStatus[status] || "";
      if (!label) return "";
      return '<span class="pill pill--' + ui.esc(status) + (outlined ? " pill--line" : "") + '">' + ui.esc(label) + "</span>";
    },

    /* Random password the user can read aloud: no 0/O, 1/l/I. */
    generatePassword: function (length) {
      var chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      var out = "", buf = new Uint32Array(length || 6);
      (window.crypto || window.msCrypto).getRandomValues(buf);
      for (var i = 0; i < buf.length; i++) out += chars[buf[i] % chars.length];
      return out;
    },

    /* Disable a button while a promise runs. */
    busy: function (btn, promise) {
      if (btn) btn.disabled = true;
      var done = function () { if (btn) btn.disabled = false; };
      promise.then(done, done);
      return promise;
    }
  };

  CARE.ui = ui;
})();
