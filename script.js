// Small interaction layer — no framework required.
const header = document.querySelector('.nav');
let lastY = 0;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  header.style.background = y > 20 ? 'rgba(9,9,11,.78)' : 'transparent';
  header.style.backdropFilter = y > 20 ? 'blur(14px)' : 'none';
  lastY = y;
}, {passive:true});

// Bottom tab navigation: highlight the section currently in view.
const tabs = [...document.querySelectorAll('.tab[data-section]')];
const sections = tabs
  .map(tab => document.getElementById(tab.dataset.section))
  .filter(Boolean);

const tabObserver = new IntersectionObserver((entries) => {
  const visible = entries
    .filter(entry => entry.isIntersecting)
    .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.section === visible.target.id));
}, {threshold:[0.2,0.45,0.7], rootMargin:'-15% 0px -35% 0px'});

sections.forEach(section => tabObserver.observe(section));

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

  const contacts = {
    email: {
      title: "Email",
      detail: "xenlyf@duck.com",
      icon: "✉",
      href: "mailto:xenlyf@duck.com",
      external: false
    },
    instagram: {
      title: "Instagram",
      detail: "@xenlyf.ig",
      icon: "◎",
      href: "https://www.instagram.com/xenlyf.ig",
      external: true
    },
    telegram: {
      title: "Telegram",
      detail: "@xenlyf",
      icon: "↗",
      href: "https://t.me/xenlyf",
      external: true
    }
  };

  function openModal(type) {
    const item = contacts[type];
    if (!item) return;
    title.textContent = item.title;
    detail.textContent = item.detail;
    icon.textContent = item.icon;
    proceed.href = item.href;
    proceed.target = item.external ? "_blank" : "_self";
    proceed.rel = item.external ? "noopener" : "";
    proceed.textContent = item.external ? "Open" : "Open email";
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
