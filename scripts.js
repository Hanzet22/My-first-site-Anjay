// === 1. THEME CONFIGURATION ===
const themes = [
  { primary: '#00f5d4', secondary: '#7b2cbf', glow: 'rgba(0, 245, 212, 0.2)' },
  { primary: '#ff2a85', secondary: '#7928ca', glow: 'rgba(255, 42, 133, 0.22)' },
  { primary: '#39ff14', secondary: '#008f11', glow: 'rgba(57, 255, 20, 0.2)' },
  { primary: '#ffb703', secondary: '#fb8500', glow: 'rgba(255, 183, 3, 0.22)' }
];
let currentThemeIndex = 0;

function applyTheme(theme) {
  document.documentElement.style.setProperty('--primary', theme.primary);
  document.documentElement.style.setProperty('--secondary', theme.secondary);
  document.documentElement.style.setProperty('--glow', theme.glow);
}

// === 2. INTERACTIVE PARTICLE NETWORK & BURST ENGINE ===
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let width, height;
let particles = [];
let burstParticles = [];
const mouse = { x: null, y: null, radius: 150 };

function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener('mouseout', () => {
  mouse.x = null;
  mouse.y = null;
});

class Particle {
  constructor(x, y, isBurst = false) {
    this.isBurst = isBurst;
    this.x = x ?? Math.random() * width;
    this.y = y ?? Math.random() * height;
    this.size = isBurst ? Math.random() * 4 + 2 : Math.random() * 2.5 + 1;

    if (isBurst) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.alpha = 1;
      this.decay = Math.random() * 0.02 + 0.015;
    } else {
      this.vx = (Math.random() - 0.5) * 1.1;
      this.vy = (Math.random() - 0.5) * 1.1;
      this.alpha = 0.8;
    }
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.isBurst) {
      this.vx *= 0.96;
      this.vy *= 0.96;
      this.alpha -= this.decay;
    } else {
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
    }
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = themes[currentThemeIndex].primary;
    ctx.shadowBlur = 10;
    ctx.shadowColor = themes[currentThemeIndex].primary;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function initParticles() {
  particles = [];
  const count = Math.min(80, Math.floor((width * height) / 14000));
  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }
}
initParticles();

function spawnBurst(x, y) {
  for (let i = 0; i < 40; i++) {
    burstParticles.push(new Particle(x, y, true));
  }
}

function connectParticles() {
  const color = themes[currentThemeIndex].primary;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.hypot(dx, dy);

      if (dist < 120) {
        ctx.strokeStyle = color;
        ctx.globalAlpha = (1 - dist / 120) * 0.25;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }

    if (mouse.x !== null && mouse.y !== null) {
      const dx = particles[i].x - mouse.x;
      const dy = particles[i].y - mouse.y;
      const dist = Math.hypot(dx, dy);

      if (dist < mouse.radius) {
        ctx.strokeStyle = color;
        ctx.globalAlpha = (1 - dist / mouse.radius) * 0.55;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1;
}

// === 3. SMOOTH CURSOR SPOTLIGHT ===
const cursorGlow = document.getElementById('cursor-glow');
let glowX = window.innerWidth / 2;
let glowY = window.innerHeight / 2;

function animateLoop() {
  ctx.clearRect(0, 0, width, height);

  particles.forEach((p) => {
    p.update();
    p.draw();
  });
  connectParticles();

  burstParticles = burstParticles.filter((p) => p.alpha > 0);
  burstParticles.forEach((p) => {
    p.update();
    p.draw();
  });

  if (mouse.x !== null && mouse.y !== null) {
    glowX += (mouse.x - glowX) * 0.12;
    glowY += (mouse.y - glowY) * 0.12;
    cursorGlow.style.left = `${glowX}px`;
    cursorGlow.style.top = `${glowY}px`;
  }

  requestAnimationFrame(animateLoop);
}
animateLoop();

// === 4. 3D TILT CARD & SPECULAR GLARE ===
const card = document.getElementById('tilt-card');
const glare = document.getElementById('card-glare');

card.addEventListener('mousemove', (e) => {
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  const rotateX = ((y - centerY) / centerY) * -12;
  const rotateY = ((x - centerX) / centerX) * 12;

  card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.22), transparent 60%)`;
});

card.addEventListener('mouseleave', () => {
  card.style.transform = 'rotateX(0deg) rotateY(0deg)';
});

// === 5. TYPEWRITER EFFECT ===
const phrases = [
  'Full Effect Tanpa Library Eksternal.',
  'Interactive Particle + 3D Tilt Card.',
  'Hover Judul Buat Efek Glitch, Lek!',
  'Klik Tombol Buat Ledakin Partikel!'
];
const typingEl = document.getElementById('typing-text');
let phraseIdx = 0;
let charIdx = 0;
let isDeleting = false;

function typeEffect() {
  const current = phrases[phraseIdx];
  typingEl.textContent = current.substring(0, charIdx);

  if (!isDeleting && charIdx < current.length) {
    charIdx++;
    setTimeout(typeEffect, 55);
  } else if (isDeleting && charIdx > 0) {
    charIdx--;
    setTimeout(typeEffect, 30);
  } else {
    isDeleting = !isDeleting;
    if (!isDeleting) phraseIdx = (phraseIdx + 1) % phrases.length;
    setTimeout(typeEffect, isDeleting ? 1400 : 350);
  }
}
typeEffect();

// === 6. MAGNETIC BUTTONS, RIPPLE & ACTIONS ===
document.querySelectorAll('.magnetic-btn').forEach((btn) => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translate(0, 0)';
  });

  btn.addEventListener('click', (e) => {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

document.getElementById('burst-btn').addEventListener('click', (e) => {
  spawnBurst(e.clientX, e.clientY);
});

document.getElementById('theme-btn').addEventListener('click', (e) => {
  currentThemeIndex = (currentThemeIndex + 1) % themes.length;
  applyTheme(themes[currentThemeIndex]);
  spawnBurst(e.clientX, e.clientY);
});

window.addEventListener('click', (e) => {
  if (!e.target.closest('button')) {
    spawnBurst(e.clientX, e.clientY);
  }
});