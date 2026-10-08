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
