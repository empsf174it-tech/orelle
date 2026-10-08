// Studio Logic: Discovery Sets & Custom Packaging

document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.studio-tab-btn');
  const panels = document.querySelectorAll('.studio-panel');

  if(tabs.length === 0) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      
      tab.classList.add('active');
      document.getElementById(tab.dataset.target).classList.add('active');
      
      // Update hash for deep linking without scroll jump
      history.replaceState(null, null, `#${tab.dataset.target}`);
    });
  });

  // Handle deep link on load
  if(window.location.hash) {
    const target = window.location.hash.replace('#', '');
    const tab = document.querySelector(`.studio-tab-btn[data-target="${target}"]`);
    if(tab) tab.click();
  }

  // --- Discovery Set Builder ---
  const dsBuilder = document.getElementById('dsBuilder');
  if (dsBuilder) {
    let setSize = 3;
    let selectedSamples = [];
    let setPrice = 65; // Base price for 3

    const updateDsPrice = () => {
      if(setSize === 3) setPrice = 65;
      if(setSize === 5) setPrice = 95;
      if(setSize === 8) setPrice = 145;
      document.getElementById('dsPrice').textContent = window.OrelleData.formatPrice(setPrice);
    };

    const renderSamplePicker = () => {
      const picker = document.getElementById('samplePickerGrid');
      const data = window.OrelleData.MOCK_FRAGRANCES;
      
      picker.innerHTML = data.map(item => {
        const isSelected = selectedSamples.includes(item.id);
        const disabled = !isSelected && selectedSamples.length >= setSize;
        return `
          <div class="card ${isSelected ? 'selected' : ''}" style="cursor: pointer; opacity: ${disabled ? 0.5 : 1}; pointer-events: ${disabled ? 'none' : 'auto'}; border-color: ${isSelected ? 'var(--accent)' : 'var(--border-color)'}" onclick="window.toggleSample('${item.id}')">
            <div style="padding: var(--space-4); text-align: center;">
              <h4 style="font-size: 1rem; margin-bottom: 4px;">${item.name}</h4>
              <div class="text-xs text-secondary">${item.family}</div>
              ${isSelected ? '<div style="color: var(--accent); margin-top: 8px;"><i class="ph-fill ph-check-circle"></i></div>' : ''}
            </div>
          </div>
        `;
      }).join('');
      
      document.getElementById('dsCounter').textContent = `${selectedSamples.length} / ${setSize} selected`;
      document.getElementById('dsAddToCart').disabled = selectedSamples.length !== setSize;
    };

    window.toggleSample = (id) => {
      if(selectedSamples.includes(id)) {
        selectedSamples = selectedSamples.filter(s => s !== id);
      } else if (selectedSamples.length < setSize) {
        selectedSamples.push(id);
      }
      renderSamplePicker();
    };

    document.querySelectorAll('input[name="setSize"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        setSize = parseInt(e.target.value);
        selectedSamples = []; // Reset on size change
        updateDsPrice();
        renderSamplePicker();
      });
    });

    document.getElementById('dsAddToCart').addEventListener('click', () => {
      const names = selectedSamples.map(id => window.OrelleData.MOCK_FRAGRANCES.find(f=>f.id===id).name).join(', ');
      window.Cart.addItem({
        id: 'ds-custom-' + Date.now(),
        name: `Custom Discovery Set (${setSize})`,
        price: setPrice,
        image: 'https://images.unsplash.com/photo-1610461888750-10bfc601b874?auto=format&fit=crop&q=80&w=600'
      }, 1, { type: 'discovery', samples: names });
    });

    updateDsPrice();
    renderSamplePicker();
  }

  // --- Custom Packaging Configurator ---
  const packConfig = document.getElementById('packConfigurator');
  if (packConfig) {
    let config = {
      box: 'box-classic',
      ribbon: 'ribbon-silk',
      engraving: ''
    };

    const updatePreview = () => {
      const boxColor = window.OrelleData.PACKAGING_OPTIONS.boxStyle.find(b => b.id === config.box).color;
      const ribbonColor = window.OrelleData.PACKAGING_OPTIONS.ribbon.find(r => r.id === config.ribbon).color;
      
      // Update SVG Preview
      const boxRect = document.getElementById('previewBox');
      const ribbonPath = document.getElementById('previewRibbon');
      const textEl = document.getElementById('previewText');

      if(boxRect) boxRect.style.fill = boxColor;
      if(ribbonPath) ribbonPath.style.fill = ribbonColor;
      if(textEl) textEl.textContent = config.engraving;
      
      // Update Price
      let addOnPrice = 0;
      addOnPrice += window.OrelleData.PACKAGING_OPTIONS.boxStyle.find(b => b.id === config.box).price;
      addOnPrice += window.OrelleData.PACKAGING_OPTIONS.ribbon.find(r => r.id === config.ribbon).price;
      if(config.engraving.trim()) addOnPrice += window.OrelleData.PACKAGING_OPTIONS.engravingPrice;
      
      const priceEl = document.getElementById('packAddOnPrice');
      if(priceEl) priceEl.textContent = addOnPrice > 0 ? `+${window.OrelleData.formatPrice(addOnPrice)}` : 'Complimentary';
    };

    document.querySelectorAll('input[name="boxStyle"]').forEach(radio => {
      radio.addEventListener('change', (e) => { config.box = e.target.value; updatePreview(); });
    });
    
    document.querySelectorAll('input[name="ribbon"]').forEach(radio => {
      radio.addEventListener('change', (e) => { config.ribbon = e.target.value; updatePreview(); });
    });

    const engInput = document.getElementById('engravingInput');
    const engCounter = document.getElementById('engravingCounter');
    if(engInput) {
      engInput.addEventListener('input', (e) => {
        // Validation: letters and numbers only, max 15
        let val = e.target.value.replace(/[^A-Za-z0-9\\s&]/g, '').substring(0, 15);
        e.target.value = val;
        config.engraving = val;
        engCounter.textContent = `${val.length}/15`;
        updatePreview();
      });
    }

    document.getElementById('saveDesignBtn')?.addEventListener('click', () => {
      if(!window.Auth.getCurrentUser()) {
        window.location.href = 'login.html';
        return;
      }
      const ud = window.Auth.getUserData();
      ud.savedDesigns.push({
        id: 'dsgn-' + Date.now(),
        date: new Date().toISOString(),
        box: window.OrelleData.PACKAGING_OPTIONS.boxStyle.find(b => b.id === config.box).name,
        ribbon: window.OrelleData.PACKAGING_OPTIONS.ribbon.find(r => r.id === config.ribbon).name,
        engraving: config.engraving
      });
      window.Auth.saveUserData(ud);
      const btn = document.getElementById('saveDesignBtn');
      btn.innerHTML = '<i class="ph-fill ph-check-circle"></i> Saved';
      setTimeout(() => btn.innerHTML = 'Save Design', 2000);
    });
    
    updatePreview();
  }
});
