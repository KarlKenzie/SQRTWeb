/* forgot-password.js – school ID + Gmail must match an account; the server generates a new
   password and it is shown once in a pop-up. Nothing is generated or checked in the browser. */
(function () {
  var $ = CARE.ui.$, ui = CARE.ui;
  var form = $("#forgot-form"), error = $("#form-error"), btn = $("#submit-btn");
  var GMAIL = /^[^\s@]+@gmail\.com$/i;

  var prefill = ui.param("schoolId");
  if (prefill) form.schoolId.value = prefill;

  form.schoolId.addEventListener("input", function () { form.schoolId.value = form.schoolId.value.replace(/\s+/g, ""); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var schoolId = form.schoolId.value.trim();
    var email = form.email.value.trim().toLowerCase();
    form.schoolId.classList.toggle("is-invalid", !schoolId);
    form.email.classList.toggle("is-invalid", !GMAIL.test(email));
    if (!schoolId) { error.textContent = "Enter your school ID."; form.schoolId.focus(); return; }
    if (!GMAIL.test(email)) {
      error.textContent = email.indexOf("@") === -1 ? "Add @gmail.com at the end of your email." : "Email must be a Gmail address ending in @gmail.com.";
      form.email.focus(); return;
    }
    error.textContent = "";

    ui.busy(btn, CARE.api.resetPassword({ schoolId: schoolId, email: email })).then(function (res) {
      $("#new-pw").textContent = (res && res.password) || "";
      $("#overlay").hidden = false;
      $("#copy-pw").focus();
    }).catch(function (err) {
      /* One message for every mismatch so nobody can learn which IDs or emails exist. */
      error.textContent = err.code === "NOT_CONNECTED" ? err.message
        : err.code === "NO_MATCH" ? "The school ID and Gmail address do not match an account."
        : (err.message || "A new password could not be generated.");
    });
  });

  $("#copy-pw").addEventListener("click", function () {
    var text = $("#new-pw").textContent, b = this;
    var done = function () { b.textContent = "Copied"; setTimeout(function () { b.textContent = "Copy password"; }, 1800); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () {});
    else { var r = document.createRange(); r.selectNodeContents($("#new-pw")); var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r); try { document.execCommand("copy"); done(); } catch (x) {} }
  });
})();
