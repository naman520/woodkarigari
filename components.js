/**
 * WoodKarigari — components.js
 *
 * Injects shared navbar and footer into every page.
 * Usage in any page:
 *   <div id="site-nav"></div>
 *   ... page content ...
 *   <div id="site-footer"></div>
 *   <script src="/components.js"></script>
 *
 * Requires an HTTP server (won't work with file:// due to fetch CORS).
 */

(async function () {
  const BASE = ""; // set to "" for root-relative paths on any host

  async function inject(id, path) {
    const el = document.getElementById(id);
    if (!el) return;
    try {
      const r = await fetch(BASE + path);
      if (!r.ok) throw new Error(`HTTP ${r.status} — ${path}`);
      el.innerHTML = await r.text();
    } catch (e) {
      console.warn("[components.js] Could not load", path, e.message);
    }
  }

  // Load both in parallel
  await Promise.all([
    inject("site-nav",    "/_navbar.html"),
    inject("site-footer", "/_footer.html"),
  ]);

  // ── Mark active nav link ──────────────────────────────────────────────────
  const current = window.location.pathname.replace(/\/$/, "") || "/";
  document.querySelectorAll("#site-nav a").forEach((a) => {
    const href = a.getAttribute("href")?.replace(/\/$/, "") || "";
    if (href && href !== "#" && href !== "#quote" && current.endsWith(href)) {
      a.classList.add("text-[#bc7e44]");
    }
  });

  // ── Hamburger menu ────────────────────────────────────────────────────────
  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  const iconHam    = document.getElementById("iconHam");
  const iconClose  = document.getElementById("iconClose");

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      const open = mobileMenu.classList.contains("open");
      mobileMenu.classList.toggle("open", !open);
      iconHam  ?.classList.toggle("hidden", !open);
      iconClose?.classList.toggle("hidden",  open);
    });
  }

  // ── Counter animation (for pages that have .counter-val elements) ─────────
  function animateCounter(el) {
    const target   = parseInt(el.getAttribute("data-target"), 10);
    const suffix   = el.getAttribute("data-suffix") || "";
    const duration = 1800;
    const t0       = performance.now();
    (function tick(now) {
      const p      = Math.min((now - t0) / duration, 1);
      const eased  = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }

  const counterObs = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { animateCounter(e.target); counterObs.unobserve(e.target); }
    }),
    { threshold: 0.4 }
  );
  document.querySelectorAll(".counter-val").forEach((el) => counterObs.observe(el));

  // ── FAQ accordion (for pages that have FAQ sections) ─────────────────────
  document.querySelectorAll(".faq-question").forEach((q) => {
    q.addEventListener("click", function () {
      const answer = document.getElementById(this.getAttribute("data-target"));
      const icon   = this.querySelector(".faq-icon");
      const isOpen = !answer.classList.contains("hidden");

      document.querySelectorAll(".faq-answer").forEach((a) => a.classList.add("hidden"));
      document.querySelectorAll(".faq-icon").forEach((i) => {
        i.textContent = "+";
        i.style.transform = "rotate(0deg)";
      });

      if (!isOpen) {
        answer.classList.remove("hidden");
        icon.textContent = "−";
        icon.style.transform = "rotate(180deg)";
      }
    });
  });
})();
