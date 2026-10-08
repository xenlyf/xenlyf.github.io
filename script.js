// Small interaction layer — no framework required.
const header = document.querySelector('.nav');
let lastY = 0;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  header.style.background = y > 20 ? 'rgba(9,9,11,.78)' : 'transparent';
  header.style.backdropFilter = y > 20 ? 'blur(14px)' : 'none';
  lastY = y;
}, {passive:true});
