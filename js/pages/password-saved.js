/* password-saved.js – shows the password once, then forgets it */
(function () {
  var shown = CARE.session.takeFlash("newPassword");
  if (shown) CARE.ui.$("#saved-password").textContent = shown;

  /* Administrators sign in on their own page. */
  var user = CARE.session.user();
  if (user && user.role === "admin") CARE.ui.$("#sign-in-link").setAttribute("href", CARE.url("adminSignIn"));
})();
