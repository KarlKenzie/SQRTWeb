/* Password saved page (save-password.html) */
(function () {
  "use strict";

  var pwEl = document.getElementById("saved-password");
  var link = document.getElementById("signin-link");

  var saved = CareApi.flash.get("savedPassword");

  // Opened directly with nothing just saved: go back to sign in.
  if (!saved) {
    location.replace("index.html");
    return;
  }

  pwEl.textContent = saved;

  // Once they leave this page, don't keep the password around.
  link.addEventListener("click", function () {
    CareApi.flash.clear("savedPassword");
  });
  window.addEventListener("pagehide", function () {
    CareApi.flash.clear("savedPassword");
  });
})();
