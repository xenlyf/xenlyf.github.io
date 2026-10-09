// Small interaction layer — no framework required.
// Keep the navbar's colors in CSS so theme changes stay consistent.
const header = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  if (header) header.classList.toggle('is-scrolled', window.scrollY > 20);
}, {passive:true});

/* Contact confirmation popup */
window.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("contactModal");
  if (!modal) return;

  const title = document.getElementById("contactModalTitle");
  const detail = document.getElementById("contactModalDetail");
  const icon = document.getElementById("contactModalIcon");
  const proceed = document.getElementById("contactModalProceed");
  const copy = document.getElementById("contactModalCopy");
  let currentValue = "";

  const EMAIL_ICON = '<svg viewBox="0 0 24 24"><path d="M3.5 6.5h17v11h-17z"/><path d="m4 7 8 6 8-6"/></svg>';
  const INSTAGRAM_ICON = '<svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.8" r="1" class="fill"/></svg>';
  const TELEGRAM_ICON = '<svg viewBox="0 0 24 24"><path d="M21 4 3.8 10.8c-.9.35-.88 1.2-.16 1.43l4.4 1.38 1.68 5.24c.22.68.11.95.82.95.55 0 .79-.25 1.08-.54l2.14-2.08 4.45 3.28c.82.45 1.42.22 1.63-.76L22.1 5.2C22.42 3.96 21.7 3.5 21 4Z"/><path d="m8.2 13.55 9.65-6.08-7.62 7.02-.28 3.32"/></svg>';

  const contacts = {
    email: {
      title: "Email",
      detail: "xenlyf@duck.com",
      icon: EMAIL_ICON,
      href: "mailto:xenlyf@duck.com",
      external: false
    },
    instagram: {
      title: "Instagram",
      detail: "@xen.lyf",
      icon: INSTAGRAM_ICON,
      href: "https://www.instagram.com/xen.lyf",
      external: true
    },
    telegram: {
      title: "Telegram",
      detail: "@xenlyf",
      icon: TELEGRAM_ICON,
      href: "https://t.me/xenlyf",
      external: true
    }
  };

  function openModal(type) {
    const item = contacts[type];
    if (!item) return;
    title.textContent = item.title;
    detail.textContent = item.detail;
    icon.innerHTML = item.icon;
    proceed.href = item.href;
    proceed.target = item.external ? "_blank" : "_self";
    proceed.rel = item.external ? "noopener" : "";
    proceed.textContent = "Open";
    copy.style.display = item.external ? "inline-flex" : "inline-flex";
    currentValue = item.detail;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  document.querySelectorAll("[data-contact]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openModal(link.dataset.contact);
    });
  });

  modal.querySelectorAll("[data-close-contact]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(
        currentValue
      );
    } catch {
      await navigator.clipboard.writeText(currentValue);
    }
    copy.textContent = "Copied";
    setTimeout(() => (copy.textContent = "Copy"), 1200);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });
});


/* Bottom tabs: smooth, history-neutral navigation */
(() => {
  const tabs = [...document.querySelectorAll('.tab[data-section]')];
  const sections = tabs.map(t => document.getElementById(t.dataset.section)).filter(Boolean);
  if (!tabs.length || !sections.length) return;

  let navigating = false;
  let frame = 0;

  const setActive = (id) => {
    tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.section === id));
  };

  const ease = t => t < .5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2)/2;

  const goTo = (target) => {
    const nav = document.querySelector('.nav');
    const offset = nav ? nav.getBoundingClientRect().height + 16 : 16;
    const start = window.scrollY;
    const end = Math.max(0, start + target.getBoundingClientRect().top - offset);
    const distance = Math.abs(end - start);
    const duration = Math.min(700, Math.max(360, distance * 0.45));
    const started = performance.now();

    cancelAnimationFrame(frame);
    navigating = true;
    setActive(target.id);

    const step = now => {
      const progress = Math.min(1, (now - started) / duration);
      window.scrollTo(0, start + (end - start) * ease(progress));
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      } else {
        navigating = false;
        setActive(target.id);
      }
    };
    frame = requestAnimationFrame(step);
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', event => {
      event.preventDefault();
      const target = document.getElementById(tab.dataset.section);
      if (target) goTo(target);
    });
  });
document.querySelectorAll('.home-link').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();

    const target = document.getElementById(link.dataset.section);
    if (target) goTo(target);
  });
});
  // One observer only; it never competes with an in-progress tab animation.
  const observer = new IntersectionObserver(entries => {
    if (navigating) return;
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setActive(visible.target.id);
  }, { threshold: [0.35, 0.55, 0.75], rootMargin: '-15% 0px -45% 0px' });

  sections.forEach(s => observer.observe(s));
  setActive(sections[0].id);
})();


/* Quick multilingual hello intro */
window.addEventListener("DOMContentLoaded", () => {
  const intro = document.getElementById("greetingIntro");
  const word = document.getElementById("greetingWord");
  if (intro && word) {
    const greetings = ["Hello.", "Hola.", "Bonjour.", "नमस्ते.", "こんにちは.", "Ciao.", "Olá.", "مرحباً.", "Hallo."];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const interval = reducedMotion ? 120 : 230;
    let index = 0;
    word.textContent = greetings[0];

    if (!reducedMotion) {
      const ticker = window.setInterval(() => {
        index += 1;
        if (index >= greetings.length) {
          window.clearInterval(ticker);
          window.setTimeout(() => intro.classList.add("is-hidden"), 220);
          return;
        }
        word.textContent = greetings[index];
        word.style.animation = "none";
        void word.offsetWidth;
        word.style.animation = "";
      }, interval);
    } else {
      window.setTimeout(() => intro.classList.add("is-hidden"), 900);
    }
  }

  /* Theme switch: remember the visitor's choice when storage is available. */
  const themeToggle = document.getElementById("themeToggle");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const applyTheme = (theme) => {
    document.body.dataset.theme = theme;
    const light = theme === "light";
    if (themeToggle) {
      themeToggle.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
      themeToggle.setAttribute("title", light ? "Switch to dark theme" : "Switch to light theme");
    }
    if (themeMeta) themeMeta.setAttribute("content", light ? "#f6f2fb" : "#09070d");
  };

  let savedTheme = "dark";
  try { savedTheme = localStorage.getItem("xenlyf-theme") || "dark"; } catch (_) {}
  applyTheme(savedTheme === "light" ? "light" : "dark");

  if (themeToggle) {
    themeToggle.addEventListener("click", (event) => {
      event.preventDefault();
      const next = document.body.dataset.theme === "light" ? "dark" : "light";
      applyTheme(next);
      try { localStorage.setItem("xenlyf-theme", next); } catch (_) {}
    }, { passive: false });
  }

  /* Live clock in India Standard Time (Asia/Kolkata). */
  const clock = document.getElementById("indiaTime");
  const updateIndiaClock = () => {
    if (!clock) return;
    clock.textContent = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    }).format(new Date());
  };
  updateIndiaClock();
  window.setInterval(updateIndiaClock, 1000);
});
