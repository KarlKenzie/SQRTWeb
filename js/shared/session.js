/* ==========================================================================
   CARE – session.js
   Keeps the signed-in user ({ name, code, role }) in sessionStorage so the
   sidebar can show it. The back end is the real source of truth; this is only
   a display cache. Page guards use it when CARE.config.REQUIRE_AUTH is true.
   ========================================================================== */
(function () {
  var KEY = "care.user";
  var FLASH = "care.flash";

  function read(store, key) {
    try { return JSON.parse(store.getItem(key)); } catch (e) { return null; }
  }

  CARE.session = {
    user: function () { return read(window.sessionStorage, KEY); },
    set: function (user) { try { sessionStorage.setItem(KEY, JSON.stringify(user)); } catch (e) {} },
    clear: function () { try { sessionStorage.removeItem(KEY); } catch (e) {} },

    /* One-time values passed to the next page (e.g. the password shown once). */
    flash: function (key, value) {
      var all = read(window.sessionStorage, FLASH) || {};
      all[key] = value;
      try { sessionStorage.setItem(FLASH, JSON.stringify(all)); } catch (e) {}
    },
    takeFlash: function (key) {
      var all = read(window.sessionStorage, FLASH) || {};
      var v = all[key];
      delete all[key];
      try { sessionStorage.setItem(FLASH, JSON.stringify(all)); } catch (e) {}
      return v;
    },

    /* Redirect away if the page needs a role the user does not have. */
    guard: function (role) {
      if (!CARE.config.REQUIRE_AUTH) return true;
      var u = CARE.session.user();
      if (!u || (role && u.role !== role)) {
        CARE.go(role === "admin" ? "adminSignIn" : "signIn");
        return false;
      }
      return true;
    }
  };
})();
