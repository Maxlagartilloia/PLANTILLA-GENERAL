// JSON de configuración (en raíz)
const CONFIG_URL = '/cerrajeria-totti.json';

(async () => {
  const resp = await fetch(CONFIG_URL);
  const config = await resp.json();

  // ====== THEME ======
  const set = (k, v) => document.documentElement.style.setProperty(k, v);
  const pal = config.brand.palette;
  set('--c-primary', pal.primary);
  set('--c-primary-700', pal.primary700 || pal.primary);
  set('--c-secondary', pal.secondary);
  set('--c-accent', pal.accent);
  set('--c-bg', pal.bg);
  set('--c-text', pal.text);
  document.title = `${config.brand.business_name} | Soldadura Profesional`;

  // ====== HEADER / HERO ======
  document.getElementById('businessName').textContent = config.brand.business_name;
  if (config.brand.logo_file) document.getElementById('brandLogo').src = config.brand.logo_file;

  const hero = config.hero || {};
  if (hero.title) document.getElementById('heroTitle').textContent = hero.title;
  if (hero.subtitle) document.getElementById('heroSub').textContent = hero.subtitle;
  if (hero.image) document.getElementById('heroImage').src = hero.image;

  const bulletsEl = document.getElementById('heroBullets');
  (hero.bullets || []).forEach(b => {
    const li = document.createElement('li');
    li.textContent = b;
    bulletsEl.appendChild(li);
  });
  const badgesEl = document.getElementById('heroBadges');
  (hero.badges || []).forEach(b => {
    const span = document.createElement('span');
    span.className = 'badge';
    span.textContent = b;
    badgesEl.appendChild(span);
  });

  // ====== CONTACTO / WHATSAPP ======
  const wa = (config.contact && config.contact.whatsapp_click_to_chat) || '#';
  ['navCta','contactCta','whatsapp-fab'].forEach(id => {
    const a = document.getElementById(id);
    if (a) a.href = wa;
  });
  if (config.contact) {
    if (config.contact.phone_human) document.getElementById('phone').textContent = `Tel/WhatsApp: ${config.contact.phone_human}`;
    if (config.contact.email) document.getElementById('email').textContent = `Email: ${config.contact.email}`;
    if (config.contact.address) document.getElementById('address').textContent = `Dirección: ${config.contact.address}`;
    if (config.contact.social_label) document.getElementById('social').textContent = `Redes: ${config.contact.social_label}`;
  }
  document.getElementById('year').textContent = new Date().getFullYear();
  document.getElementById('footerName').textContent = config.brand.business_name;

  // ====== SERVICIOS ======
  const servicesGrid = document.getElementById('servicesGrid');
  (config.services || []).forEach(s => {
    const card = document.createElement('article');
    card.className = 'card service-card';
    card.innerHTML = `<h3>${s.title}</h3><p>${s.desc}</p>`;
    servicesGrid.appendChild(card);
  });

  // ====== FEATURES ======
  const features = document.getElementById('features');
  (config.features || []).forEach(f => {
    const card = document.createElement('article');
    card.className = 'card feature-card';
    card.innerHTML = `<h3>${f.title}</h3><p>${f.desc}</p>`;
    features.appendChild(card);
  });

  // ====== FAQ ======
  const faqList = document.getElementById('faqList');
  (config.faq || []).forEach(item => {
    const d = document.createElement('details');
    const s = document.createElement('summary');
    s.textContent = item.q;
    const p = document.createElement('p');
    p.textContent = item.a;
    d.appendChild(s); d.appendChild(p);
    faqList.appendChild(d);
  });

  // ====== GALERÍA con modal ======
  const gallery = document.getElementById('gallery');
  const modal = document.getElementById('imgModal');
  const modalImg = document.getElementById('modalImg');
  const modalCaption = document.getElementById('modalCaption');
  const modalClose = document.getElementById('modalClose');

  (config.gallery || []).forEach(g => {
    const img = document.createElement('img');
    img.loading = 'lazy';
    img.src = g.src;
    img.alt = g.caption || 'Trabajo';
    img.className = 'gallery-img';
    img.addEventListener('click', () => {
      modalImg.src = img.src;
      modalCaption.textContent = g.caption || '';
      modal.showModal();
    });
    gallery.appendChild(img);
  });
  if (modalClose) {
    modalClose.addEventListener('click', () => modal.close());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') modal.close(); });
  }

  // ====== VIDEOS ======
  const videoEmbeds = document.getElementById('videoEmbeds');
  const mkEmbed = (v) => {
    if (!v.url) return '';
    if (v.platform === 'youtube') {
      return `<iframe loading="lazy" src="${v.url.replace('watch?v=','embed/')}" title="YouTube" frameborder="0" allowfullscreen></iframe>`;
    }
    if (v.platform === 'tiktok') {
      return `<iframe loading="lazy" src="${v.url}" title="TikTok" frameborder="0"></iframe>`;
    }
    return '';
  };
  (config.videos || []).forEach(v => {
    const wrap = document.createElement('div');
    wrap.className = 'video';
    wrap.innerHTML = mkEmbed(v);
    videoEmbeds.appendChild(wrap);
  });

  // ====== FORM → WhatsApp ======
  const phone_e164 = (config.contact && config.contact.phone_e164_wa) || '';
  document.getElementById('quoteForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    const msg = `Hola, soy ${data.nombre}. Quiero cotizar: ${data.servicio}. Medidas: ${data.ancho || ''}cm x ${data.alto || ''}cm. Material: ${data.material || ''}. Ubicación: ${data.ubicacion || ''}. Detalles: ${data.descripcion || ''}. Tel: ${data.telefono || ''}`;
    const url = `https://wa.me/${phone_e164}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener');
  });

  // ====== Fondo 3D (partículas) ======
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let w, h, particles;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = Math.max(window.innerHeight, document.body.scrollHeight);
  }
  function initParticles() {
    particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      a: Math.random() * 0.6 + 0.2
    }));
  }
  function draw() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(36,145,217,${p.a})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  resize(); initParticles(); draw();
  window.addEventListener('resize', () => { resize(); initParticles(); });
})();
