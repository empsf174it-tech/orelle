// Dashboard Logic

document.addEventListener('DOMContentLoaded', () => {
  const dashContainer = document.getElementById('dashboardApp');
  if(!dashContainer) return;

  window.Auth.ensureGuest();

  const userData = window.Auth.getUserData();
  const currentTier = window.LoyaltyData.getUserTier(userData.points);
  const tiers = window.LoyaltyData.VIP_TIERS;
  const nextTierIndex = tiers.findIndex(t => t.id === currentTier.id) + 1;
  const nextTier = nextTierIndex < tiers.length ? tiers[nextTierIndex] : null;
  
  let progressPercent = 100;
  let pointsToNext = 0;
  
  if (nextTier) {
    const range = nextTier.threshold - currentTier.threshold;
    const progress = userData.points - currentTier.threshold;
    progressPercent = Math.min(100, Math.max(0, (progress / range) * 100));
    pointsToNext = nextTier.threshold - userData.points;
  }

  // Dashboard structure
  dashContainer.innerHTML = `
    <div class="dash-layout">
      
      <!-- Sidebar Nav -->
      <div class="dash-backdrop"></div>
      <aside class="card dash-sidebar" id="dashSidebar">
        <button class="dash-close-btn" aria-label="Close account menu"><i class="ph ph-x"></i></button>
        <div class="dash-profile">
          <div class="dash-avatar" aria-hidden="true">${(userData.name || '?').charAt(0).toUpperCase()}</div>
          <div class="dash-profile-text">
            <h3>${userData.name}</h3>
            <p class="text-sm text-secondary">${userData.email}</p>
          </div>
        </div>
        
        <ul class="dash-nav" id="dashNav">
          <li><button class="dash-nav-btn active" data-panel="overview"><i class="ph ph-squares-four"></i>Overview</button></li>
          <li><button class="dash-nav-btn" data-panel="orders"><i class="ph ph-package"></i>Order History</button></li>
          <li><button class="dash-nav-btn" data-panel="saved"><i class="ph ph-heart"></i>Saved</button></li>
          <li><button class="dash-nav-btn" data-panel="rewards"><i class="ph ph-gift"></i>Rewards</button></li>
        </ul>

        <div class="dash-actions">
          <button class="btn btn-outline" onclick="window.Auth.logout()">Logout</button>
        </div>
      </aside>

      <!-- Main Panels -->
      <div id="dashPanels" class="dash-panels">
        
        <!-- Overview Panel -->
        <div class="dash-panel active" id="panel-overview">
          <h2 class="dash-title">Welcome back, ${userData.name}</h2>
          
          <div class="card dash-tier">
            <div class="dash-tier-head">
              <div>
                <h3 style="color: var(--accent); margin: 0;">${currentTier.name} Tier</h3>
                <div class="tabular dash-points">${userData.points} <span class="text-sm text-secondary">Points</span></div>
              </div>
              <div class="dash-tier-next">
                ${nextTier ? `<div class="text-sm text-secondary">Next tier: ${nextTier.name}</div><div class="text-sm font-bold">${pointsToNext} pts to go</div>` : '<div class="text-sm text-accent">Highest Tier Reached</div>'}
              </div>
            </div>
            
            <div class="dash-progress">
              <div style="width: ${progressPercent}%;"></div>
            </div>
            
            <p class="text-sm text-secondary">You earn ${currentTier.earnRate} points per $1 spent.</p>
          </div>

          <div class="grid dash-two">
             <div class="card dash-mini">
               <h4>Recent Orders</h4>
               ${userData.orders.length > 0 ? 
                 `<div class="text-sm">${userData.orders[0].id} - ${window.OrelleData.formatPrice(userData.orders[0].total)}</div>` : 
                 `<div class="text-sm text-secondary">No recent orders.</div>`}
               <button class="btn btn-text text-sm" onclick="document.querySelector('[data-panel=orders]').click()">View All</button>
             </div>
             <div class="card dash-mini">
               <h4>Saved Scents</h4>
               <div class="text-sm">${userData.savedScents.length} saved fragrances</div>
               <button class="btn btn-text text-sm" onclick="document.querySelector('[data-panel=saved]').click()">View Wishlist</button>
             </div>
          </div>
        </div>

        <!-- Orders Panel -->
        <div class="dash-panel" id="panel-orders" style="display: none;">
          <h2 class="dash-title">Order History</h2>
          ${userData.orders.length === 0 ? '<p class="text-secondary">You have no demo orders yet.</p>' : 
            userData.orders.map(order => `
              <div class="card" style="padding: var(--space-4); margin-bottom: var(--space-4);">
                <div class="flex justify-between dash-order-head" style="margin-bottom: var(--space-4); border-bottom: 1px solid var(--border-color); padding-bottom: var(--space-2);">
                  <div>
                    <strong>Order ${order.id}</strong>
                    <div class="text-sm text-secondary">${new Date(order.date).toLocaleDateString()}</div>
                  </div>
                  <div class="text-right">
                    <div class="tabular order-total">${window.OrelleData.formatPrice(order.total)}</div>
                    <div class="badge">${order.status}</div>
                  </div>
                </div>
                <div>
                  ${order.items.map(item => `
                    <div class="flex justify-between text-sm" style="margin-bottom: 4px;">
                      <span>${item.quantity}x ${item.name}</span>
                      <span class="tabular">${window.OrelleData.formatPrice(item.price)}</span>
                    </div>
                  `).join('')}
                </div>
                <div class="text-sm text-accent" style="margin-top: var(--space-4); text-align: right;">+${order.pointsEarned} VIP Points</div>
              </div>
            `).join('')
          }
        </div>

        <!-- Saved Panel -->
        <div class="dash-panel" id="panel-saved" style="display: none;">
          <h2 class="dash-title">Saved Scents & Designs</h2>
          
          <h3 style="margin-bottom: var(--space-4);">Wishlist</h3>
          <div class="grid dash-wishlist">
            ${userData.savedScents.length === 0 ? '<p class="text-secondary" style="grid-column: 1/-1;">No saved scents.</p>' : 
              userData.savedScents.map(s => `
                <div class="card" style="text-align: center;">
                  <img src="${s.image}" style="width: 100%; aspect-ratio: 4/5; object-fit: cover; margin-bottom: var(--space-2);">
                  <div style="padding: var(--space-2);">
                    <div style="font-weight: bold;">${s.name}</div>
                    <div class="text-sm tabular" style="color: var(--accent);">${window.OrelleData.formatPrice(s.price)}</div>
                    <a href="fragrance-detail.html?id=${s.id}" class="btn btn-text text-sm" style="margin-top: var(--space-2);">View</a>
                  </div>
                </div>
              `).join('')
            }
          </div>

          <h3 style="margin-bottom: var(--space-4);">Saved Packaging Designs</h3>
          <div class="grid" style="grid-template-columns: 1fr;">
            ${userData.savedDesigns.length === 0 ? '<p class="text-secondary">No saved designs.</p>' : 
              userData.savedDesigns.map(d => `
                <div class="card" style="padding: var(--space-4); display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div class="text-sm text-secondary">${new Date(d.date).toLocaleDateString()}</div>
                    <div><strong>Box:</strong> ${d.box}</div>
                    <div><strong>Ribbon:</strong> ${d.ribbon}</div>
                    <div><strong>Engraving:</strong> "${d.engraving}"</div>
                  </div>
                </div>
              `).join('')
            }
          </div>
        </div>

        <!-- Rewards Panel -->
        <div class="dash-panel" id="panel-rewards" style="display: none;">
          <h2 class="dash-title">Redeem Rewards</h2>
          <p class="text-secondary" style="margin-bottom: var(--space-6);">Exchange your VIP points for exclusive benefits.</p>
          
          <div class="grid dash-two">
            ${window.LoyaltyData.REWARDS_CATALOG.map(r => {
              const canAfford = userData.points >= r.cost;
              return `
                <div class="card" style="padding: var(--space-6); text-align: center; opacity: ${canAfford ? 1 : 0.6};">
                  <div style="font-size: 2rem; color: var(--accent); margin-bottom: var(--space-2);"><i class="ph-fill ph-gift"></i></div>
                  <h4 style="margin-bottom: var(--space-2);">${r.name}</h4>
                  <div class="tabular" style="margin-bottom: var(--space-4);">${r.cost} pts</div>
                  <button class="btn btn-${canAfford ? 'primary' : 'outline'}" ${canAfford ? '' : 'disabled'}>
                    ${canAfford ? 'Redeem' : 'Not enough points'}
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>
    </div>
  `;

  // Panel switching logic
  const navBtns = document.querySelectorAll('#dashNav .dash-nav-btn');
  const panels = document.querySelectorAll('.dash-panel');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      navBtns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.style.display = 'none');
      
      btn.classList.add('active');
      document.getElementById(`panel-${btn.dataset.panel}`).style.display = 'block';
      closeSidebar();
    });
  });

  // Mobile: sidebar slides in from the hamburger
  const sidebar = document.getElementById('dashSidebar');
  const backdrop = document.querySelector('.dash-backdrop');
  const menuBtn = document.querySelector('.dash-menu-btn');
  const closeBtn = document.querySelector('.dash-close-btn');

  function openSidebar() {
    sidebar.classList.add('open');
    backdrop.classList.add('open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    if (!sidebar.classList.contains('open')) return;
    sidebar.classList.remove('open');
    backdrop.classList.remove('open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (menuBtn) menuBtn.addEventListener('click', openSidebar);
  closeBtn.addEventListener('click', closeSidebar);
  backdrop.addEventListener('click', closeSidebar);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSidebar(); });
  window.matchMedia('(min-width: 769px)').addEventListener('change', (e) => { if (e.matches) closeSidebar(); });

});
