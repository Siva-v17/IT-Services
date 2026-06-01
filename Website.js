const PAGES = ['home','about','services','blog','contact','login','admin'];
let mobileMenuOpen = false;
let currentPage = 'home';


function toggleMobileMenu(){
  document.getElementById("mobileMenu").classList.toggle("active");
}

(function injectFooters() {
  const tpl = document.getElementById('footer-tpl');
  if (!tpl) return;
  document.querySelectorAll('footer.auto-footer').forEach(footer => {
    footer.innerHTML = tpl.innerHTML;
  });
})();

function showPage(name, skipHistory) {
  PAGES.forEach(p => {
    const el = document.getElementById('page-' + p);
    if (el) el.classList.toggle('active', p === name);
    const nav = document.getElementById('nav-' + p);
    if (nav) nav.classList.toggle('active', p === name);
    const mnav = document.getElementById('mnav-' + p);
    if (mnav) mnav.classList.toggle('active', p === name);
  });
  currentPage = name;
  window.scrollTo({ top: 0, behavior: 'instant' });
  initReveal();
  //  error
  // Animate progress bars on admin page
  if (name === 'admin') animateProgressBars();
  // Hide nav on admin page (has own sidebar), show on others
  const adminMode = name === 'admin';
  document.getElementById('mainNav').style.display = adminMode ? 'none' : '';
  document.getElementById('mobileMenu').style.display = '';
  mobileMenuOpen = false;
  document.getElementById('hamburger').classList.remove('open');
  // Mobile logout button
  const mlb = document.getElementById('mobile-logout-btn');
  if (mlb) mlb.style.display = adminMode && window.innerWidth <= 900 ? 'block' : 'none';
}

function toggleMobileMenu() {
  mobileMenuOpen = !mobileMenuOpen;
  document.getElementById('mobileMenu').classList.toggle('open', mobileMenuOpen);
  document.getElementById('hamburger').classList.toggle('open', mobileMenuOpen);
}

// SCROLL EFFECT
window.addEventListener('scroll', () => {
  document.getElementById('mainNav').classList.toggle('scrolled', window.scrollY > 40);
});

// REVEAL ON SCROLL 
let revealObserver;
function initReveal() {
  if (revealObserver) revealObserver.disconnect();
  setTimeout(() => {
    const els = document.querySelectorAll('.page.active .reveal');
    els.forEach(el => el.classList.remove('visible'));
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    els.forEach(el => revealObserver.observe(el));
  }, 50);
}
initReveal();

// SIDEBAR ACTIVE ITEM 
document.querySelectorAll('.sidebar-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
  });
});

// PROGRESS BARS
function animateProgressBars() {
  setTimeout(() => {
    document.querySelectorAll('.pb-fill').forEach(bar => {
      bar.style.width = bar.getAttribute('data-width') + '%';
    });
  }, 300);
}

// LOGIN TAB SWITCH 
function switchLoginTab(tab) {
  const isAdmin = tab === 'admin';
  document.getElementById('login-user').style.display = isAdmin ? 'none' : 'block';
  document.getElementById('login-admin').style.display = isAdmin ? 'block' : 'none';
  document.getElementById('tab-user').classList.toggle('active', !isAdmin);
  document.getElementById('tab-admin').classList.toggle('active', isAdmin);
  document.getElementById('loginTitle').textContent = isAdmin ? 'Admin Access' : 'Welcome back';
  document.getElementById('loginSubtitle').textContent = isAdmin ? 'Restricted — authorised use only' : 'Sign in to your Stackly account';
  clearLoginErrors();
}

// AUTH VIEW SWITCH (signin / signup)
function switchAuthView(view) {
  const isSignup = view === 'signup';
  document.getElementById('panel-signin').style.display = isSignup ? 'none' : 'block';
  document.getElementById('panel-signup').style.display = isSignup ? 'block' : 'none';
  document.getElementById('loginTitle').textContent = isSignup ? 'Create Account' : 'Welcome back';
  document.getElementById('loginSubtitle').textContent = isSignup ? 'Join Stackly today' : 'Sign in to your Stackly account';
  clearLoginErrors();
}

// FORM VALIDATION HELPERS
function setError(fgId, show) {
  const fg = document.getElementById(fgId);
  if (!fg) return;
  fg.classList.toggle('has-error', show);
  const input = fg.querySelector('.form-control');
  if (input) input.classList.toggle('error', show);
}
function clearLoginErrors() {
  document.querySelectorAll('.form-group.has-error').forEach(fg => {
    fg.classList.remove('has-error');
    const input = fg.querySelector('.form-control');
    if (input) input.classList.remove('error');
  });
}
function isValidEmail(val) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()); }

// USER LOGIN 
function handleUserLogin(btn) {
  clearLoginErrors();
  const email = document.getElementById('li-email').value.trim();
  const pass = document.getElementById('li-pass').value;
  let valid = true;
  if (!isValidEmail(email)) { setError('fg-li-email', true); valid = false; }
  if (!pass) { setError('fg-li-pass', true); valid = false; }
  if (!valid) return;
  setButtonLoading(btn, 'Signing in...');
  setTimeout(() => {
    setButtonSuccess(btn, '✓ Signed In', () => {
      showPage('home');
      showToast('✓ Welcome back! You are signed in.', 'success');
    });
  }, 1200);
}

//  USER SIGN UP
function handleUserSignup(btn) {
  clearLoginErrors();
  const fname = document.getElementById('su-fname').value.trim();
  const lname = document.getElementById('su-lname').value.trim();
  const email = document.getElementById('su-email').value.trim();
  const pass = document.getElementById('su-pass').value;
  const pass2 = document.getElementById('su-pass2').value;
  let valid = true;
  if (!fname) { setError('fg-su-fname', true); valid = false; }
  if (!lname) { setError('fg-su-lname', true); valid = false; }
  if (!isValidEmail(email)) { setError('fg-su-email', true); valid = false; }
  if (pass.length < 8) { setError('fg-su-pass', true); valid = false; }
  if (pass !== pass2) { setError('fg-su-pass2', true); valid = false; }
  if (!valid) return;
  setButtonLoading(btn, 'Creating account...');
  setTimeout(() => {
    setButtonSuccess(btn, '✓ Account Created', () => {
      showPage('home');
      showToast('🎉 Account created! Welcome to Stackly.', 'success');
    });
  }, 1400);
}

// ADMIN LOGIN
function handleAdminLogin(btn) {
  clearLoginErrors();
  const email = document.getElementById('adm-email').value.trim();
  const pass = document.getElementById('adm-pass').value;
  const otp = document.getElementById('adm-otp').value.trim();
  let valid = true;
  if (!isValidEmail(email)) { setError('fg-adm-email', true); valid = false; }
  if (!pass) { setError('fg-adm-pass', true); valid = false; }
  if (!/^\d{6}$/.test(otp)) { setError('fg-adm-otp', true); valid = false; }
  if (!valid) return;
  setButtonLoading(btn, 'Verifying...');
  setTimeout(() => {
    setButtonSuccess(btn, '✓ Access Granted', () => {
      showPage('admin');
      showToast('🛡️ Admin session started. All activity is monitored.', 'success');
    }, 'linear-gradient(135deg,#00c853,#00e676)');
  }, 1500);
}

// LOGOUT 
function handleLogout() {
  showPage('login');
  showToast('You have been signed out securely.', 'success');
}

// CONTACT FORM
function handleContactSubmit(btn) {
  const fname = document.getElementById('c-fname').value.trim();
  const lname = document.getElementById('c-lname').value.trim();
  const email = document.getElementById('c-email').value.trim();
  const company = document.getElementById('c-company').value.trim();
  const msg = document.getElementById('c-message').value.trim();
  let valid = true;
  [['fg-fname', !fname], ['fg-lname', !lname], ['fg-email', !isValidEmail(email)],
   ['fg-company', !company], ['fg-msg', !msg]].forEach(([id, err]) => {
    setError(id, err); if (err) valid = false;
  });
  if (!valid) return;
  setButtonLoading(btn, 'Sending...');
  setTimeout(() => {
    setButtonSuccess(btn, '✓ Message Sent!', null, 'linear-gradient(135deg,#00c853,#00e676)');
    showToast('✓ Your message has been sent. We\'ll respond within 2 hours.', 'success');
  }, 1200);
}

// BUTTON HELPERS
function setButtonLoading(btn, text) {
  btn.disabled = true;
  btn.dataset.orig = btn.textContent;
  btn.dataset.origBg = btn.style.background || '';
  btn.textContent = text;
  btn.style.opacity = '.8';
}
function setButtonSuccess(btn, text, callback, bg) {
  btn.textContent = text;
  btn.style.background = bg || 'linear-gradient(135deg,#00c853,#00e676)';
  btn.style.opacity = '1';
  if (callback) setTimeout(callback, 600);
  setTimeout(() => {
    btn.textContent = btn.dataset.orig;
    btn.style.background = btn.dataset.origBg;
    btn.disabled = false;
  }, callback ? 2000 : 3000);
}

// TOAST
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.className = 'toast ' + type;
  t.innerHTML = (type === 'success' ? '<span style="color:#00e676;font-size:18px">✓</span> ' : '<span style="color:var(--accent3);font-size:18px">!</span> ') + msg;
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); }, 4000);
}

// INPUT LIVE CLEAR
document.querySelectorAll('.form-control').forEach(input => {
  input.addEventListener('input', () => {
    const fg = input.closest('.form-group');
    if (fg && input.value.trim()) {
      fg.classList.remove('has-error');
      input.classList.remove('error');
    }
  });
});

// OTP: numbers only
const otpInput = document.getElementById('adm-otp');
if (otpInput) {
  otpInput.addEventListener('input', e => {
    e.target.value = e.target.value.replace(/\D/g,'').slice(0,6);
  });
}

// RESPONSIVE ADMIN SIDEBAR
function handleResize() {
  const mlb = document.getElementById('mobile-logout-btn');
  if (mlb && currentPage === 'admin') {
    mlb.style.display = window.innerWidth <= 900 ? 'block' : 'none';
  }
}
window.addEventListener('resize', handleResize);