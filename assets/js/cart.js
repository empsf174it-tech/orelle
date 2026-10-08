// Cart & Checkout Logic

class Cart {
  constructor() {
    this.items = JSON.parse(localStorage.getItem('orelle_cart')) || [];
    this.init();
  }

  init() {
    this.render();
    // Bind global functions for HTML inline onclick if needed, though event listeners are better.
  }

  save() {
    localStorage.setItem('orelle_cart', JSON.stringify(this.items));
    this.render();
  }

  addItem(productInfo, quantity = 1, metadata = {}) {
    // Check if item exists (simple check by ID and exact metadata match)
    const metaStr = JSON.stringify(metadata);
    const existing = this.items.find(i => i.id === productInfo.id && JSON.stringify(i.metadata) === metaStr);
    
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push({
        ...productInfo,
        quantity,
        metadata,
        cartItemId: Date.now().toString()
      });
    }
    this.save();
    
    // Open cart drawer on add
    const cartDrawer = document.querySelector('.cart-drawer');
    const cartBackdrop = document.querySelector('.cart-backdrop');
    if(cartDrawer) {
      cartDrawer.classList.add('open');
      if(cartBackdrop) cartBackdrop.classList.add('open');
    }
  }

  removeItem(cartItemId) {
    this.items = this.items.filter(i => i.cartItemId !== cartItemId);
    this.save();
  }

  updateQuantity(cartItemId, newQty) {
    if (newQty < 1) return;
    const item = this.items.find(i => i.cartItemId === cartItemId);
    if (item) {
      item.quantity = newQty;
      this.save();
    }
  }

  clear() {
    this.items = [];
    this.save();
  }

  getSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  render() {
    const container = document.querySelector('.cart-body');
    const count = this.items.reduce((sum, item) => sum + item.quantity, 0);
    if (window.updateCartCount) window.updateCartCount(count);

    if (!container) return; // Cart drawer not present

    if (this.items.length === 0) {
      container.innerHTML = `
        <div class="text-center" style="padding: var(--space-8) 0;">
          <p class="text-secondary" style="margin-bottom: var(--space-4);">Your cart is empty.</p>
          <a href="shop.html" class="btn btn-primary" onclick="document.querySelector('.close-cart').click();">Continue Shopping</a>
        </div>
      `;
      this.renderFooter(0);
      return;
    }

    let html = '';
    this.items.forEach(item => {
      let metaHtml = '';
      if (item.metadata) {
        if (item.metadata.size) metaHtml += `<div>Size: ${item.metadata.size}ml</div>`;
        if (item.metadata.box) metaHtml += `<div>Box: ${item.metadata.box}</div>`;
        if (item.metadata.ribbon) metaHtml += `<div>Ribbon: ${item.metadata.ribbon}</div>`;
        if (item.metadata.engraving) metaHtml += `<div>Engraving: "${item.metadata.engraving}"</div>`;
        if (item.metadata.type === 'discovery') metaHtml += `<div>Samples included</div>`;
      }

      html += `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img">
          <div class="cart-item-details">
            <div class="cart-item-title">${item.name}</div>
            <div class="cart-item-meta">${metaHtml}</div>
            <div class="cart-item-price tabular">${window.OrelleData.formatPrice(item.price)}</div>
            <div class="cart-item-actions">
              <div class="qty-control">
                <button class="qty-btn" onclick="window.Cart.updateQuantity('${item.cartItemId}', ${item.quantity - 1})"><i class="ph ph-minus"></i></button>
                <input type="text" class="qty-input tabular" value="${item.quantity}" readonly>
                <button class="qty-btn" onclick="window.Cart.updateQuantity('${item.cartItemId}', ${item.quantity + 1})"><i class="ph ph-plus"></i></button>
              </div>
              <button class="remove-item" onclick="window.Cart.removeItem('${item.cartItemId}')">Remove</button>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
    this.renderFooter(this.getSubtotal());
  }

  renderFooter(subtotal) {
    const footer = document.querySelector('.cart-footer');
    if (!footer) return;

    if (subtotal === 0) {
      footer.innerHTML = '';
      return;
    }

    const shipping = window.OrelleData.STORE_CONFIG.shippingFee;
    const tax = subtotal * window.OrelleData.STORE_CONFIG.taxRate;
    const total = subtotal + shipping + tax;

    let loyaltyPreview = '';
    const user = window.Auth ? window.Auth.getCurrentUser() : null;
    
    if (user) {
      const userData = window.Auth.getUserData();
      const tier = window.LoyaltyData.getUserTier(userData.points);
      const pointsEarned = window.LoyaltyData.calculatePointsEarned(subtotal, tier);
      loyaltyPreview = `
        <div class="cart-loyalty-preview">
          <i class="ph-fill ph-star"></i> Earn ${pointsEarned} points on this order (${tier.name} Tier)
        </div>
      `;
    }

    footer.innerHTML = `
      ${loyaltyPreview}
      <div class="cart-summary-line">
        <span>Subtotal</span>
        <span class="tabular">${window.OrelleData.formatPrice(subtotal)}</span>
      </div>
      <div class="cart-summary-line">
        <span>Shipping (Demo)</span>
        <span class="tabular">${window.OrelleData.formatPrice(shipping)}</span>
      </div>
      <div class="cart-summary-line">
        <span>Tax (Demo 8%)</span>
        <span class="tabular">${window.OrelleData.formatPrice(tax)}</span>
      </div>
      <div class="cart-total">
        <span>Total</span>
        <span class="tabular order-total">${window.OrelleData.formatPrice(total)}</span>
      </div>
      <button class="btn btn-primary" style="width: 100%; margin-top: var(--space-4);" onclick="window.Cart.startCheckout()">Checkout</button>
    `;
  }

  startCheckout() {
    if (!window.Auth.getCurrentUser()) {
      sessionStorage.setItem('orelle_redirect', 'checkout');
      window.location.href = 'login.html';
      return;
    }
    this.renderCheckoutStep1();
  }

  renderCheckoutStep1() {
    const container = document.querySelector('.cart-body');
    const footer = document.querySelector('.cart-footer');
    
    footer.innerHTML = `
      <div class="flex gap-4" style="margin-top: var(--space-4);">
        <button class="btn btn-secondary" style="flex:1;" onclick="window.Cart.render()">Back</button>
        <button class="btn btn-primary" style="flex:1;" id="proceedReviewBtn">Review Order</button>
      </div>
    `;

    container.innerHTML = `
      <h3 style="margin-bottom: var(--space-6);">Shipping Details</h3>
      <form id="checkoutForm">
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input type="text" class="form-control" required id="chkName">
        </div>
        <div class="form-group">
          <label class="form-label">Address</label>
          <input type="text" class="form-control" required id="chkAddress">
        </div>
        <div class="grid" style="grid-template-columns: 1fr 1fr;">
          <div class="form-group">
            <label class="form-label">City</label>
            <input type="text" class="form-control" required id="chkCity">
          </div>
          <div class="form-group">
            <label class="form-label">Postal Code</label>
            <input type="text" class="form-control" required id="chkZip" pattern="[0-9A-Za-z\\s\\-]{3,10}">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Payment Method</label>
          <div style="padding: var(--space-4); border: 1px solid var(--border-color); border-radius: var(--radius); text-align: center; color: var(--text-secondary); margin-bottom: var(--space-4);">
            <i class="ph ph-credit-card" style="font-size: 2rem; margin-bottom: 8px;"></i>
            <div>Stripe / PayPal Demo Placeholder</div>
            <div class="text-xs">No real payment processing</div>
          </div>
        </div>
      </form>
    `;

    document.getElementById('proceedReviewBtn').addEventListener('click', () => {
      const form = document.getElementById('checkoutForm');
      if (form.checkValidity()) {
        this.renderCheckoutStep2();
      } else {
        form.reportValidity();
      }
    });
  }

  renderCheckoutStep2() {
    const container = document.querySelector('.cart-body');
    const footer = document.querySelector('.cart-footer');
    
    const subtotal = this.getSubtotal();
    const shipping = window.OrelleData.STORE_CONFIG.shippingFee;
    const tax = subtotal * window.OrelleData.STORE_CONFIG.taxRate;
    const total = subtotal + shipping + tax;

    container.innerHTML = `
      <h3 style="margin-bottom: var(--space-6);">Review Order</h3>
      <div style="margin-bottom: var(--space-6);">
        <p class="text-secondary text-sm">Please confirm your demo order details.</p>
        <p class="text-xs text-muted">A demo order will be saved to your dashboard.</p>
      </div>
      <div class="cart-summary-line"><span>Subtotal</span><span class="tabular">${window.OrelleData.formatPrice(subtotal)}</span></div>
      <div class="cart-summary-line"><span>Shipping</span><span class="tabular">${window.OrelleData.formatPrice(shipping)}</span></div>
      <div class="cart-summary-line"><span>Tax</span><span class="tabular">${window.OrelleData.formatPrice(tax)}</span></div>
      <div class="cart-total"><span>Total</span><span class="tabular order-total">${window.OrelleData.formatPrice(total)}</span></div>
    `;

    footer.innerHTML = `
      <div class="flex gap-4" style="margin-top: var(--space-4);">
        <button class="btn btn-secondary" style="flex:1;" onclick="window.Cart.renderCheckoutStep1()">Back</button>
        <button class="btn btn-primary" style="flex:1;" onclick="window.Cart.placeOrder()">Place Demo Order</button>
      </div>
    `;
  }

  placeOrder() {
    const subtotal = this.getSubtotal();
    const shipping = window.OrelleData.STORE_CONFIG.shippingFee;
    const tax = subtotal * window.OrelleData.STORE_CONFIG.taxRate;
    const total = subtotal + shipping + tax;

    const userData = window.Auth.getUserData();
    const tier = window.LoyaltyData.getUserTier(userData.points);
    const pointsEarned = window.LoyaltyData.calculatePointsEarned(subtotal, tier);

    const orderId = 'ORD-' + Math.floor(Math.random() * 1000000);
    const newOrder = {
      id: orderId,
      date: new Date().toISOString(),
      items: [...this.items],
      total: total,
      pointsEarned: pointsEarned,
      status: 'Processing'
    };

    userData.orders.unshift(newOrder);
    userData.points += pointsEarned;
    window.Auth.saveUserData(userData);

    this.clear();

    const container = document.querySelector('.cart-body');
    const footer = document.querySelector('.cart-footer');
    
    container.innerHTML = `
      <div class="text-center" style="padding: var(--space-8) 0;">
        <div style="color: var(--success); font-size: 3rem; margin-bottom: var(--space-4);"><i class="ph-fill ph-check-circle"></i></div>
        <h3 style="margin-bottom: var(--space-2);">Order Confirmed</h3>
        <p class="text-secondary" style="margin-bottom: var(--space-4);">Thank you for your demo purchase!</p>
        <p class="text-sm" style="margin-bottom: var(--space-2);">Order #: ${orderId}</p>
        <p class="text-sm text-accent">You earned ${pointsEarned} loyalty points.</p>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn btn-primary" style="width: 100%; margin-top: var(--space-4);" onclick="document.querySelector('.close-cart').click(); window.location.href='dashboard.html';">View Dashboard</button>
    `;
  }
}

// Check for redirect from login
document.addEventListener('DOMContentLoaded', () => {
  window.Cart = new Cart();
  
  if (sessionStorage.getItem('orelle_redirect') === 'checkout') {
    sessionStorage.removeItem('orelle_redirect');
    const cartDrawer = document.querySelector('.cart-drawer');
    const cartBackdrop = document.querySelector('.cart-backdrop');
    if(cartDrawer && window.Cart.items.length > 0) {
      cartDrawer.classList.add('open');
      if(cartBackdrop) cartBackdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
      window.Cart.startCheckout();
    }
  }
});
