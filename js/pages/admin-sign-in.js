/* admin-sign-in.js – administrator sign-in */
(function () {
  var $ = CARE.ui.$, ui = CARE.ui;
  var form = $("#admin-form"), error = $("#form-error"), btn = $("#submit-btn");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var username = form.username.value.trim(), password = form.password.value;
    if (!username || !password) { error.textContent = "Enter your username and password."; return; }
    error.textContent = "";

    ui.busy(btn, CARE.api.signIn({ role: "admin", username: username, password: password })).then(function (res) {
      CARE.session.set(res.user);
      if (res.mustChangePassword) { CARE.go("newPassword"); return; }
      CARE.go("adminDashboard");
    }).catch(function (err) {
      error.textContent = err.message || "Sign in failed. Check your username and password.";
    });
  });
})();
