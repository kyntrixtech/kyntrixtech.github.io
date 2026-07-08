/*
 * Kyntrix theme switcher.
 * Each theme is a parallel set of pages; this script
 *  1. redirects the generic entry pages (default theme) to the visitor's saved theme,
 *  2. remembers an explicitly-visited theme URL as the new preference,
 *  3. renders a floating switcher that jumps to the equivalent page in the chosen theme.
 */
(function () {
  "use strict";

  var KEY = "kyntrix-theme";

  var THEMES = {
    "default": {
      label: "Default",
      dot: "#f5f5f7",
      ring: "#1d1d1f",
      pages: { home: "index.html", newsletter: "newsletter.html", thanks: "thanks.html" }
    },
    "prairie": {
      label: "Prairie Gold",
      dot: "#d9a441",
      ring: "#152a42",
      pages: { home: "index-prairie.html", newsletter: "newsletter-prairie.html", thanks: "thanks-prairie.html" }
    },
    "blueprint": {
      label: "Blueprint",
      dot: "#1d4e89",
      ring: "#c6301c",
      pages: { home: "index-blueprint.html", newsletter: "newsletter-blueprint.html", thanks: "thanks-blueprint.html" }
    },
    "wildrose": {
      label: "Wild Rose",
      dot: "#b34a5e",
      ring: "#1e3a31",
      pages: { home: "index-wildrose.html", newsletter: "newsletter-wildrose.html", thanks: "thanks-wildrose.html" }
    }
  };

  /* ---- identify the current page ---- */
  var file = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  if (file === "") file = "index.html";
  var current = null;
  Object.keys(THEMES).forEach(function (t) {
    Object.keys(THEMES[t].pages).forEach(function (p) {
      if (THEMES[t].pages[p] === file) current = { theme: t, page: p };
    });
  });
  if (!current) return; // not a themed page — do nothing

  function getSaved() {
    try {
      var v = localStorage.getItem(KEY);
      return THEMES[v] ? v : null;
    } catch (e) { return null; }
  }
  function setSaved(t) {
    try { localStorage.setItem(KEY, t); } catch (e) { /* private mode etc. */ }
  }

  /* ---- routing rules ----
     Generic (default-theme) URLs honour the saved preference;
     explicit themed URLs win and update the preference. */
  if (current.theme === "default") {
    var saved = getSaved();
    if (saved && saved !== "default") {
      // keep any query string / hash (e.g. params appended by the Apps Script redirect)
      location.replace(THEMES[saved].pages[current.page] + location.search + location.hash);
      return;
    }
  } else {
    setSaved(current.theme);
  }

  /* ---- the switcher widget ---- */
  function build() {
    var css = "" +
      ".ktw{position:fixed;right:18px;bottom:18px;z-index:9999;font-family:-apple-system,'Segoe UI',Arial,sans-serif}" +
      ".ktw-toggle{display:flex;align-items:center;gap:9px;padding:10px 16px;border-radius:999px;border:1px solid rgba(255,255,255,.25);background:rgba(19,23,27,.93);color:#fff;font-size:13px;font-weight:600;letter-spacing:.02em;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.35)}" +
      ".ktw-toggle:hover{background:rgba(30,35,40,.96)}" +
      ".ktw-dot{width:12px;height:12px;border-radius:50%;flex:none;border:2px solid}" +
      ".ktw-menu{position:absolute;right:0;bottom:calc(100% + 10px);min-width:196px;background:rgba(19,23,27,.97);border:1px solid rgba(255,255,255,.16);border-radius:14px;padding:6px;box-shadow:0 16px 40px rgba(0,0,0,.4)}" +
      ".ktw-menu[hidden]{display:none}" +
      ".ktw-head{padding:7px 12px 5px;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.5)}" +
      ".ktw-option{display:flex;width:100%;align-items:center;gap:10px;padding:9px 12px;border:0;border-radius:9px;background:none;color:#e8eaed;font-size:13px;font-family:inherit;text-align:left;cursor:pointer}" +
      ".ktw-option:hover{background:rgba(255,255,255,.1)}" +
      ".ktw-option[aria-selected='true']{background:rgba(255,255,255,.14);font-weight:700}" +
      ".ktw-option[aria-selected='true'] .ktw-check{margin-left:auto}" +
      ".ktw-check{display:none}" +
      ".ktw-option[aria-selected='true'] .ktw-check{display:inline}" +
      ".ktw-toggle:focus-visible,.ktw-option:focus-visible{outline:2px solid #fff;outline-offset:2px}" +
      "@media print{.ktw{display:none}}";
    var style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    var root = document.createElement("div");
    root.className = "ktw";

    var toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "ktw-toggle";
    toggle.setAttribute("aria-haspopup", "listbox");
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML =
      "<span class='ktw-dot' style='background:" + THEMES[current.theme].dot +
      ";border-color:" + THEMES[current.theme].ring + "'></span>" +
      "<span>Theme · " + THEMES[current.theme].label + "</span>";

    var menu = document.createElement("div");
    menu.className = "ktw-menu";
    menu.setAttribute("role", "listbox");
    menu.setAttribute("aria-label", "Site theme");
    menu.hidden = true;

    var head = document.createElement("div");
    head.className = "ktw-head";
    head.textContent = "Choose a look";
    menu.appendChild(head);

    Object.keys(THEMES).forEach(function (t) {
      var opt = document.createElement("button");
      opt.type = "button";
      opt.className = "ktw-option";
      opt.setAttribute("role", "option");
      opt.setAttribute("aria-selected", t === current.theme ? "true" : "false");
      opt.innerHTML =
        "<span class='ktw-dot' style='background:" + THEMES[t].dot +
        ";border-color:" + THEMES[t].ring + "'></span>" +
        "<span>" + THEMES[t].label + "</span><span class='ktw-check' aria-hidden='true'>✓</span>";
      opt.addEventListener("click", function () {
        if (t === current.theme) { close(); return; }
        setSaved(t);
        location.href = THEMES[t].pages[current.page] + location.hash;
      });
      menu.appendChild(opt);
    });

    function open() {
      menu.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
    }
    function close() {
      menu.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", function () {
      menu.hidden ? open() : close();
    });
    document.addEventListener("click", function (ev) {
      if (!root.contains(ev.target)) close();
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") { close(); toggle.focus(); }
    });

    root.appendChild(toggle);
    root.appendChild(menu);
    document.body.appendChild(root);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
