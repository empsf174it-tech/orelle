// Auth Pages UI (password visibility, inline errors, demo social sign-in)

const AuthUI = {
  EMAIL_RE: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  // Real accounts skip the auth pages; the demo guest session does not count
  redirectIfLoggedIn() {
    if (window.Auth.getCurrentUser() && !window.Auth.isGuest()) {
      window.location.href = 'dashboard.html';
    }
  },

  goToDestination() {
    const redir = sessionStorage.getItem('orelle_redirect');
    sessionStorage.removeItem('orelle_redirect');
    window.location.href = redir || 'dashboard.html';
  },

  setError(input, message) {
    const group = input.closest('.auth-field');
    group.classList.add('has-error');
    group.querySelector('.auth-error').textContent = message;
  },

  clearErrors(form) {
    form.querySelectorAll('.auth-field.has-error').forEach(g => g.classList.remove('has-error'));
  },

  initPasswordToggles() {
    document.querySelectorAll('.auth-eye').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = btn.parentElement.querySelector('input');
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
        btn.querySelector('i').className = show ? 'ph ph-eye-slash' : 'ph ph-eye';
      });
    });
  },

  initErrorClearing() {
    document.body.addEventListener('input', (e) => {
      const group = e.target.closest('.auth-field');
      if (group) group.classList.remove('has-error');
    });
  },

  // Demo only: social buttons sign into a provider-specific demo account
  socialSignIn(provider) {
    const email = `demo@${provider}.com`;
    const name = provider === 'apple' ? 'Apple User' : 'Google User';
    try {
      window.Auth.register(name, email, 'demopass');
    } catch (e) {
      window.Auth.login(email, 'demopass');
    }
    this.goToDestination();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  AuthUI.initPasswordToggles();
  AuthUI.initErrorClearing();
  document.querySelectorAll('[data-social]').forEach(btn => {
    btn.addEventListener('click', () => AuthUI.socialSignIn(btn.dataset.social));
  });
});

window.AuthUI = AuthUI;
