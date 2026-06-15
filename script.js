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
            const email = this.querySelector('input[type="email"]').value;
            alert('Thank you for subscribing! Welcome to the Coco Cartel inner circle.');
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
    // GALLERY HORIZONTAL SCROLL WITH WHEEL
    // ============================================
    const galleryScroll = document.querySelector('.gallery-scroll');
    if (galleryScroll) {
        galleryScroll.addEventListener('wheel', (e) => {
            if (e.deltaY !== 0) {
                e.preventDefault();
                galleryScroll.scrollLeft += e.deltaY;
            }
        });
    }
    
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
    
});