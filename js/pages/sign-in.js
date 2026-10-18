/* sign-in.js – SQRT Responder / Clinic Staff sign-in */
(function () {
  var $ = CARE.ui.$, ui = CARE.ui;
  var form = $("#sign-in-form"), error = $("#form-error"), btn = $("#submit-btn");
  var role = "sqrt";
  var LABEL = { sqrt: "SQRT Responder", clinic: "Clinic Staff" };

  ui.$$(".tabs__btn").forEach(function (tab) {
    tab.addEventListener("click", function () {
      role = tab.getAttribute("data-role");
      ui.$$(".tabs__btn").forEach(function (t) {
        var on = t === tab;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      });
      btn.textContent = "Sign in as " + LABEL[role];
      error.textContent = "";
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var username = form.username.value.trim(), password = form.password.value;
    if (!username || !password) { error.textContent = "Enter your username and password."; return; }
    error.textContent = "";

    ui.busy(btn, CARE.api.signIn({ role: role, username: username, password: password })).then(function (res) {
      CARE.session.set(res.user);
      if (res.mustChangePassword) { CARE.go("newPassword"); return; }
      CARE.go(CARE.home[res.user.role] || "signIn");
    }).catch(function (err) {
      error.textContent = err.code === "NOT_CONNECTED" ? err.message : (err.message || "Sign in failed. Check your username and password.");
    });
  });
})();
