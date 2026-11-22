(function () {
  "use strict";
  var cfg = window.LM_CONFIG || {};
  var $ = function (id) { return document.getElementById(id); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Missing photo fallback ---------- */
  function markMissing(img) {
    var frame = img.closest(".frame");
    if (frame) frame.classList.add("is-missing");
  }
  document.querySelectorAll("img").forEach(function (img) {
    if (img.complete && img.naturalWidth === 0 && img.getAttribute("src") !== "data:,") markMissing(img);
    img.addEventListener("error", function () { markMissing(img); });
  });

  /* ---------- Hero slideshow ---------- */
  (function heroSlideshow() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var controls = $("hero-controls");
    if (slides.length < 2 || !controls) return;
    var DELAY = 6000;
    var cur = 0, timer = null, playing = !reduceMotion;
    var pauseBtn = $("hero-pause"), capText = $("hero-caption-text"), count = $("hero-count"), cap = $("hero-caption"), bar = $("hero-progress");
    document.documentElement.style.setProperty("--slide-ms", DELAY + "ms");

    function load(slide) {
      slide.querySelectorAll("img[data-src]").forEach(function (img) {
        img.addEventListener("error", function () { slide.dataset.broken = "1"; }, { once: true });
        img.src = img.getAttribute("data-src");
        img.removeAttribute("data-src");
      });
    }
    function restartBar() {
      bar.classList.remove("is-running", "is-paused");
      void bar.offsetWidth; // restart the CSS animation
      if (playing) bar.classList.add("is-running");
    }
    function go(i, fromUser) {
      var n = slides.length;
      i = (i + n) % n;
      var guard = 0;
      while (slides[i].dataset.broken && guard++ < n) i = (i + (fromUser === -1 ? -1 : 1) + n) % n;
      load(slides[i]);
      slides[cur].classList.remove("is-active");
      slides[cur].setAttribute("aria-hidden", "true");
      slides[i].classList.add("is-active");
      slides[i].removeAttribute("aria-hidden");
      cur = i;
      cap.setAttribute("aria-live", fromUser ? "polite" : "off");
      capText.textContent = slides[i].dataset.caption || "";
      count.textContent = (i + 1) + " / " + n;
      load(slides[(i + 1) % n]); // preload the next photo
      schedule();
    }
    function schedule() {
      clearTimeout(timer);
      restartBar();
      if (playing) timer = setTimeout(function () { go(cur + 1); }, DELAY);
    }
    function setPlaying(p) {
      playing = p;
      pauseBtn.classList.toggle("is-paused", !p);
      pauseBtn.setAttribute("aria-label", p ? "Pause slideshow" : "Play slideshow");
      schedule();
    }

    controls.hidden = false;
    pauseBtn.classList.toggle("is-paused", !playing);
    pauseBtn.setAttribute("aria-label", playing ? "Pause slideshow" : "Play slideshow");
    $("hero-prev").addEventListener("click", function () { go(cur - 1, -1); });
    $("hero-next").addEventListener("click", function () { go(cur + 1, 1); });
    pauseBtn.addEventListener("click", function () { setPlaying(!playing); });

    // Pause while the tab is hidden or the hero is scrolled out of view, to save data and battery.
    var visible = true;
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { clearTimeout(timer); bar.classList.add("is-paused"); }
      else if (visible) schedule();
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (!visible) { clearTimeout(timer); bar.classList.add("is-paused"); }
        else if (!document.hidden) schedule();
      }).observe(document.querySelector(".hero"));
    }

    // Swipe left/right on the hero to change photo.
    var hero = document.querySelector(".hero"), sx = null, sy = null;
    hero.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    hero.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5 && !e.target.closest("a, button")) go(cur + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
      sx = sy = null;
    });

    // Start loading the second photo once the page has finished loading.
    if (document.readyState === "complete") load(slides[1]);
    else window.addEventListener("load", function () { load(slides[1]); });
    schedule();
  })();

  /* ---------- Header: solid background after scrolling ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() { header.classList.toggle("is-solid", window.scrollY > 40); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var menuBtn = $("menu-btn"), nav = $("site-nav");
  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    if (open) header.classList.add("is-solid"); else onScroll();
  }
  menuBtn.addEventListener("click", function () {
    var open = menuBtn.getAttribute("aria-expanded") !== "true";
    setMenu(open);
    if (open) { var first = nav.querySelector("a"); if (first) first.focus(); }
  });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true") { setMenu(false); menuBtn.focus(); }
  });
  window.matchMedia("(min-width: 960px)").addEventListener("change", function () { setMenu(false); });

  /* ---------- Configuration states ---------- */
  var waNumber = String(cfg.whatsappNumber || "").replace(/\D/g, "");
  var sendBtn = $("wa-send");
  if (!waNumber) {
    $("config-msg").hidden = false;
    sendBtn.setAttribute("aria-disabled", "true");
    sendBtn.removeAttribute("href");
  }
  var contact = [];
  if (cfg.phone) contact.push('Phone: <a href="tel:' + String(cfg.phone).replace(/[^\d+]/g, "") + '">' + escapeHtml(cfg.phone) + "</a>");
  if (cfg.email) contact.push('Email: <a href="mailto:' + escapeHtml(cfg.email) + '">' + escapeHtml(cfg.email) + "</a>");
  if (contact.length) { $("contact-fallback").innerHTML = "Prefer another way? " + contact.join(" &middot; "); $("contact-fallback").hidden = false; }
  if (cfg.mapLink && /^https:\/\//.test(cfg.mapLink)) $("map-link").href = cfg.mapLink;

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }

  /* ---------- Enquiry form ---------- */
  var form = $("enquiry-form"), review = $("review"), reviewText = $("review-text");
  function iso(d) { var m = d.getMonth() + 1, day = d.getDate(); return d.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (day < 10 ? "0" : "") + day; }
  var today = iso(new Date());
  $("checkin").min = today;
  $("checkout").min = today;
  $("checkin").addEventListener("change", function () {
    if (!this.value) return;
    var next = new Date(this.value + "T00:00:00"); next.setDate(next.getDate() + 1);
    $("checkout").min = iso(next);
  });

  function toggleAges() { $("ages-field").hidden = !(Number($("children").value) > 0); }
  $("children").addEventListener("input", toggleAges);
  toggleAges();

  function setErr(id, msg) {
    var input = $(id), err = $(id + "-err");
    err.textContent = msg || "";
    if (msg) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid");
    return !msg;
  }
  function checkInt(id, min, max, label) {
    var raw = $(id).value.trim();
    if (!/^\d+$/.test(raw)) return setErr(id, label + " must be a whole number.");
    var n = Number(raw);
    if (n < min || n > max) return setErr(id, label + " must be between " + min + " and " + max + ".");
    return setErr(id, "");
  }
  function validate() {
    var ci = $("checkin").value, co = $("checkout").value, firstBad = null;
    var checks = [
      ["checkin", !ci ? "Choose an arrival date." : ci < today ? "The arrival date can't be in the past." : ""],
      ["checkout", !co ? "Choose a departure date." : (ci && co <= ci) ? "The departure date must be after the arrival date." : ""]
    ];
    checks.forEach(function (c) { if (!setErr(c[0], c[1]) && !firstBad) firstBad = c[0]; });
    [["adults", 1, 20, "Adults"], ["children", 0, 20, "Children"], ["rooms", 1, 10, "Rooms"]].forEach(function (c) {
      if (!checkInt(c[0], c[1], c[2], c[3]) && !firstBad) firstBad = c[0];
    });
    if (firstBad) $(firstBad).focus();
    return !firstBad;
  }
  function niceDate(v) {
    var p = v.split("-");
    return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
  }
  function buildMessage() {
    var kids = Number($("children").value);
    var ages = kids > 0 ? $("ages").value.replace(/\s+/g, " ").trim() : "";
    return "Hello Little Mermaid - Houseboat Cruise, I'd like to enquire about a stay.\n\n" +
      "Check-in: " + niceDate($("checkin").value) + "\n" +
      "Check-out: " + niceDate($("checkout").value) + "\n" +
      "Adults: " + $("adults").value + "\n" +
      "Children: " + kids + "\n" +
      (ages ? "Children's ages: " + ages + "\n" : "") +
      "Rooms: " + $("rooms").value + "\n\n" +
      "Please confirm availability and the total price. Thank you.";
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate()) return;
    var msg = buildMessage();
    reviewText.textContent = msg;
    if (waNumber) sendBtn.href = "https://wa.me/" + waNumber + "?text=" + encodeURIComponent(msg);
    review.hidden = false;
    review.focus({ preventScroll: true });
    review.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  });
  form.addEventListener("input", function () { review.hidden = true; });
  $("edit-btn").addEventListener("click", function () { review.hidden = true; $("checkin").focus(); });

  /* ---------- Gallery layout, filters, lightbox ---------- */
  var items = Array.prototype.slice.call(document.querySelectorAll("#gallery-list li"));
  items.forEach(function (li, i) {
    var img = li.querySelector("img");
    var w = +img.getAttribute("width"), h = +img.getAttribute("height");
    if (i === 0) li.classList.add("is-big");
    else if (h > w) li.classList.add("is-tall");
    else if (w / h > 1.6) li.classList.add("is-wide");
  });

  var status = $("gallery-status");
  document.querySelectorAll(".filter").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = btn.dataset.filter, shown = 0;
      document.querySelectorAll(".filter").forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
      items.forEach(function (li) {
        var match = f === "all" || li.dataset.cat === f;
        li.hidden = !match;
        if (match) shown++;
      });
      status.textContent = "Showing " + shown + " photo" + (shown === 1 ? "" : "s") + ".";
    });
  });

  var dlg = $("lightbox"), lbImg = $("lb-img"), lbCap = $("lb-caption"), lbCount = $("lb-count");
  var current = [], idx = 0, opener = null;
  function show(i) {
    idx = (i + current.length) % current.length;
    var li = current[idx], img = li.querySelector("img");
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = li.querySelector("figcaption").textContent;
    lbCount.textContent = (idx + 1) + " / " + current.length;
  }
  items.forEach(function (li) {
    var btn = li.querySelector(".g-btn");
    btn.setAttribute("aria-label", "Open photo: " + li.querySelector("figcaption").textContent);
    btn.addEventListener("click", function () {
      current = items.filter(function (x) { return !x.hidden; });
      opener = btn;
      show(current.indexOf(li));
      if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
      $("lb-close").focus();
    });
  });
  function closeLb() { if (dlg.open) { if (dlg.close) dlg.close(); else dlg.removeAttribute("open"); } }
  $("lb-close").addEventListener("click", closeLb);
  $("lb-prev").addEventListener("click", function () { show(idx - 1); });
  $("lb-next").addEventListener("click", function () { show(idx + 1); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg || e.target.classList.contains("lb-inner")) closeLb(); });
  dlg.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") { e.preventDefault(); show(idx - 1); }
    if (e.key === "ArrowRight") { e.preventDefault(); show(idx + 1); }
  });
  dlg.addEventListener("close", function () { if (opener) opener.focus(); });
  var touchX = null;
  dlg.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  dlg.addEventListener("touchend", function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if (!reduceMotion && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }
})();
