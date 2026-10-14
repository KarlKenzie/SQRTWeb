/* Shared helpers: talks to the CARE server and passes small bits of
   state between pages. Every page loads this file first. */
(function (w) {
  "use strict";

  // Same origin as the page. Change this if the API runs somewhere else.
  var BASE = "";

  function request(method, path, body) {
    var opts = {
      method: method,
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" }
    };
    if (body !== undefined) opts.body = JSON.stringify(body);

    return fetch(BASE + path, opts)
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          return { ok: res.ok, status: res.status, data: data };
        });
      })
      .catch(function () {
        return {
          ok: false,
          status: 0,
          data: { error: "Cannot reach the server. Check your connection and try again." }
        };
      });
  }

  // sessionStorage wrapper (cleared when the tab closes).
  var flash = {
    set: function (key, value) {
      try { sessionStorage.setItem("care." + key, value); } catch (e) {}
    },
    get: function (key) {
      try { return sessionStorage.getItem("care." + key); } catch (e) { return null; }
    },
    clear: function (key) {
      try { sessionStorage.removeItem("care." + key); } catch (e) {}
    }
  };

  w.CareApi = {
    get: function (path) { return request("GET", path); },
    post: function (path, body) { return request("POST", path, body || {}); },
    flash: flash
  };
})(window);
