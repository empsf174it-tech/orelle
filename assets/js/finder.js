// Scent Note Pyramid Finder

document.addEventListener('DOMContentLoaded', () => {
  const finderEl = document.getElementById('scentFinderApp');
  if(!finderEl) return;

  const notesDB = {
    top: ["bergamot", "pink pepper", "neroli", "lemon", "cardamom", "coriander", "almond", "blackcurrant"],
    heart: ["rose", "jasmine", "iris", "orange blossom", "petitgrain", "leather", "sandalwood", "patchouli", "coffee", "incense"],
    base: ["amber", "vanilla", "musk", "oud", "cedar", "oakmoss", "vetiver", "tonka", "praline"]
  };

  const weights = { base: 0.40, heart: 0.35, top: 0.25 };
  let selected = { top: [], heart: [], base: [] };

  const renderChips = () => {
    ['top', 'heart', 'base'].forEach(layer => {
      const container = document.getElementById(`${layer}NotesContainer`);
      container.innerHTML = notesDB[layer].map(note => `
        <button class="note-chip" aria-pressed="${selected[layer].includes(note)}" data-layer="${layer}" data-note="${note}">
          ${note}
        </button>
      `).join('');
    });

    document.querySelectorAll('.note-chip').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const layer = e.target.dataset.layer;
        const note = e.target.dataset.note;
        if(selected[layer].includes(note)) {
          selected[layer] = selected[layer].filter(n => n !== note);
          e.target.setAttribute('aria-pressed', 'false');
        } else {
          selected[layer].push(note);
          e.target.setAttribute('aria-pressed', 'true');
        }
        updatePyramid();
        calculateMatches();
      });
    });
  };

  const updatePyramid = () => {
    const py = document.getElementById('pyramidSvg');
    if(!py) return;
    
    // Highlight sections of the SVG based on selection
    const topPath = py.querySelector('#pyramidTop');
    const heartPath = py.querySelector('#pyramidHeart');
    const basePath = py.querySelector('#pyramidBase');

    if(topPath) topPath.style.fill = selected.top.length > 0 ? 'var(--accent)' : 'var(--bg-tertiary)';
    if(heartPath) heartPath.style.fill = selected.heart.length > 0 ? 'var(--accent)' : 'var(--bg-tertiary)';
    if(basePath) basePath.style.fill = selected.base.length > 0 ? 'var(--accent)' : 'var(--bg-tertiary)';
  };

  const calculateMatches = () => {
    const resultsContainer = document.getElementById('finderResults');
    if(selected.top.length === 0 && selected.heart.length === 0 && selected.base.length === 0) {
      resultsContainer.innerHTML = '<div class="text-center text-muted" style="padding: var(--space-8);">Select notes above to see matches.</div>';
      return;
    }

    const data = window.OrelleData.MOCK_FRAGRANCES;
    let matches = [];

    data.forEach(item => {
      let score = 0;
      let matchedNotes = [];

      // Top
      let topMatchCount = item.notes.top.filter(n => selected.top.includes(n)).length;
      if(topMatchCount > 0) {
        score += (weights.top * (topMatchCount / Math.max(selected.top.length, 1)));
        matchedNotes.push(...item.notes.top.filter(n => selected.top.includes(n)));
      }

      // Heart
      let heartMatchCount = item.notes.heart.filter(n => selected.heart.includes(n)).length;
      if(heartMatchCount > 0) {
        score += (weights.heart * (heartMatchCount / Math.max(selected.heart.length, 1)));
        matchedNotes.push(...item.notes.heart.filter(n => selected.heart.includes(n)));
      }

      // Base
      let baseMatchCount = item.notes.base.filter(n => selected.base.includes(n)).length;
      if(baseMatchCount > 0) {
        score += (weights.base * (baseMatchCount / Math.max(selected.base.length, 1)));
        matchedNotes.push(...item.notes.base.filter(n => selected.base.includes(n)));
      }

      if(score > 0) {
        matches.push({ item, score, matchedNotes });
      }
    });

    matches.sort((a,b) => b.score - a.score);

    if(matches.length === 0) {
      resultsContainer.innerHTML = '<div class="text-center text-muted" style="padding: var(--space-8);">No exact matches. Try adjusting your notes.</div>';
      return;
    }

    resultsContainer.innerHTML = matches.map(m => `
      <div class="card" style="padding: var(--space-4); margin-bottom: var(--space-4); flex-direction: row; gap: var(--space-4); align-items: center;">
        <img src="${m.item.image}" alt="${m.item.name}" style="width: 80px; height: 100px; object-fit: cover; border-radius: var(--radius);">
        <div style="flex: 1;">
          <h4 style="margin-bottom: var(--space-1);">${m.item.name}</h4>
          <div class="text-sm text-secondary" style="margin-bottom: var(--space-2); text-transform: capitalize;">${m.item.family}</div>
          <div class="text-sm">Matched: <span class="text-accent">${m.matchedNotes.join(', ')}</span></div>
        </div>
        <div class="text-right" style="min-width: 120px;">
          <div class="tabular text-accent" style="font-size: 1.5rem; font-weight: var(--weight-medium); margin-bottom: var(--space-2);">${Math.round(m.score * 100)}% Match</div>
          <div class="flex gap-2 justify-center">
            <button class="btn btn-outline" style="padding: 0 var(--space-2); height: 32px;" onclick="window.addSample('${m.item.id}')">Sample</button>
            <button class="btn btn-primary" style="padding: 0 var(--space-2); height: 32px;" onclick="window.addToCart('${m.item.id}')">Full Size</button>
          </div>
        </div>
      </div>
    `).join('');
  };

  document.getElementById('resetFinder').addEventListener('click', () => {
    selected = { top: [], heart: [], base: [] };
    renderChips();
    updatePyramid();
    calculateMatches();
  });

  renderChips();
  updatePyramid();
});
