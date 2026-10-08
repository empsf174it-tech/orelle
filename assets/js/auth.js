// Auth & Demo Session Management

const AUTH_KEY = 'orelle_demo_user';
const USERS_DB_KEY = 'orelle_demo_db';

class Auth {
  static init() {
    this.updateNavUI();
  }

  static getCurrentUser() {
    const user = localStorage.getItem(AUTH_KEY);
    return user ? JSON.parse(user) : null;
  }

  static login(email, password) {
    // Demo only: accept any email/password, just create a mock session
    // Retrieve existing user data or create new
    let db = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '{}');
    let userData = db[email];
    
    if (!userData) {
      // First time login for this email in demo, init demo profile
      userData = {
        name: email.split('@')[0],
        email: email,
        points: window.LoyaltyData.LOYALTY_RULES.welcomeBonus,
        orders: [],
        savedScents: [],
        savedDesigns: []
      };
      db[email] = userData;
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
    }
    
    localStorage.setItem(AUTH_KEY, JSON.stringify({ email: email, name: userData.name }));
    this.updateNavUI();
    return true;
  }

  static register(name, email, password) {
    let db = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '{}');
    if (db[email]) {
      throw new Error("Email already registered in demo db.");
    }
    
    const userData = {
      name: name,
      email: email,
      points: window.LoyaltyData.LOYALTY_RULES.welcomeBonus,
      orders: [],
      savedScents: [],
      savedDesigns: []
    };
    db[email] = userData;
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
    
    localStorage.setItem(AUTH_KEY, JSON.stringify({ email: email, name: name }));
    this.updateNavUI();
    return true;
  }

  static logout() {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = 'login.html';
  }

  static updateNavUI() {
    const user = this.getCurrentUser();
    const loginBtns = document.querySelectorAll('.login-btn'); // For desktop and mobile nav
    
    loginBtns.forEach(btn => {
      // The demo guest session (from opening the dashboard) still shows "Login"
      if (user && !this.isGuest()) {
        btn.innerHTML = `<i class="ph ph-user"></i> ${user.name}`;
        btn.href = 'dashboard.html';
      } else {
        btn.innerHTML = 'Login';
        btn.href = 'login.html';
      }
    });
  }

  static guard(redirectUrl = 'login.html') {
    if (!this.getCurrentUser()) {
      // Store intended destination
      sessionStorage.setItem('orelle_redirect', window.location.href);
      window.location.href = redirectUrl;
    }
  }

  static isGuest() {
    const user = this.getCurrentUser();
    return !!user && user.email === 'guest@orelle.demo';
  }

  // Open a demo guest session so pages like the dashboard work without logging in
  static ensureGuest() {
    if (this.getCurrentUser()) return;
    const email = 'guest@orelle.demo';
    let db = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '{}');
    if (!db[email]) {
      db[email] = {
        name: 'Guest',
        email: email,
        points: window.LoyaltyData.LOYALTY_RULES.welcomeBonus,
        orders: [],
        savedScents: [],
        savedDesigns: []
      };
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
    }
    localStorage.setItem(AUTH_KEY, JSON.stringify({ email: email, name: db[email].name }));
    this.updateNavUI();
  }

  // User specific data access
  static getUserData() {
    const user = this.getCurrentUser();
    if (!user) return null;
    const db = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '{}');
    return db[user.email];
  }

  static saveUserData(data) {
    const user = this.getCurrentUser();
    if (!user) return;
    const db = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '{}');
    db[user.email] = data;
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
  }
  
  static resetDemoData() {
    const user = this.getCurrentUser();
    if (!user) return;
    const db = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '{}');
    db[user.email] = {
      name: user.name,
      email: user.email,
      points: window.LoyaltyData.LOYALTY_RULES.welcomeBonus,
      orders: [],
      savedScents: [],
      savedDesigns: []
    };
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
    window.location.reload();
  }
}

document.addEventListener('DOMContentLoaded', () => Auth.init());
window.Auth = Auth;
