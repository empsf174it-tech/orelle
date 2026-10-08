// Shared Form Validation Logic

document.addEventListener('DOMContentLoaded', () => {
  // Validate specific forms
  const validateForm = (formElement) => {
    let isValid = true;
    const inputs = formElement.querySelectorAll('input[required], textarea[required]');
    
    inputs.forEach(input => {
      const group = input.closest('.form-group');
      if (!input.value.trim()) {
        isValid = false;
        if(group) {
          group.classList.add('has-error');
          group.classList.remove('has-success');
          let errorMsg = group.querySelector('.form-error-msg');
          if(!errorMsg) {
            errorMsg = document.createElement('div');
            errorMsg.className = 'form-error-msg';
            group.appendChild(errorMsg);
          }
          errorMsg.textContent = 'This field is required.';
        }
      } else {
        if(input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
          isValid = false;
          if(group) {
            group.classList.add('has-error');
            group.classList.remove('has-success');
            let errorMsg = group.querySelector('.form-error-msg');
            if(errorMsg) errorMsg.textContent = 'Please enter a valid email address.';
          }
        } else {
          if(group) {
            group.classList.remove('has-error');
            group.classList.add('has-success');
          }
        }
      }
    });

    // Checkbox terms
    const terms = formElement.querySelector('input[name="terms"]');
    if (terms && !terms.checked) {
      isValid = false;
      const group = terms.closest('.form-group');
      if (group) {
        group.classList.add('has-error');
      }
    }

    return isValid;
  };

  // Real-time validation clear
  document.body.addEventListener('input', (e) => {
    if (e.target.matches('.form-control, input[type="checkbox"]')) {
      const group = e.target.closest('.form-group');
      if (group) {
        group.classList.remove('has-error');
      }
    }
  });

  // Example: Contact form
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (validateForm(contactForm)) {
        const btn = contactForm.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="ph-fill ph-check-circle"></i> Sent Successfully';
        btn.classList.replace('btn-primary', 'btn-secondary');
        contactForm.reset();
        
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.classList.replace('btn-secondary', 'btn-primary');
          contactForm.querySelectorAll('.form-group').forEach(g => g.classList.remove('has-success'));
        }, 3000);
      }
    });
  }
});
