// Shop Listing Logic

document.addEventListener('DOMContentLoaded', () => {
  const shopGrid = document.getElementById('shopGrid');
  if (!shopGrid) return;

  let currentCategory = new URLSearchParams(window.location.search).get('category') || 'all';
  let activeFilters = {
    category: currentCategory,
    family: [],
    notes: [],
    price: null
  };
  let currentSort = 'featured';

  const renderProducts = () => {
    const data = window.OrelleData.MOCK_FRAGRANCES;
    
    // Filter
    let filtered = data.filter(item => {
      if (activeFilters.category !== 'all' && !item.category.includes(activeFilters.category)) return false;
      if (activeFilters.family.length > 0 && !activeFilters.family.includes(item.family)) return false;
      
      if (activeFilters.notes.length > 0) {
        const allNotes = [...item.notes.top, ...item.notes.heart, ...item.notes.base];
        const hasNotes = activeFilters.notes.some(n => allNotes.includes(n));
        if (!hasNotes) return false;
      }
      
      if (activeFilters.price) {
        const minPrice = item.sizes[0].price;
        if (activeFilters.price === 'under200' && minPrice >= 200) return false;
        if (activeFilters.price === '200-300' && (minPrice < 200 || minPrice > 300)) return false;
        if (activeFilters.price === 'over300' && minPrice <= 300) return false;
      }
      
      return true;
    });

    // Sort
    if (currentSort === 'price-low') filtered.sort((a,b) => a.sizes[0].price - b.sizes[0].price);
    if (currentSort === 'price-high') filtered.sort((a,b) => b.sizes[0].price - a.sizes[0].price);
    if (currentSort === 'rating') filtered.sort((a,b) => b.rating - a.rating);

    if (filtered.length === 0) {
      shopGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: var(--space-12) 0;">
          <h3 class="text-secondary">No fragrances found</h3>
          <p class="text-muted" style="margin-top: var(--space-2);">Try adjusting your filters.</p>
          <button class="btn btn-outline" style="margin-top: var(--space-4);" onclick="window.resetFilters()">Clear Filters</button>
        </div>
      `;
      return;
    }

    const user = window.Auth ? window.Auth.getCurrentUser() : null;
    let savedIds = [];
    if(user) {
      const ud = window.Auth.getUserData();
      savedIds = ud.savedScents.map(s => s.id);
    }

    shopGrid.innerHTML = filtered.map(item => `
      <div class="card product-card animate-fade-in">
        <a href="fragrance-detail.html?id=${item.id}" class="product-card-img-wrap">
          <img src="${item.image}" alt="${item.name}" class="product-card-img" loading="lazy">
          <button class="wishlist-btn ${savedIds.includes(item.id) ? 'active' : ''}" onclick="window.toggleSave(event, '${item.id}')" aria-label="Save to wishlist">
            <i class="${savedIds.includes(item.id) ? 'ph-fill' : 'ph'} ph-heart"></i>
          </button>
        </a>
        <div style="padding: var(--space-4); display: flex; flex-direction: column; flex: 1;">
          <a href="fragrance-detail.html?id=${item.id}">
            <h3 class="product-card-title">${item.name}</h3>
            <div class="product-card-meta">${item.concentration} · <span style="text-transform: capitalize;">${item.family}</span></div>
            <div class="product-card-price tabular">From ${window.OrelleData.formatPrice(item.sizes[0].price)}</div>
            <div style="color: var(--accent); margin-bottom: var(--space-4); font-size: 0.875rem;">
              <i class="ph-fill ph-star"></i> ${item.rating} (${item.reviewCount})
            </div>
          </a>
          <div style="margin-top: auto; display: flex; gap: var(--space-2); width: 100%;">
            <button class="btn btn-primary" style="flex: 2; padding: 0 var(--space-2); font-size: 0.75rem;" onclick="window.addToCart('${item.id}')">Add to Cart</button>
            <button class="btn btn-outline" style="flex: 1; padding: 0 var(--space-2); font-size: 0.75rem;" onclick="window.addSample('${item.id}')">Sample</button>
          </div>
        </div>
      </div>
    `).join('');
  };

  // Global hooks for buttons
  window.addToCart = (id) => {
    const item = window.OrelleData.MOCK_FRAGRANCES.find(f => f.id === id);
    if(item) window.Cart.addItem(item, 1, { size: item.sizes[0].size });
  };
  
  window.addSample = (id) => {
    const item = window.OrelleData.MOCK_FRAGRANCES.find(f => f.id === id);
    if(item) window.Cart.addItem({...item, price: 10}, 1, { type: 'sample' });
  };

  window.toggleSave = (e, id) => {
    e.preventDefault();
    if(!window.Auth.getCurrentUser()) {
      window.location.href = 'login.html';
      return;
    }
    const btn = e.currentTarget;
    const ud = window.Auth.getUserData();
    const idx = ud.savedScents.findIndex(s => s.id === id);
    if(idx > -1) {
      ud.savedScents.splice(idx, 1);
      btn.classList.remove('active');
      btn.innerHTML = '<i class="ph ph-heart"></i>';
    } else {
      const item = window.OrelleData.MOCK_FRAGRANCES.find(f => f.id === id);
      ud.savedScents.push({id: item.id, name: item.name, image: item.image, price: item.price});
      btn.classList.add('active');
      btn.innerHTML = '<i class="ph-fill ph-heart"></i>';
    }
    window.Auth.saveUserData(ud);
  };

  window.resetFilters = () => {
    activeFilters = { category: 'all', family: [], notes: [], price: null };
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
    renderProducts();
  };

  // Filter Bindings
  document.querySelectorAll('.filter-chip[data-category]').forEach(btn => {
    if(btn.dataset.category === activeFilters.category) btn.classList.add('active');
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-chip[data-category]').forEach(c => c.classList.remove('active'));
      e.target.classList.add('active');
      activeFilters.category = e.target.dataset.category;
      renderProducts();
    });
  });

  document.querySelectorAll('.filter-chip[data-family]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.target.classList.toggle('active');
      const val = e.target.dataset.family;
      if(activeFilters.family.includes(val)) activeFilters.family = activeFilters.family.filter(f => f !== val);
      else activeFilters.family.push(val);
      renderProducts();
    });
  });

  const sortSelect = document.getElementById('sortSelect');
  if(sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderProducts();
    });
  }

  // Initial render
  renderProducts();
});
