// ============================================
// COCO CARTEL — INTERACTIVE SCRIPTS
// ============================================

document.addEventListener('DOMContentLoaded', function() {

  // ============================================
  // NAVIGATION SCROLL EFFECT
  // ============================================
  const navbar = document.getElementById('navbar');
  const navLinks = document.getElementById('navLinks');
  const hamburger = document.getElementById('hamburger');

  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // ============================================
  // MOBILE HAMBURGER MENU
  // ============================================
  hamburger.addEventListener('click', function() {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function() {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });

  // ============================================
  // SCROLL REVEAL (Intersection Observer)
  // ============================================
  const fadeElements = document.querySelectorAll('.fade-in');

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  fadeElements.forEach(el => {
    fadeObserver.observe(el);
  });

  // ============================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offsetTop = target.offsetTop - 80;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  // ============================================
  // NEWSLETTER FORM
  // ============================================
  const newsletterForm = document.getElementById('newsletterForm');

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      alert('Thank you for subscribing! Welcome to the Coco Cartel inner circle.');
      this.reset();
    });
  }

  // ============================================
  // CONTACT FORM
  // ============================================
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      alert('Thank you for your message! We will get back to you soon.');
      this.reset();
    });
  }

  // ============================================
  // COLLECTION CARD STAGGERED ANIMATION
  // ============================================
  const collectionCards = document.querySelectorAll('.collection-card');
  collectionCards.forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.1}s`;
  });

  // ============================================
  // NAVBAR ACTIVE LINK HIGHLIGHTING
  // ============================================
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', function() {
    let current = '';

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;

      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navItems.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  });

  // ============================================
  // PRODUCTS PAGE — FILTER & SORT
  // ============================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');
  const productsEmpty = document.getElementById('productsEmpty');
  const productsCount = document.getElementById('productsCount');
  const sortSelect = document.getElementById('sortSelect');
  const resetFilterBtn = document.getElementById('resetFilterBtn');

  if (filterBtns.length > 0) {
    const urlParams = new URLSearchParams(window.location.search);
    const urlCategory = urlParams.get('category');

    if (urlCategory) {
      filterBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-category') === urlCategory) {
          btn.classList.add('active');
        }
      });
      filterProducts(urlCategory);
    }

    filterBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        filterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        filterProducts(this.getAttribute('data-category'));
      });
    });

    if (resetFilterBtn) {
      resetFilterBtn.addEventListener('click', function() {
        filterBtns.forEach(b => b.classList.remove('active'));
        document.querySelector('.filter-btn[data-category="all"]').classList.add('active');
        filterProducts('all');
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', function() {
        const grid = document.getElementById('productsGrid');
        const cards = Array.from(grid.querySelectorAll('.product-card:not(.hidden)'));

        cards.sort((a, b) => {
          const priceA = parseInt(a.querySelector('.product-card-price').textContent.replace(/[^0-9]/g, ''));
          const priceB = parseInt(b.querySelector('.product-card-price').textContent.replace(/[^0-9]/g, ''));

          if (sortSelect.value === 'price-low') return priceA - priceB;
          if (sortSelect.value === 'price-high') return priceB - priceA;
          return 0;
        });

        cards.forEach(card => grid.appendChild(card));
      });
    }
  }

  function filterProducts(category) {
    const cards = document.querySelectorAll('.product-card');
    let visibleCount = 0;

    cards.forEach(card => {
      if (category === 'all' || card.getAttribute('data-category') === category) {
        card.classList.remove('hidden');
        visibleCount++;
      } else {
        card.classList.add('hidden');
      }
    });

    if (productsCount) {
      productsCount.textContent = visibleCount === cards.length
        ? 'Showing all pieces'
        : `Showing ${visibleCount} piece${visibleCount !== 1 ? 's' : ''}`;
    }

    if (productsEmpty) {
      productsEmpty.style.display = visibleCount === 0 ? 'flex' : 'none';
    }
  }

  // ============================================
  // DASHBOARD — TAB SWITCHING
  // ============================================
  const dashNavItems = document.querySelectorAll('.dash-nav-item[data-tab]');
  const dashTabs = document.querySelectorAll('.dash-tab');

  dashNavItems.forEach(item => {
    item.addEventListener('click', function() {
      const target = this.getAttribute('data-tab');

      dashNavItems.forEach(n => n.classList.remove('active'));
      dashTabs.forEach(t => t.classList.remove('active'));

      this.classList.add('active');
      const targetTab = document.getElementById('tab-' + target);
      if (targetTab) targetTab.classList.add('active');
    });
  });

  // ============================================
  // DASHBOARD — LOGIN/REGISTER MODAL
  // ============================================
  const loginModal = document.getElementById('loginModal');
  const loginTabBtn = document.getElementById('loginTabBtn');
  const registerTabBtn = document.getElementById('registerTabBtn');
  const loginFormEl = document.getElementById('loginFormEl');
  const registerFormEl = document.getElementById('registerFormEl');
  const modalMessage = document.getElementById('modalMessage');
  const logoutBtn = document.getElementById('logoutBtn');

  const API_BASE = 'http://localhost:5000/api';

  const token = localStorage.getItem('cocoToken');
  const userData = JSON.parse(localStorage.getItem('cocoUser') || 'null');

  if (loginModal) {
    if (token && userData) {
      loginModal.classList.add('hidden');
      const profileName = document.getElementById('profileName');
      const profileEmail = document.getElementById('profileEmail');
      if (profileName) profileName.textContent = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Member';
      if (profileEmail) profileEmail.textContent = userData.email || '';
    } else {
      loginModal.classList.remove('hidden');
    }
  }

  if (loginTabBtn && registerTabBtn) {
    loginTabBtn.addEventListener('click', function() {
      loginTabBtn.classList.add('active');
      registerTabBtn.classList.remove('active');
      document.getElementById('loginForm').classList.add('active');
      document.getElementById('registerForm').classList.remove('active');
      if (modalMessage) modalMessage.textContent = '';
    });

    registerTabBtn.addEventListener('click', function() {
      registerTabBtn.classList.add('active');
      loginTabBtn.classList.remove('active');
      document.getElementById('registerForm').classList.add('active');
      document.getElementById('loginForm').classList.remove('active');
      if (modalMessage) modalMessage.textContent = '';
    });
  }

  if (loginFormEl) {
    loginFormEl.addEventListener('submit', async function(e) {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;

      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (data.success) {
          localStorage.setItem('cocoToken', data.data.token);
          localStorage.setItem('cocoUser', JSON.stringify(data.data.user));
          modalMessage.textContent = 'Login successful! Welcome back.';
          modalMessage.className = 'modal-message success';
          setTimeout(() => {
            loginModal.classList.add('hidden');
            location.reload();
          }, 1000);
        } else {
          modalMessage.textContent = data.message || 'Login failed. Please try again.';
          modalMessage.className = 'modal-message error';
        }
      } catch (error) {
        modalMessage.textContent = 'Connection error. Please try again.';
        modalMessage.className = 'modal-message error';
      }
    });
  }

  if (registerFormEl) {
    registerFormEl.addEventListener('submit', async function(e) {
      e.preventDefault();
      const firstName = document.getElementById('regFirstName').value;
      const lastName = document.getElementById('regLastName').value;
      const email = document.getElementById('regEmail').value;
      const password = document.getElementById('regPassword').value;

      try {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstName, lastName, email, password })
        });

        const data = await res.json();

        if (data.success) {
          localStorage.setItem('cocoToken', data.data.token);
          localStorage.setItem('cocoUser', JSON.stringify(data.data.user));
          modalMessage.textContent = 'Account created! Welcome to Coco Cartel.';
          modalMessage.className = 'modal-message success';
          setTimeout(() => {
            loginModal.classList.add('hidden');
            location.reload();
          }, 1000);
        } else {
          modalMessage.textContent = data.message || 'Registration failed. Please try again.';
          modalMessage.className = 'modal-message error';
        }
      } catch (error) {
        modalMessage.textContent = 'Connection error. Please try again.';
        modalMessage.className = 'modal-message error';
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      localStorage.removeItem('cocoToken');
      localStorage.removeItem('cocoUser');
      location.reload();
    });
  }

  const passwordForm = document.getElementById('passwordForm');
  if (passwordForm) {
    passwordForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const currentPassword = document.getElementById('currentPassword').value;
      const newPassword = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      if (newPassword !== confirmPassword) {
        alert('New passwords do not match.');
        return;
      }

      if (newPassword.length < 6) {
        alert('Password must be at least 6 characters.');
        return;
      }

      try {
        const token = localStorage.getItem('cocoToken');
        const res = await fetch(`${API_BASE}/auth/change-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await res.json();

        if (data.success) {
          alert('Password updated successfully.');
          passwordForm.reset();
        } else {
          alert(data.message || 'Failed to update password.');
        }
      } catch (error) {
        alert('Connection error. Please try again.');
      }
    });
  }

});