// Fragrance Detail Page Logic

document.addEventListener('DOMContentLoaded', () => {
  const detailContainer = document.getElementById('fragranceDetailApp');
  if(!detailContainer) return;

  const urlParams = new URLSearchParams(window.location.search);
  const fragId = urlParams.get('id');
  const frag = window.OrelleData.MOCK_FRAGRANCES.find(f => f.id === fragId) || window.OrelleData.MOCK_FRAGRANCES[0];

  // Update Page Meta
  document.title = `${frag.name} | Orelle Luxury Fragrances`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if(metaDesc) metaDesc.content = frag.description;

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": frag.name,
    "image": frag.image,
    "description": frag.description,
    "brand": { "@type": "Brand", "name": "Orelle" },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": frag.sizes[0].price,
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": frag.rating,
      "reviewCount": frag.reviewCount
    }
  };
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(jsonLd);
  document.head.appendChild(script);

  // Render HTML
  let currentSize = frag.sizes[0];
  
  const user = window.Auth ? window.Auth.getCurrentUser() : null;
  let isSaved = false;
  let pointsPreview = 0;
  if(user) {
    const ud = window.Auth.getUserData();
    isSaved = ud.savedScents.some(s => s.id === frag.id);
    const tier = window.LoyaltyData.getUserTier(ud.points);
    pointsPreview = window.LoyaltyData.calculatePointsEarned(currentSize.price, tier);
  } else {
    pointsPreview = currentSize.price; // Base 1x rate for guests preview
  }

  detailContainer.innerHTML = `
    <div class="grid" style="grid-template-columns: 1fr 1fr; gap: var(--space-12); align-items: start;">
      <!-- Image Gallery Column -->
      <div style="position: sticky; top: 120px;">
        <img src="${frag.image}" alt="${frag.name}" style="width: 100%; border-radius: var(--radius); background-color: var(--bg-tertiary);">
      </div>

      <!-- Info Column -->
      <div>
        <div class="flex items-center justify-between" style="margin-bottom: var(--space-4);">
          <div class="badge">${frag.concentration}</div>
          <button class="wishlist-btn ${isSaved ? 'active' : ''}" style="position: static;" onclick="window.toggleSave(event, '${frag.id}')" aria-label="Save to wishlist">
            <i class="${isSaved ? 'ph-fill' : 'ph'} ph-heart"></i>
          </button>
        </div>
        
        <h1 style="margin-bottom: var(--space-2);">${frag.name}</h1>
        <div class="flex items-center gap-4 text-sm text-secondary" style="margin-bottom: var(--space-6); text-transform: capitalize;">
          <span>${frag.family}</span>
          <span>·</span>
          <span><i class="ph-fill ph-star text-accent"></i> ${frag.rating} (${frag.reviewCount} Reviews)</span>
        </div>
        
        <p class="text-secondary" style="font-size: 1.125rem; margin-bottom: var(--space-8);">${frag.description}</p>
        
        <h3 id="priceDisplay" class="tabular" style="font-size: 2rem; color: var(--accent); margin-bottom: var(--space-6);">
          ${window.OrelleData.formatPrice(currentSize.price)}
        </h3>

        <!-- Size Options -->
        <div style="margin-bottom: var(--space-8);">
          <div class="text-sm text-secondary" style="margin-bottom: var(--space-2);">Size</div>
          <div class="flex gap-4">
            ${frag.sizes.map((s, i) => `
              <button class="size-btn btn ${i===0 ? 'btn-primary' : 'btn-outline'}" style="flex: 1; border-radius: var(--radius); font-size: 1rem;" data-size="${s.size}" data-price="${s.price}">
                ${s.size}ml
              </button>
            `).join('')}
          </div>
        </div>

        <div class="flex gap-4" style="margin-bottom: var(--space-4);">
          <button class="btn btn-primary" style="flex: 2; height: 56px;" id="addDetailCart">Add to Cart</button>
          <button class="btn btn-outline" style="flex: 1; height: 56px;" onclick="window.addSample('${frag.id}')">Add Sample ($10)</button>
        </div>
        
        <div class="text-sm text-muted" style="margin-bottom: var(--space-8); display: flex; align-items: center; gap: var(--space-2);">
          <i class="ph-fill ph-star text-accent"></i> 
          <span id="pointsDisplay">Earn ${pointsPreview} VIP points on this purchase</span>
        </div>

        <!-- Accordions -->
        <div style="border-top: 1px solid var(--border-color);">
          
          <div class="detail-accordion" style="border-bottom: 1px solid var(--border-color); padding: var(--space-4) 0;">
            <h4 style="margin: 0; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
              Scent Notes <i class="ph ph-caret-down"></i>
            </h4>
            <div style="padding-top: var(--space-4);">
              <svg width="100%" height="200" viewBox="0 0 400 300" id="detailPyramid">
                <polygon id="dpTop" points="200,20 300,100 100,100" fill="var(--bg-tertiary)" stroke="var(--border-color)"/>
                <polygon id="dpHeart" points="100,100 300,100 350,180 50,180" fill="var(--bg-tertiary)" stroke="var(--border-color)"/>
                <polygon id="dpBase" points="50,180 350,180 400,280 0,280" fill="var(--bg-tertiary)" stroke="var(--border-color)"/>
                <text x="200" y="75" fill="var(--text-primary)" text-anchor="middle" font-family="Outfit" font-size="14">TOP: ${frag.notes.top.join(', ')}</text>
                <text x="200" y="145" fill="var(--text-primary)" text-anchor="middle" font-family="Outfit" font-size="14">HEART: ${frag.notes.heart.join(', ')}</text>
                <text x="200" y="235" fill="var(--text-primary)" text-anchor="middle" font-family="Outfit" font-size="14">BASE: ${frag.notes.base.join(', ')}</text>
              </svg>
            </div>
          </div>

          <div class="detail-accordion" style="border-bottom: 1px solid var(--border-color); padding: var(--space-4) 0;">
            <h4 style="margin: 0; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
              Performance & Details <i class="ph ph-caret-down"></i>
            </h4>
            <div style="padding-top: var(--space-4); color: var(--text-secondary); font-size: 0.875rem;">
              <div style="margin-bottom: var(--space-4);">
                <div class="flex justify-between" style="margin-bottom: 4px;"><span>Longevity (Editorial Estimate)</span><span>${frag.longevity}%</span></div>
                <div style="width: 100%; height: 4px; background: var(--bg-tertiary);"><div style="width: ${frag.longevity}%; height: 100%; background: var(--accent);"></div></div>
              </div>
              <div style="margin-bottom: var(--space-4);">
                <div class="flex justify-between" style="margin-bottom: 4px;"><span>Sillage (Editorial Estimate)</span><span>${frag.sillage}%</span></div>
                <div style="width: 100%; height: 4px; background: var(--bg-tertiary);"><div style="width: ${frag.sillage}%; height: 100%; background: var(--accent);"></div></div>
              </div>
              <p style="margin-top: var(--space-4);"><strong>Ideal Occasion:</strong> <span style="text-transform: capitalize;">${frag.occasion}</span></p>
              <p><strong>Season:</strong> <span style="text-transform: capitalize;">${frag.season}</span></p>
            </div>
          </div>
          
          <div style="padding: var(--space-4) 0;">
            <a href="studio.html#packaging" class="btn btn-text">Customize Packaging</a>
          </div>
          
        </div>

      </div>
    </div>
  `;

  // Size selection logic
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.size-btn').forEach(b => {
        b.classList.remove('btn-primary');
        b.classList.add('btn-outline');
      });
      e.target.classList.remove('btn-outline');
      e.target.classList.add('btn-primary');
      
      currentSize = {
        size: parseInt(e.target.dataset.size),
        price: parseFloat(e.target.dataset.price)
      };
      
      document.getElementById('priceDisplay').textContent = window.OrelleData.formatPrice(currentSize.price);
      
      let newPts = currentSize.price;
      if(user) {
        const ud = window.Auth.getUserData();
        const tier = window.LoyaltyData.getUserTier(ud.points);
        newPts = window.LoyaltyData.calculatePointsEarned(currentSize.price, tier);
      }
      document.getElementById('pointsDisplay').textContent = `Earn ${newPts} VIP points on this purchase`;
    });
  });

  // Add to cart
  document.getElementById('addDetailCart').addEventListener('click', () => {
    window.Cart.addItem(frag, 1, { size: currentSize.size });
  });
});
