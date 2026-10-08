// Scent Atlas — drag an orb across a fresh/warm × airy/intense map to find the closest fragrance

document.addEventListener('DOMContentLoaded', () => {
  const map = document.getElementById('atlasMap');
  if (!map || !window.OrelleData) return;

  const { MOCK_FRAGRANCES, formatPrice } = window.OrelleData;
  const orb = document.getElementById('atlasOrb');
  const moods = document.querySelectorAll('.atlas-mood');

  // Map positions: x = fresh (0) → warm (1), y = airy (0) → intense (1)
  const POSITIONS = {
    f3: { x: 0.14, y: 0.22 },
    f4: { x: 0.30, y: 0.64 },
    f1: { x: 0.50, y: 0.82 },
    f6: { x: 0.68, y: 0.36 },
    f2: { x: 0.74, y: 0.64 },
    f5: { x: 0.88, y: 0.90 }
  };
  const points = MOCK_FRAGRANCES
    .filter(f => POSITIONS[f.id])
    .map(f => ({ ...POSITIONS[f.id], frag: f }));

  const el = id => document.getElementById(id);
  const RING_LEN = 2 * Math.PI * 38;

  // Render fragrance dots
  const dots = {};
  points.forEach(p => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'atlas-dot';
    dot.style.left = `${p.x * 100}%`;
    dot.style.top = `${(1 - p.y) * 100}%`;
    dot.innerHTML = `<i></i><span>${p.frag.name}</span>`;
    dot.setAttribute('aria-label', `Move to ${p.frag.name}`);
    dot.addEventListener('pointerdown', e => e.stopPropagation());
    dot.addEventListener('click', () => moveTo(p.x, p.y, true));
    map.insertBefore(dot, orb);
    dots[p.frag.id] = dot;
  });

  let pos = { x: 0.5, y: 0.5 };
  let currentId = null;

  // Cool teal on the fresh side, ember amber on the warm side
  function glowColor(x, y) {
    const cool = [127, 167, 160], warm = [212, 140, 80];
    const c = cool.map((v, i) => Math.round(v + (warm[i] - v) * x));
    return `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${0.22 + y * 0.25})`;
  }

  function nearest(x, y) {
    let best = null, bestD = Infinity;
    points.forEach(p => {
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < bestD) { bestD = d; best = p; }
    });
    return { point: best, dist: bestD };
  }

  function chips(list) {
    return list.map((n, i) => `<em style="animation-delay:${i * 60}ms">${n}</em>`).join('');
  }

  function render(frag, score) {
    el('atlasScore').textContent = score;
    el('atlasRing').style.strokeDashoffset = RING_LEN * (1 - score / 100);
    if (frag.id === currentId) return;
    currentId = frag.id;

    Object.values(dots).forEach(d => d.classList.remove('is-match'));
    dots[frag.id].classList.add('is-match');

    const img = el('atlasImg');
    img.src = frag.image;
    img.alt = frag.name;
    el('atlasFamily').textContent = frag.family.replace('/', ' / ');
    el('atlasName').textContent = frag.name;
    el('atlasConc').textContent = frag.concentration;
    el('atlasDesc').textContent = frag.description;
    el('atlasTop').innerHTML = chips(frag.notes.top);
    el('atlasHeart').innerHTML = chips(frag.notes.heart);
    el('atlasBase').innerHTML = chips(frag.notes.base);
    el('atlasLong').style.width = `${frag.longevity}%`;
    el('atlasSil').style.width = `${frag.sillage}%`;
    el('atlasLongVal').textContent = `${frag.longevity}/100`;
    el('atlasSilVal').textContent = `${frag.sillage}/100`;
    el('atlasPrice').textContent = formatPrice(frag.sizes[0].price);
    el('atlasView').href = `fragrance-detail.html?id=${frag.id}`;

    const panel = map.closest('.atlas-grid').querySelector('.atlas-panel');
    panel.classList.remove('atlas-swap');
    void panel.offsetWidth; // restart animation
    panel.classList.add('atlas-swap');
  }

  function update(x, y) {
    pos = { x: Math.min(1, Math.max(0, x)), y: Math.min(1, Math.max(0, y)) };
    map.style.setProperty('--x', `${pos.x * 100}%`);
    map.style.setProperty('--y', `${(1 - pos.y) * 100}%`);
    map.style.setProperty('--glow', glowColor(pos.x, pos.y));

    const { point, dist } = nearest(pos.x, pos.y);
    const score = Math.max(52, Math.min(99, Math.round(99 - dist * 110)));
    render(point.frag, score);
  }

  let animTimer;
  function moveTo(x, y, animate) {
    map.classList.add('touched');
    if (animate) {
      map.classList.add('animating');
      clearTimeout(animTimer);
      animTimer = setTimeout(() => map.classList.remove('animating'), 900);
    }
    update(x, y);
  }

  function clearMoods() {
    moods.forEach(m => m.setAttribute('aria-pressed', 'false'));
  }

  // Pointer dragging (mouse, touch, pen)
  function fromEvent(e) {
    const r = map.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: 1 - (e.clientY - r.top) / r.height };
  }

  map.addEventListener('pointerdown', e => {
    map.setPointerCapture(e.pointerId);
    map.classList.add('dragging', 'touched');
    map.classList.remove('animating');
    clearMoods();
    const p = fromEvent(e);
    // Tap on empty space glides the orb there; grabbing the orb follows directly
    moveTo(p.x, p.y, e.target !== orb);
    orb.focus({ preventScroll: true });
  });
  map.addEventListener('pointermove', e => {
    if (!map.classList.contains('dragging')) return;
    map.classList.remove('animating');
    const p = fromEvent(e);
    update(p.x, p.y);
  });
  const endDrag = () => map.classList.remove('dragging');
  map.addEventListener('pointerup', endDrag);
  map.addEventListener('pointercancel', endDrag);

  // Keyboard control
  orb.addEventListener('keydown', e => {
    const step = e.shiftKey ? 0.1 : 0.03;
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
    if (!moves[e.key]) return;
    e.preventDefault();
    clearMoods();
    moveTo(pos.x + moves[e.key][0], pos.y + moves[e.key][1], false);
  });

  // Mood presets
  moods.forEach(btn => btn.addEventListener('click', () => {
    clearMoods();
    btn.setAttribute('aria-pressed', 'true');
    moveTo(parseFloat(btn.dataset.x), parseFloat(btn.dataset.y), true);
  }));

  // Add current match to bag
  el('atlasAdd').addEventListener('click', () => {
    const frag = MOCK_FRAGRANCES.find(f => f.id === currentId);
    if (frag && window.Cart) window.Cart.addItem(frag, 1, { size: frag.sizes[0].size });
  });

  moods.forEach(m => m.setAttribute('aria-pressed', 'false'));
  update(0.42, 0.58);
});
