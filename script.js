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
  // Scroll-spy based on the section heading line, rather than intersection ratios.
  // This stays reliable for short sections and on mobile, where Lately can be
  // too small to satisfy an IntersectionObserver threshold consistently.
  const updateActiveFromScroll = () => {
    if (navigating) return;

    const atBottom = window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 4;
    if (atBottom) {
      setActive(sections[sections.length - 1].id);
      return;
    }

    const referenceLine = Math.min(window.innerHeight * 0.38, 280);
    let current = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= referenceLine) current = section;
      else break;
    }
    setActive(current.id);
  };

  window.addEventListener('scroll', updateActiveFromScroll, { passive: true });
  window.addEventListener('resize', updateActiveFromScroll);
  updateActiveFromScroll();
})();



/* Smooth, consistent Back to top behavior, including mobile browsers */
window.addEventListener("DOMContentLoaded", () => {
  const backToTop = document.querySelector('footer a[href="#home"]');
  if (!backToTop) return;

  backToTop.addEventListener("click", event => {
    event.preventDefault();

    const reducedMotion = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      window.scrollTo({ top: 0, behavior: "auto" });
      history.replaceState(null, "", "#home");
      return;
    }

    const start = window.scrollY || document.documentElement.scrollTop || 0;
    if (start <= 1) {
      window.scrollTo(0, 0);
      history.replaceState(null, "", "#home");
      return;
    }

    const duration = Math.min(1400, Math.max(650, start * 0.35));
    const started = performance.now();
    const easeInOutCubic = t =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    let frameId = 0;
    const step = now => {
      const progress = Math.min(1, (now - started) / duration);
      const nextY = Math.round(start * (1 - easeInOutCubic(progress)));
      window.scrollTo(0, nextY);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        cancelAnimationFrame(frameId);
        window.scrollTo(0, 0);
        history.replaceState(null, "", "#home");
      }
    };

    frameId = requestAnimationFrame(step);
  }, { passive: false });
});

/* Quick multilingual hello intro */
window.addEventListener("DOMContentLoaded", () => {
  const intro = document.getElementById("greetingIntro");
  const word = document.getElementById("greetingWord");
  if (intro && word) {
    const greetings = ["Hello.", "Hola.", "Bonjour.", "नमस्ते.", "こんにちは.", "Ciao.", "Olá.", "مرحباً.", "Hallo."];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const interval = reducedMotion ? 120 : 230;
    const firstGreetingHold = reducedMotion ? 220 : 330; // same timing on desktop and mobile
    let index = 0;
    word.textContent = greetings[0];

    if (!reducedMotion) {
      // Hold the first greeting slightly longer, then keep the original rhythm.
      window.setTimeout(() => {
        index = 1;
        word.textContent = greetings[index];
        word.style.animation = "none";
        void word.offsetWidth;
        word.style.animation = "";

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
      }, firstGreetingHold);
    } else {
      window.setTimeout(() => intro.classList.add("is-hidden"), 900);
    }
  }

  /* Theme switch: remember the visitor's choice when storage is available. */
  const themeToggle = document.getElementById("themeToggle");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const applyTheme = (theme) => {
    const normalizedTheme = theme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = normalizedTheme;
    document.body.dataset.theme = normalizedTheme;
    document.documentElement.style.colorScheme = normalizedTheme === "light" ? "only light" : "only dark";
    document.body.style.colorScheme = normalizedTheme === "light" ? "only light" : "only dark";
    const light = normalizedTheme === "light";
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


/* Minimal monochrome cat outlines — subtle, lightweight, and non-interactive. */
window.addEventListener("DOMContentLoaded", () => {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (document.querySelector(".catfall-layer")) return;
  const layer = document.createElement("div");
  layer.className = "catfall-layer";
  layer.setAttribute("aria-hidden", "true");
  const count = window.innerWidth < 600 ? 8 : 14;
  const catOutline = '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M5.2 13.2 4.2 3.8 12.3 9.2 16 8.5 19.7 9.2 27.8 3.8 26.8 13.2 26.1 22.8 16 29 5.9 22.8Z"/><path d="M10 15.2 13.1 16.7 10 18.2 M22 15.2 18.9 16.7 22 18.2" stroke-width="1.35"/></svg>';
  for (let i = 0; i < count; i++) {
    const cat = document.createElement("span");
    cat.className = "falling-cat";
    cat.innerHTML = catOutline;
    cat.style.setProperty("--x", `${Math.random() * 100}%`);
    cat.style.setProperty("--size", `${30 + Math.random() * 14}px`);
    cat.style.setProperty("--duration", `${24 + Math.random() * 18}s`);
    cat.style.setProperty("--delay", `${-Math.random() * 38}s`);
    cat.style.setProperty("--drift", `${-14 + Math.random() * 28}px`);
    cat.style.setProperty("--opacity", `${0.20 + Math.random() * 0.13}`);
    layer.appendChild(cat);
  }
  document.body.appendChild(layer);
});

// Xenlyf replay for Meowsarus vs ChessSharkz (PGN supplied by the site owner).
document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("[data-custom-chess]");
  if (!root || typeof Chess === "undefined") return;
  const pgn = `[Event "Live Chess"]
[Site "Chess.com"]
[Date "2026.01.31"]
[Round "?"]
[White "Meowsarus"]
[Black "ChessSharkz"]
[Result "0-1"]
[TimeControl "180"]
[WhiteElo "798"]
[BlackElo "3048"]
[Termination "ChessSharkz won by resignation"]
[ECO "B21"]

1. e4 c5 2. d4 cxd4 3. Qxd4 Nc6 4. Qd1 Nf6 5. Nc3 e6 6. Bb5 Bb4 7. Bxc6 bxc6 8. Bd2 d5 9. e5 Bxc3 10. Bxc3 Ne4 11. Nf3 Nxc3 12. bxc3 Qa5 13. Qd2 Ba6 14. Nd4 Qc5 15. f3 O-O 16. Kf2 Rab8 17. Rab1 Bc4 18. Rxb8 Rxb8 19. a3 Qxa3 20. Nxc6 Qc5+ 21. Nd4 a5 22. Ra1 Ra8 23. Qc1 f6 24. Qa3 Qxa3 25. Rxa3 Kf7 26. Nc6 a4 27. Nd8+ Rxd8 0-1`;
  const game = new Chess();
  game.load_pgn(pgn);
  const history = game.history({ verbose: true });
  const boardEl = root.querySelector("[data-chess-board]");
  const movesEl = root.querySelector("[data-move-list]");
  const turnEl = root.querySelector("[data-turn-label]");
  const plyEl = root.querySelector("[data-ply-label]");
  let index = 0;
  const symbols = { w:{k:"♔",q:"♕",r:"♖",b:"♗",n:"♘",p:"♙"}, b:{k:"♔",q:"♕",r:"♖",b:"♗",n:"♘",p:"♙"} };
  const positions = [new Chess()];
  history.forEach(m => { const next = new Chess(positions[positions.length-1].fen()); next.move(m); positions.push(next); });
  function render() {
    const position = positions[index];
    const matrix = position.board();
    const last = index ? history[index-1] : null;
    boardEl.innerHTML = "";
    matrix.forEach((row, r) => row.forEach((piece, c) => {
      const sq = String.fromCharCode(97+c)+(8-r);
      const el = document.createElement("div");
      el.className = "custom-square "+(((r+c)%2===0)?"light":"dark");
      if (last && (sq===last.from || sq===last.to)) el.classList.add("last-move");
      if (piece) { const glyph = document.createElement("span"); glyph.className = "piece-glyph " + (piece.color==="w"?"piece-white":"piece-black"); glyph.textContent = symbols[piece.color][piece.type]; el.appendChild(glyph); el.setAttribute("aria-label",piece.color==="w"?"White "+piece.type:"Black "+piece.type); }
      if (c===0) { const coord=document.createElement("span"); coord.className="coord"; coord.textContent=8-r; el.appendChild(coord); }
      if (r===7) { const coord=document.createElement("span"); coord.className="coord"; coord.style.left="auto"; coord.style.right="3px"; coord.style.top="auto"; coord.style.bottom="2px"; coord.textContent=String.fromCharCode(97+c); el.appendChild(coord); }
      boardEl.appendChild(el);
    }));
    turnEl.textContent = index===0 ? "Starting position" : (index===history.length ? "Final position · 0–1" : (index%2===1 ? "Black to move" : "White to move"));
    plyEl.textContent = `Ply ${index} / ${history.length}`;
    [...movesEl.querySelectorAll("button")].forEach(b=>b.classList.toggle("active",Number(b.dataset.ply)===index));
  }
  history.forEach((m,i)=>{
    const b=document.createElement("button"); b.type="button"; b.dataset.ply=String(i+1);
    b.textContent = `${Math.floor(i/2)+1}${i%2===0?".":"..."} ${m.san}`;
    b.addEventListener("click",()=>{index=i+1;render();});
    movesEl.appendChild(b);
  });
  root.querySelector('[data-replay="start"]').addEventListener("click",()=>{index=0;render();});
  root.querySelector('[data-replay="prev"]').addEventListener("click",()=>{index=Math.max(0,index-1);render();});
  root.querySelector('[data-replay="next"]').addEventListener("click",()=>{index=Math.min(history.length,index+1);render();});
  root.querySelector('[data-replay="end"]').addEventListener("click",()=>{index=history.length;render();});
  render();
});
