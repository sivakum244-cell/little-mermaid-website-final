(function () {
  var cfg = window.LM_CONFIG || {};
  var $ = function (id) { return document.getElementById(id); };

  /* Mobile menu */
  var btn = $("menu-btn"), nav = $("site-nav");
  var mq = window.matchMedia("(min-width: 880px)");
  function setMenu(open) {
    nav.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", String(open));
  }
  btn.addEventListener("click", function () { setMenu(btn.getAttribute("aria-expanded") !== "true"); });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") { setMenu(false); btn.focus(); }
  });
  mq.addEventListener("change", function () { setMenu(false); });

  /* Enquiry form */
  var form = $("enquiry"), review = $("review"), text = $("review-text"), send = $("wa-send");
  var configured = !!cfg.whatsapp;
  if (!configured) {
    $("config-msg").hidden = false;
    // Header/footer CTAs still scroll to the form, which shows the setup message.
    send.setAttribute("aria-disabled", "true");
    send.removeAttribute("href");
  }

  function iso(d) { var m = d.getMonth() + 1, day = d.getDate(); return d.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (day < 10 ? "0" : "") + day; }
  var today = iso(new Date());
  $("checkin").min = today;
  $("checkout").min = today;
  $("checkin").addEventListener("change", function () { if (this.value) $("checkout").min = this.value; });

  function fmt(v) {
    var p = v.split("-");
    return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  }
  function setErr(id, msg) {
    var el = $(id), err = $(id + "-err");
    err.textContent = msg || "";
    if (msg) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid");
    return !msg;
  }
  function intIn(id, min, max, label) {
    var raw = $(id).value.trim(), n = Number(raw);
    if (raw === "" || !/^\d+$/.test(raw)) return setErr(id, label + " must be a whole number.");
    if (n < min || n > max) return setErr(id, label + " must be between " + min + " and " + max + ".");
    return setErr(id, "");
  }
  function validate() {
    var ci = $("checkin").value, co = $("checkout").value, ok = true, first = null;
    var results = [
      ["checkin", !ci ? "Choose an arrival date." : ci < today ? "Arrival date can't be in the past." : ""],
      ["checkout", !co ? "Choose a departure date." : (ci && co <= ci) ? "Departure must be after arrival." : ""]
    ];
    results.forEach(function (r) { if (!setErr(r[0], r[1])) { ok = false; first = first || r[0]; } });
    [["adults", 1, 20, "Adults"], ["children", 0, 20, "Children"], ["rooms", 1, 10, "Rooms"]].forEach(function (r) {
      if (!intIn(r[0], r[1], r[2], r[3])) { ok = false; first = first || r[0]; }
    });
    if (first) $(first).focus();
    return ok;
  }
  function agesText() {
    return Number($("children").value) > 0 ? $("ages").value.replace(/\s+/g, " ").trim() : "";
  }
  function toggleAges() { $("ages-field").hidden = !(Number($("children").value) > 0); }
  $("children").addEventListener("input", toggleAges);
  toggleAges();
  function message() {
    return "Hello " + (cfg.name || "Little Mermaid - Houseboat Cruise") + ", I'd like to enquire about a stay.\n\n" +
      "Check-in: " + fmt($("checkin").value) + "\n" +
      "Check-out: " + fmt($("checkout").value) + "\n" +
      "Adults: " + $("adults").value + "\n" +
      "Children: " + $("children").value + "\n" +
      (agesText() ? "Children's ages: " + agesText() + "\n" : "") +
      "Rooms: " + $("rooms").value + "\n\n" +
      "Please confirm availability and the total price. Thank you.";
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate()) return;
    var msg = message();
    text.textContent = msg;
    if (configured) send.href = "https://wa.me/" + cfg.whatsapp + "?text=" + encodeURIComponent(msg);
    review.hidden = false;
    review.focus();
    review.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
  $("edit-btn").addEventListener("click", function () { review.hidden = true; $("checkin").focus(); });
  form.addEventListener("input", function () { review.hidden = true; });

  /* Lightbox */
  var items = Array.prototype.slice.call(document.querySelectorAll(".g-item"));
  if (items.length) {
    var dlg = $("lightbox"), img = $("lb-img"), idx = 0, opener = null;
    var show = function (i) {
      idx = (i + items.length) % items.length;
      img.src = items[idx].dataset.full;
      img.alt = items[idx].dataset.alt || "";
    };
    items.forEach(function (it, i) {
      it.addEventListener("click", function () { opener = it; show(i); dlg.showModal(); $("lb-close").focus(); });
    });
    $("lb-prev").addEventListener("click", function () { show(idx - 1); });
    $("lb-next").addEventListener("click", function () { show(idx + 1); });
    $("lb-close").addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
    dlg.addEventListener("close", function () { if (opener) opener.focus(); });
  }
})();
