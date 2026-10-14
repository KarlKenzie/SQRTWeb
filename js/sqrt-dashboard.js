/* SQRT dashboard (placeholder): requires a signed-in session */
(function () {
  "use strict";

  CareApi.get("/api/me").then(function (r) {
    if (!r.ok) { location.replace("index.html"); return; }
    if (r.data.role !== "SQRT Responder") { location.replace(r.data.redirect); return; }
    document.getElementById("who").textContent = r.data.username + " · " + r.data.role;
  });

  document.getElementById("logout").addEventListener("click", function () {
    CareApi.post("/api/logout").then(function () { location.replace("index.html"); });
  });
})();
