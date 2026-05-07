// ── Photo Avatar - bouche animée sur canvas ──────────────────────────────────

class PhotoAvatar {
  constructor(containerId, photoSrc, name, quips, reactions = {}, options = {}) {
    this.id = containerId;
    this.name = name;
    this.quips = quips;
    this.reactions = {
      correct: reactions.correct || [],
      wrong: reactions.wrong || [],
      hint: reactions.hint || [],
    };
    this.current = 0;
    this.speaking = false;
    this.mouthOpen = 0;
    this.mouthDir = 1;
    this.bubbleTimeout = null;
    this.rafId = null;

    const el = document.getElementById(containerId);
    if (!el) return;

    const bubble = document.createElement('div');
    bubble.className = 'av-bubble';
    bubble.id = containerId + '-bubble';
    bubble.style.display = 'none';

    const canvas = document.createElement('canvas');
    canvas.className = 'av-canvas';
    canvas.id = containerId + '-canvas';
    canvas.width = 88;
    canvas.height = 112;

    el.textContent = '';
    el.appendChild(bubble);
    el.appendChild(canvas);

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.img = new Image();
    this.img.onload = () => {
      this._draw();
      const delay = (options.initialDelay !== undefined)
        ? options.initialDelay
        : 6000 + Math.random() * 8000;
      if (delay !== false) {
        setTimeout(() => this.showQuip(this.current), delay);
      }
    };
    this.img.onerror = () => this._drawPlaceholder();
    this.img.src = photoSrc;
  }

  _draw() {
    if (!this.ctx) return;
    const ctx = this.ctx, cx = 44, cy = 44, R = 41;
    ctx.clearRect(0, 0, 88, 112);

    ctx.font = "bold 9px 'Bebas Neue', sans-serif";
    ctx.fillStyle = '#1a1208';
    ctx.textAlign = 'center';
    ctx.fillText(this.name.toUpperCase(), 44, 108);

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.clip();

    if (this.img && this.img.naturalWidth > 0) {
      const iw = this.img.naturalWidth, ih = this.img.naturalHeight;
      const sq = Math.min(iw, ih);
      const sx = (iw - sq) / 2;
      const sy = 0;
      ctx.drawImage(this.img, sx, sy, sq, sq, 3, 3, 82, 82);
    }

    if (this.mouthOpen > 0) {
      const my = cy + R * 0.33;
      const mw = R * 0.36;
      const mh = this.mouthOpen * R * 0.17;
      ctx.fillStyle = 'rgba(12, 4, 0, 0.83)';
      ctx.beginPath();
      ctx.ellipse(cx, my, mw, Math.max(mh, 0.3), 0, 0, Math.PI * 2);
      ctx.fill();
      if (mh > 1.8) {
        ctx.fillStyle = 'rgba(248, 245, 240, 0.9)';
        ctx.beginPath();
        ctx.ellipse(cx, my - mh * 0.28, mw * 0.7, mh * 0.4, 0, 0, Math.PI);
        ctx.fill();
      }
    }

    ctx.restore();

    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = '#1a1208';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  _drawPlaceholder() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    ctx.fillStyle = '#c8a878';
    ctx.beginPath(); ctx.arc(44, 44, 41, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#1a1208'; ctx.lineWidth = 3; ctx.stroke();
    ctx.font = "bold 9px 'Bebas Neue', sans-serif";
    ctx.fillStyle = '#1a1208'; ctx.textAlign = 'center';
    ctx.fillText(this.name.toUpperCase(), 44, 108);
  }

  _tick() {
    this.mouthOpen += this.mouthDir * 0.13;
    if (this.mouthOpen >= 1) { this.mouthOpen = 1; this.mouthDir = -1; }
    else if (this.mouthOpen <= 0) { this.mouthOpen = 0; this.mouthDir = 1; }
    this._draw();
    if (this.speaking || this.mouthOpen > 0) {
      this.rafId = requestAnimationFrame(() => this._tick());
    } else {
      this.rafId = null;
    }
  }

  showQuip(idx, text) {
    const bubble = document.getElementById(this.id + '-bubble');
    if (!bubble) return;
    bubble.textContent = (text !== undefined) ? text : this.quips[idx % this.quips.length];
    bubble.style.display = 'block';
    bubble.style.animation = 'none';
    void bubble.offsetHeight;
    bubble.style.animation = 'bubble-pop 0.3s cubic-bezier(0.34,1.56,0.64,1) both';
    this.speaking = true;
    if (!this.rafId) this._tick();
    if (this.bubbleTimeout) clearTimeout(this.bubbleTimeout);
    this.bubbleTimeout = setTimeout(() => {
      bubble.style.display = 'none';
      this.speaking = false;
    }, 25000);
  }

  cycle() {
    this.current = (this.current + 1) % this.quips.length;
    this.showQuip(this.current);
  }

  react(type) {
    const pool = this.reactions[type];
    if (!pool || !pool.length) return;
    this.showQuip(0, pool[Math.floor(Math.random() * pool.length)]);
  }
}

// ── Compatibilité - ancien alias ─────────────────────────────────────────────
const JULES_EXPRESSIONS = {
  normal: {
    eyes: `<ellipse cx="38" cy="54" rx="7" ry="7" fill="white"/><ellipse cx="62" cy="54" rx="7" ry="7" fill="white"/>
           <circle cx="39" cy="55" r="4" fill="#2a1a0a"/><circle cx="63" cy="55" r="4" fill="#2a1a0a"/>
           <circle cx="40" cy="53" r="1.5" fill="white"/><circle cx="64" cy="53" r="1.5" fill="white"/>
           <circle cx="38" cy="54" r="9" fill="none" stroke="#8B6914" stroke-width="1.8"/>
           <circle cx="62" cy="54" r="9" fill="none" stroke="#8B6914" stroke-width="1.8"/>
           <line x1="47" y1="54" x2="53" y2="54" stroke="#8B6914" stroke-width="1.5"/>
           <line x1="18" y1="51" x2="29" y2="53" stroke="#8B6914" stroke-width="1.5"/>
           <line x1="82" y1="51" x2="71" y2="53" stroke="#8B6914" stroke-width="1.5"/>`,
    brows: `<path d="M 30 44 Q 38 40 46 43" fill="none" stroke="#2a1a0a" stroke-width="2.5"/>
            <path d="M 54 43 Q 62 40 70 44" fill="none" stroke="#2a1a0a" stroke-width="2.5"/>`,
    mouth: `<path d="M 40 80 Q 50 88 60 80" fill="none" stroke="#5a2a0a" stroke-width="2.5" stroke-linecap="round"/>`,
    extra: ''
  },
  smug: {
    eyes: `<ellipse cx="38" cy="54" rx="7" ry="5.5" fill="white"/><ellipse cx="62" cy="54" rx="7" ry="5.5" fill="white"/>
           <circle cx="40" cy="55" r="3.5" fill="#2a1a0a"/><circle cx="64" cy="55" r="3.5" fill="#2a1a0a"/>
           <circle cx="41" cy="53" r="1.3" fill="white"/><circle cx="65" cy="53" r="1.3" fill="white"/>
           <circle cx="38" cy="54" r="9" fill="none" stroke="#8B6914" stroke-width="1.8"/>
           <circle cx="62" cy="54" r="9" fill="none" stroke="#8B6914" stroke-width="1.8"/>
           <line x1="47" y1="54" x2="53" y2="54" stroke="#8B6914" stroke-width="1.5"/>
           <line x1="18" y1="51" x2="29" y2="53" stroke="#8B6914" stroke-width="1.5"/>
           <line x1="82" y1="51" x2="71" y2="53" stroke="#8B6914" stroke-width="1.5"/>`,
    brows: `<path d="M 30 42 Q 38 37 46 41" fill="none" stroke="#2a1a0a" stroke-width="2.5"/>
            <path d="M 54 39 Q 62 43 70 41" fill="none" stroke="#2a1a0a" stroke-width="2.5"/>`,
    mouth: `<path d="M 40 78 Q 52 88 62 76" fill="none" stroke="#5a2a0a" stroke-width="2.5" stroke-linecap="round"/>`,
    extra: ''
  },
  shocked: {
    eyes: `<ellipse cx="38" cy="52" rx="9" ry="10" fill="white"/><ellipse cx="62" cy="52" rx="9" ry="10" fill="white"/>
           <circle cx="38" cy="53" r="6" fill="#2a1a0a"/><circle cx="62" cy="53" r="6" fill="#2a1a0a"/>
           <circle cx="36" cy="50" r="2" fill="white"/><circle cx="60" cy="50" r="2" fill="white"/>
           <circle cx="38" cy="52" r="11" fill="none" stroke="#8B6914" stroke-width="1.8"/>
           <circle cx="62" cy="52" r="11" fill="none" stroke="#8B6914" stroke-width="1.8"/>
           <line x1="47" y1="52" x2="51" y2="52" stroke="#8B6914" stroke-width="1.5"/>
           <line x1="16" y1="49" x2="27" y2="51" stroke="#8B6914" stroke-width="1.5"/>
           <line x1="84" y1="49" x2="73" y2="51" stroke="#8B6914" stroke-width="1.5"/>`,
    brows: `<path d="M 28 38 Q 38 30 46 36" fill="none" stroke="#2a1a0a" stroke-width="3"/>
            <path d="M 54 36 Q 62 30 72 38" fill="none" stroke="#2a1a0a" stroke-width="3"/>`,
    mouth: `<ellipse cx="50" cy="80" rx="8" ry="6" fill="#3a1a08"/>`,
    extra: `<ellipse cx="76" cy="40" rx="3" ry="4.5" fill="#4ab8e8" opacity="0.8"/>`
  },
  dead: {
    eyes: `<text x="28" y="62" font-size="22" fill="#2a1a0a" font-family="Arial">X</text>
           <text x="52" y="62" font-size="22" fill="#2a1a0a" font-family="Arial">X</text>`,
    brows: `<path d="M 30 44 L 46 40" fill="none" stroke="#2a1a0a" stroke-width="3"/>
            <path d="M 54 40 L 70 44" fill="none" stroke="#2a1a0a" stroke-width="3"/>`,
    mouth: `<path d="M 38 78 Q 44 72 50 78 Q 56 72 62 78" fill="none" stroke="#5a2a0a" stroke-width="2.5" stroke-linecap="round"/>`,
    extra: `<text x="14" y="40" font-size="14" fill="#f4c842">&#9733;</text><text x="70" y="36" font-size="12" fill="#f4c842">&#10022;</text>`
  },
  proud: {
    eyes: `<ellipse cx="38" cy="55" rx="7" ry="5" fill="white"/><ellipse cx="62" cy="55" rx="7" ry="5" fill="white"/>
           <circle cx="39" cy="56" r="3.5" fill="#2a1a0a"/><circle cx="63" cy="56" r="3.5" fill="#2a1a0a"/>
           <circle cx="40" cy="54" r="1.2" fill="white"/><circle cx="64" cy="54" r="1.2" fill="white"/>
           <circle cx="38" cy="55" r="9" fill="none" stroke="#8B6914" stroke-width="1.8"/>
           <circle cx="62" cy="55" r="9" fill="none" stroke="#8B6914" stroke-width="1.8"/>
           <line x1="47" y1="55" x2="53" y2="55" stroke="#8B6914" stroke-width="1.5"/>
           <line x1="18" y1="52" x2="29" y2="54" stroke="#8B6914" stroke-width="1.5"/>
           <line x1="82" y1="52" x2="71" y2="54" stroke="#8B6914" stroke-width="1.5"/>
           <path d="M 29 51 Q 38 47 47 51" fill="#c8956a" stroke="none"/>
           <path d="M 53 51 Q 62 47 71 51" fill="#c8956a" stroke="none"/>`,
    brows: `<path d="M 30 42 Q 38 38 46 41" fill="none" stroke="#2a1a0a" stroke-width="2.5"/>
            <path d="M 54 41 Q 62 38 70 42" fill="none" stroke="#2a1a0a" stroke-width="2.5"/>`,
    mouth: `<path d="M 37 78 Q 50 92 63 78" fill="#c0392b" stroke="#5a2a0a" stroke-width="1.5"/>
            <path d="M 41 78 Q 50 88 59 78" fill="#e8a090"/>`,
    extra: `<text x="72" y="30" font-size="18">&#127881;</text>`
  },
  shame: {
    eyes: `<ellipse cx="38" cy="57" rx="7" ry="5" fill="white"/><ellipse cx="62" cy="57" rx="7" ry="5" fill="white"/>
           <circle cx="38" cy="58" r="3.5" fill="#2a1a0a"/><circle cx="62" cy="58" r="3.5" fill="#2a1a0a"/>
           <circle cx="38" cy="57" r="9" fill="none" stroke="#8B6914" stroke-width="1.8"/>
           <circle cx="62" cy="57" r="9" fill="none" stroke="#8B6914" stroke-width="1.8"/>
           <line x1="47" y1="57" x2="53" y2="57" stroke="#8B6914" stroke-width="1.5"/>
           <line x1="18" y1="54" x2="29" y2="56" stroke="#8B6914" stroke-width="1.5"/>
           <line x1="82" y1="54" x2="71" y2="56" stroke="#8B6914" stroke-width="1.5"/>`,
    brows: `<path d="M 30 46 Q 38 52 46 48" fill="none" stroke="#2a1a0a" stroke-width="3"/>
            <path d="M 54 48 Q 62 52 70 46" fill="none" stroke="#2a1a0a" stroke-width="3"/>`,
    mouth: `<path d="M 40 82 Q 50 74 60 82" fill="none" stroke="#5a2a0a" stroke-width="2.5" stroke-linecap="round"/>`,
    extra: `<ellipse cx="28" cy="66" rx="8" ry="5" fill="#e87070" opacity="0.35"/>
            <ellipse cx="72" cy="66" rx="8" ry="5" fill="#e87070" opacity="0.35"/>
            <path d="M 76 44 Q 80 38 78 34" fill="none" stroke="#4ab8e8" stroke-width="2"/>`
  }
};

function buildAvatarSVG(expression) {
  const e = JULES_EXPRESSIONS[expression] || JULES_EXPRESSIONS.normal;
  return `<svg width="100" height="110" viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg">
    <!-- Hair (compact curly) -->
    <ellipse cx="50" cy="30" rx="24" ry="18" fill="#1a0d00"/>
    <ellipse cx="32" cy="26" rx="8" ry="12" fill="#1a0d00"/>
    <ellipse cx="68" cy="26" rx="8" ry="12" fill="#1a0d00"/>
    <ellipse cx="50" cy="18" rx="15" ry="10" fill="#1a0d00"/>
    <ellipse cx="39" cy="16" rx="7" ry="9" fill="#1a0d00"/>
    <ellipse cx="61" cy="16" rx="7" ry="9" fill="#1a0d00"/>
    <!-- Face -->
    <ellipse cx="50" cy="60" rx="28" ry="30" fill="#c8956a"/>
    <!-- Neck -->
    <rect x="40" y="86" width="20" height="20" fill="#c8956a"/>
    <!-- Shirt (navy) -->
    <path d="M 10 110 L 10 96 Q 50 107 90 96 L 90 110 Z" fill="#1a2a4a"/>
    <path d="M 43 107 L 50 94 L 57 107" fill="#243a5e"/>
    <!-- Ears -->
    <ellipse cx="22" cy="60" rx="5" ry="7" fill="#c8956a"/>
    <ellipse cx="78" cy="60" rx="5" ry="7" fill="#c8956a"/>
    <!-- Eyes + glasses -->
    ${e.eyes}
    <!-- Brows -->
    ${e.brows}
    <!-- Nose -->
    <path d="M 48 63 Q 46 70 50 72 Q 54 70 52 63" fill="none" stroke="#a06840" stroke-width="1.5"/>
    <!-- Mustache -->
    <path d="M 36 73 Q 44 78 50 76 Q 56 78 64 73 Q 58 71 50 72 Q 42 71 36 73 Z" fill="#2a1a0a"/>
    <!-- Mouth -->
    ${e.mouth}
    <!-- Beard -->
    <ellipse cx="50" cy="85" rx="16" ry="6" fill="#3d2010" opacity="0.38"/>
    <ellipse cx="36" cy="80" rx="5" ry="3" fill="#3d2010" opacity="0.22"/>
    <ellipse cx="64" cy="80" rx="5" ry="3" fill="#3d2010" opacity="0.22"/>
    ${e.extra}
  </svg>`;
}

// ── Avatar controller ─────────────────────────────────────────────────────────
class JulesAvatar { // c'est moi (Jules) qui réagis aux actions de Bastien
  constructor(containerId, quips) {
    this.container = document.getElementById(containerId);
    this.quips = quips;
    this.current = 0;
    this.expression = 'normal';
    this.bubbleTimeout = null;
    this.render();
    // Show first quip after 1.5s
    setTimeout(() => this.showQuip(0), 9000);
  }

  render() {
    this.container.innerHTML = `
      <div class="speech-bubble" id="avatar-bubble" style="display:none"></div>
      <div id="avatar-face">${buildAvatarSVG(this.expression)}</div>
    `;
  }

  setExpression(expr) {
    this.expression = expr;
    document.getElementById('avatar-face').innerHTML = buildAvatarSVG(expr);
  }

  showQuip(idx, expr) {
    const bubble = document.getElementById('avatar-bubble');
    if (!bubble) return;
    if (expr) this.setExpression(expr);
    const text = this.quips[idx % this.quips.length];
    bubble.textContent = text;
    bubble.style.display = 'block';
    bubble.style.animation = 'none';
    void bubble.offsetHeight;
    bubble.style.animation = 'bubble-pop 0.3s cubic-bezier(0.34,1.56,0.64,1) both';
    if (this.bubbleTimeout) clearTimeout(this.bubbleTimeout);
    this.bubbleTimeout = setTimeout(() => {
      bubble.style.display = 'none';
    }, 14000);
  }

  cycle(expr) {
    this.current = (this.current + 1) % this.quips.length;
    this.showQuip(this.current, expr || 'normal');
  }

  react(type) {
    const reactions = {
      correct: { expr: 'proud', text: 'OUI ! C\'est exactement ça. Il fait vraiment ça. 👏' },
      wrong: { expr: 'smug', text: 'Non... Je t\'ai laissé des indices pourtant.' },
      hint: { expr: 'shame', text: 'Ok je t\'aide. Mais j\'en parle pas à Bastien.' },
      start: { expr: 'normal', text: null },
    };
    const r = reactions[type] || reactions.start;
    if (r.text) this.showQuip(0, r.expr);
    this.setExpression(r.expr);
  }
}

// ── Progress / unlock system ──────────────────────────────────────────────────
// Pages are served from arg/ folder, so relative links are just filenames
const ARG_PAGES = [
  '01-intro.html',
  '02-gps.html',
  '03-moto.html',
  '04-cipher.html',
  '05-music.html',
  '06-image.html',
  '07-drone.html',
  '08-final.html',
];

function getUnlocked() {
  return parseInt(localStorage.getItem('bastien_unlocked') || '0', 10);
}

function unlockNext(currentIdx) {
  const next = currentIdx + 1;
  if (next > getUnlocked()) localStorage.setItem('bastien_unlocked', String(next));
}

function goToNext(currentIdx, delay = 2200) {
  unlockNext(currentIdx);
  const next = ARG_PAGES[currentIdx + 1];
  if (next) setTimeout(() => { window.location.href = next; }, delay);
}

function checkAccess(myIdx) {
  if (myIdx === 0) return; // intro always accessible
  const unlocked = getUnlocked();
  if (myIdx > unlocked) {
    window.location.href = ARG_PAGES[Math.min(unlocked, myIdx - 1)];
  }
}

// ── Victory animation ─────────────────────────────────────────────────────────
function showVictory(message, nextFn) {
  const overlay = document.getElementById('victory-overlay');
  const title = document.getElementById('victory-title');
  const sub = document.getElementById('victory-sub');
  if (!overlay) return;
  title.textContent = '✓ RÉSOLU !';
  sub.textContent = message;
  overlay.classList.add('show');
  setTimeout(nextFn, 2500);
}
