/* ==========================================================
   AURA CRICKET ACADEMY - MAIN APPLICATION ENGINE
   Preloader, Sticky Nav, Counter Up, 3D Tilt, Gallery Lightbox,
   Testimonials Carousel, Notifications & Modals
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. PRELOADER DISMISSAL
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        preloader.classList.add('loaded');
      }, 600);
    });
    // Fallback if load already fired
    setTimeout(() => {
      preloader.classList.add('loaded');
    }, 1200);
  }

  // 2. STICKY NAVBAR & SCROLL SPY
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }

    // Scroll Spy active update
    let current = '';
    sections.forEach(sec => {
      const secTop = sec.offsetTop - 120;
      const secHeight = sec.offsetHeight;
      if (window.scrollY >= secTop && window.scrollY < secTop + secHeight) {
        current = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // 3. MOBILE MENU TOGGLE
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });

    // Close when clicking nav links
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const icon = mobileToggle.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-xmark');
        }
      });
    });
  }

  // 4. THEME TOGGLE (DARK / LIGHT LUXURY)
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    const savedTheme = localStorage.getItem('aura_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('aura_theme', newTheme);
      updateThemeIcon(newTheme);
      showToast('Theme Updated', `Switched to ${newTheme.toUpperCase()} mode`, 'info');
    });
  }

  function updateThemeIcon(theme) {
    const icon = themeToggle?.querySelector('i');
    if (icon) {
      if (theme === 'light') {
        icon.className = 'fa-solid fa-moon';
      } else {
        icon.className = 'fa-solid fa-sun';
      }
    }
  }

  // 5. ANIMATED STAT COUNTERS (1000+ Students, 50+ Coaches, etc.)
  const counters = document.querySelectorAll('.counter-value');
  let countersAnimated = false;

  function runCounters() {
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'), 10);
      const duration = 2000; // 2 seconds
      const startTime = performance.now();

      function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Easing out quad
        const easeProgress = 1 - (1 - progress) * (1 - progress);
        const currentCount = Math.floor(easeProgress * target);

        counter.innerText = currentCount;

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          counter.innerText = target;
        }
      }

      requestAnimationFrame(updateCounter);
    });
  }

  const statsSection = document.getElementById('statistics');
  if (statsSection && counters.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !countersAnimated) {
          countersAnimated = true;
          runCounters();
        }
      });
    }, { threshold: 0.3 });
    observer.observe(statsSection);
  }

  // 6. 3D CARD TILT EFFECT (Vanilla Tilt Inspired)
  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -12; // tilt angle
      const rotateY = ((x - centerX) / centerX) * 12;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });

  // 7. TESTIMONIALS SLIDER
  const slides = document.querySelectorAll('.testimonial-slide');
  const dotsContainer = document.querySelector('.testimonial-dots');
  let currentSlide = 0;
  let slideInterval;

  if (slides.length > 0) {
    // Generate dots
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      slides.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.classList.add('testimonial-dot');
        if (idx === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(idx));
        dotsContainer.appendChild(dot);
      });
    }

    function goToSlide(index) {
      slides[currentSlide].classList.remove('active');
      const dots = dotsContainer?.querySelectorAll('.testimonial-dot');
      if (dots && dots[currentSlide]) dots[currentSlide].classList.remove('active');

      currentSlide = (index + slides.length) % slides.length;

      slides[currentSlide].classList.add('active');
      if (dots && dots[currentSlide]) dots[currentSlide].classList.add('active');
    }

    function startAutoSlide() {
      slideInterval = setInterval(() => {
        goToSlide(currentSlide + 1);
      }, 5000);
    }

    function stopAutoSlide() {
      clearInterval(slideInterval);
    }

    const nextBtn = document.querySelector('.testimonial-next');
    const prevBtn = document.querySelector('.testimonial-prev');

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        stopAutoSlide();
        goToSlide(currentSlide + 1);
        startAutoSlide();
      });
    }
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        stopAutoSlide();
        goToSlide(currentSlide - 1);
        startAutoSlide();
      });
    }

    startAutoSlide();
  }

  // 8. MASONRY GALLERY FILTER & LIGHTBOX MODAL
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightboxModal = document.getElementById('gallery-lightbox');
  const lightboxImg = document.getElementById('lightbox-image');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filterValue = btn.getAttribute('data-filter');

      galleryItems.forEach(item => {
        const category = item.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          item.style.display = 'block';
          item.style.animation = 'fadeInView 0.5s ease forwards';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // Lightbox open
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const caption = item.querySelector('.gallery-overlay h4')?.innerText || '';
      if (lightboxModal && lightboxImg) {
        lightboxImg.src = img.src;
        if (lightboxCaption) lightboxCaption.innerText = caption;
        lightboxModal.classList.add('active');
      }
    });
  });

  if (lightboxClose && lightboxModal) {
    lightboxClose.addEventListener('click', () => {
      lightboxModal.classList.remove('active');
    });
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        lightboxModal.classList.remove('active');
      }
    });
  }

  // 9. JOIN NOW / TRIAL BOOKING MODAL
  const trialModal = document.getElementById('trial-modal');
  const openTrialBtns = document.querySelectorAll('.open-trial-modal');
  const closeTrialBtn = document.getElementById('close-trial-modal');
  const trialForm = document.getElementById('trial-booking-form');

  openTrialBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (trialModal) trialModal.classList.add('active');
    });
  });

  if (closeTrialBtn && trialModal) {
    closeTrialBtn.addEventListener('click', () => {
      trialModal.classList.remove('active');
    });
    trialModal.addEventListener('click', (e) => {
      if (e.target === trialModal) {
        trialModal.classList.remove('active');
      }
    });
  }

  if (trialForm) {
    trialForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('trial-name')?.value || 'Athlete';
      const program = document.getElementById('trial-program')?.value || 'Cricket Masterclass';
      
      showToast('Application Received!', `Welcome ${name}! Your trial session for ${program} is confirmed. Our coach will contact you.`, 'success');
      trialModal?.classList.remove('active');
      trialForm.reset();
    });
  }

  // 10. NEWSLETTER FORM HANDLER
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = newsletterForm.querySelector('input[type="email"]')?.value;
      if (email) {
        showToast('Subscribed to Aura Insider', `Scouting updates will be dispatched to ${email}`, 'gold');
        newsletterForm.reset();
      }
    });
  }

  // 11. SCROLL REVEAL ANIMATIONS
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.15 });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // Initial Welcome Toast
  setTimeout(() => {
    showToast('Welcome to Aura Cricket Academy', '4000-Lux Night Floodlight Session Live. Ready to join the elite squad?', 'cyan');
  }, 2200);
});

// GLOBAL TOAST UTILITY
window.showToast = function (title, message, type = 'cyan') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type === 'gold' ? 'toast-gold' : type === 'success' ? 'toast-green' : type === 'error' ? 'toast-red' : ''}`;

  let iconClass = 'fa-solid fa-bolt';
  if (type === 'gold') iconClass = 'fa-solid fa-trophy';
  if (type === 'success') iconClass = 'fa-solid fa-circle-check';
  if (type === 'error') iconClass = 'fa-solid fa-triangle-exclamation';

  toast.innerHTML = `
    <div class="toast-icon"><i class="${iconClass}"></i></div>
    <div class="toast-body">
      <h4>${title}</h4>
      <p>${message}</p>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastSlideOut 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards';
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 4500);
};
