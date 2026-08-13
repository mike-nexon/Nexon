/**
 * NEXUS DIGITAL - INTERACTIVE ENGINE
 * Multi-featured JS script powering theme toggling, interactive quote calculator,
 * portfolio filters, modals, carousel, mobile drawer, and form validation.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ==========================================================================
     1. THEME TOGGLE SYSTEM (DARK / LIGHT)
     ========================================================================== */
  const htmlEl = document.documentElement;
  const themeToggleBtn = document.getElementById('themeToggleBtn');

  // Load saved theme or default to dark
  const savedTheme = localStorage.getItem('nexus_theme') || 'dark';
  htmlEl.setAttribute('data-theme', savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlEl.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      htmlEl.setAttribute('data-theme', newTheme);
      localStorage.setItem('nexus_theme', newTheme);
      showToast(`Switched to ${newTheme.toUpperCase()} mode`, 'info');
    });
  }

  /* ==========================================================================
     2. ANNOUNCEMENT BAR DISMISSAL
     ========================================================================== */
  const announcementBar = document.getElementById('announcementBar');
  const closeAnnouncementBtn = document.getElementById('closeAnnouncement');

  if (sessionStorage.getItem('announcement_closed') === 'true' && announcementBar) {
    announcementBar.style.display = 'none';
  }

  if (closeAnnouncementBtn && announcementBar) {
    closeAnnouncementBtn.addEventListener('click', () => {
      announcementBar.style.display = 'none';
      sessionStorage.setItem('announcement_closed', 'true');
    });
  }

  /* ==========================================================================
     3. MOBILE DRAWER NAVIGATION & BOTTOM NAV
     ========================================================================== */
  const mobileToggleBtn = document.getElementById('mobileToggleBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const drawerCloseBtn = document.getElementById('drawerCloseBtn');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function openDrawer() {
    mobileDrawer.classList.add('open');
    drawerBackdrop.classList.add('open');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    mobileToggleBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    mobileDrawer.classList.remove('open');
    drawerBackdrop.classList.remove('open');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    mobileToggleBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (mobileToggleBtn) mobileToggleBtn.addEventListener('click', openDrawer);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  /* ==========================================================================
     4. HEADER SCROLL EFFECT & SECTION HIGHLIGHTER
     ========================================================================== */
  const siteHeader = document.getElementById('siteHeader');
  const sections = document.querySelectorAll('section[id]');
  const desktopNavLinks = document.querySelectorAll('.nav-link');
  const bottomNavItems = document.querySelectorAll('.bottom-nav-item');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      siteHeader.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
    } else {
      siteHeader.style.boxShadow = 'none';
    }
  });

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        
        // Update desktop nav
        desktopNavLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });

        // Update mobile bottom nav
        bottomNavItems.forEach(item => {
          const href = item.getAttribute('href');
          item.classList.toggle('active', href === `#${id}`);
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(section => sectionObserver.observe(section));

  /* ==========================================================================
     5. INTERACTIVE PROJECT COST CALCULATOR
     ========================================================================== */
  const calcTypeBtns = document.querySelectorAll('#calcTypeGrid .calc-option');
  const calcCheckboxes = document.querySelectorAll('#calcFeaturesGrid input[type="checkbox"]');
  const calcSpeedBtns = document.querySelectorAll('#calcSpeedGrid .speed-btn');
  const calcPriceDisplay = document.getElementById('calcPriceDisplay');
  const calcTimeDisplay = document.getElementById('calcTimeDisplay');
  const applyQuoteBtn = document.getElementById('applyQuoteBtn');

  // Calculator State
  let calcState = {
    typeCost: 3500,
    typeTimeWeeks: 4,
    typeLabel: 'Web Application',
    serviceValue: 'web',
    featuresCost: 2500,
    featuresTimeWeeks: 3.5,
    speedMultiplier: 1.15,
    speedLabel: 'Priority Sprint'
  };

  // Type selection
  calcTypeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      calcTypeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      calcState.typeCost = parseFloat(btn.dataset.base);
      calcState.typeTimeWeeks = parseFloat(btn.dataset.time);
      calcState.typeLabel = btn.querySelector('.option-title').textContent;
      calcState.serviceValue = btn.dataset.type;
      updateCalculator();
    });
  });

  // Checkbox feature selection
  calcCheckboxes.forEach(cb => {
    cb.addEventListener('change', updateCalculator);
  });

  // Speed selection
  calcSpeedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      calcSpeedBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      calcState.speedMultiplier = parseFloat(btn.dataset.multiplier);
      calcState.speedLabel = btn.querySelector('span').textContent;
      updateCalculator();
    });
  });

  function updateCalculator() {
    let featuresSum = 0;
    let extraWeeks = 0;

    calcCheckboxes.forEach(cb => {
      if (cb.checked) {
        featuresSum += parseFloat(cb.dataset.cost);
        extraWeeks += parseFloat(cb.dataset.weeks);
      }
    });

    const subtotal = (calcState.typeCost + featuresSum) * calcState.speedMultiplier;
    const minPrice = Math.round(subtotal * 0.95);
    const maxPrice = Math.round(subtotal * 1.15);

    let totalWeeks = Math.ceil((calcState.typeTimeWeeks + extraWeeks) / (calcState.speedMultiplier > 1.2 ? 1.3 : 1.0));
    if (totalWeeks < 2) totalWeeks = 2;

    if (calcPriceDisplay) {
      calcPriceDisplay.textContent = `$${minPrice.toLocaleString()} - $${maxPrice.toLocaleString()}`;
    }
    if (calcTimeDisplay) {
      calcTimeDisplay.textContent = `${totalWeeks} - ${totalWeeks + 2} Weeks`;
    }
  }

  // Pre-fill contact form with quote estimate
  if (applyQuoteBtn) {
    applyQuoteBtn.addEventListener('click', () => {
      const contactServiceSelect = document.getElementById('contactService');
      const contactBudgetSelect = document.getElementById('contactBudget');
      const contactMessageArea = document.getElementById('contactMessage');

      if (contactServiceSelect && calcState.serviceValue) {
        contactServiceSelect.value = calcState.serviceValue;
      }

      if (contactBudgetSelect && calcPriceDisplay) {
        const estText = calcPriceDisplay.textContent;
        if (estText.includes('3,') || estText.includes('4,')) contactBudgetSelect.value = '$3k-$5k';
        else if (estText.includes('5,') || estText.includes('6,') || estText.includes('7,') || estText.includes('8,') || estText.includes('9,')) contactBudgetSelect.value = '$5k-$10k';
        else if (estText.includes('10,') || estText.includes('15,') || estText.includes('20,')) contactBudgetSelect.value = '$10k-$25k';
        else contactBudgetSelect.value = '$25k+';
      }

      if (contactMessageArea) {
        contactMessageArea.value = `Estimated Project: ${calcState.typeLabel}\nEstimated Price: ${calcPriceDisplay.textContent}\nEstimated Timeline: ${calcTimeDisplay.textContent}\nSpeed Option: ${calcState.speedLabel}\n\nProject Details:\n`;
      }

      // Smooth scroll to contact
      const contactSec = document.getElementById('contact');
      if (contactSec) {
        contactSec.scrollIntoView({ behavior: 'smooth' });
      }

      showToast('Calculator estimate copied to Contact Form!', 'success');
    });
  }

  // Initialize calculator
  updateCalculator();

  /* ==========================================================================
     6. PORTFOLIO FILTERING
     ========================================================================== */
  const filterBtns = document.querySelectorAll('.portfolio-filter-bar .filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.dataset.filter;

      portfolioCards.forEach(card => {
        const category = card.dataset.category;
        if (filterVal === 'all' || category === filterVal) {
          card.style.display = 'flex';
          card.style.opacity = '1';
        } else {
          card.style.display = 'none';
          card.style.opacity = '0';
        }
      });
    });
  });

  /* ==========================================================================
     7. MODAL DIALOG ENGINE (PORTFOLIO CASE STUDIES & SERVICES)
     ========================================================================== */
  const projectModal = document.getElementById('projectModal');
  const modalBody = document.getElementById('modalBody');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const viewProjectBtns = document.querySelectorAll('.view-project-btn');
  const serviceModalBtns = document.querySelectorAll('.service-modal-btn');

  const projectDetailsMap = {
    p1: {
      title: "Apex Financial Analytics Platform",
      category: "Web Application & Fintech",
      image: "assets/images/project1.jpg",
      metrics: "Handling $20M+ in Daily Transactions | +210% User Retention",
      overview: "Apex is a Next.js-powered real-time portfolio management platform built for modern investment teams. We engineered live WebSocket chart telemetry, high-density data tables, and an intuitive dashboard UI.",
      deliverables: ["Full Stack Web Architecture", "Real-Time WebSocket Engine", "Figma Design System & Components", "PCI DSS Security Compliance"],
      techStack: ["Next.js", "TypeScript", "Node.js", "Tailwind CSS", "Chart.js", "PostgreSQL"]
    },
    p2: {
      title: "AuraFit AI Fitness Tracker",
      category: "Mobile Application (iOS & Android)",
      image: "assets/images/project2.jpg",
      metrics: "100k+ Active Downloads | 4.9 Star App Store Rating",
      overview: "AuraFit brings personal training into the AI era. Featuring real-time heart rate sensor telemetry, offline biometric sync, custom AI workout recommendations, and social leaderboards.",
      deliverables: ["Cross-Platform Mobile App", "AI Neural Workout Model", "Apple Health & Google Fit API", "In-App Subscriptions (RevenueCat)"],
      techStack: ["React Native", "Expo", "GraphQL", "Python / FastAPI", "Firebase", "Stripe Mobile"]
    },
    p3: {
      title: "Lumina AI Brand & Ecosystem",
      category: "Branding & Design System",
      image: "assets/images/hero.jpg",
      metrics: "2 Global Design Awards | Series A Raised ($14M)",
      overview: "Created an end-to-end brand visual strategy, dynamic logo suite, color spectrum tokens, and multi-platform component library for an AI research ecosystem.",
      deliverables: ["Visual Brand Strategy & Guidelines", "3D Motion Graphics & Assets", "Figma UI Token Library", "Investor Pitch Deck Suite"],
      techStack: ["Figma", "Adobe Illustrator", "Cinema 4D", "CSS Design Tokens", "Lottie Animations"]
    }
  };

  const serviceDetailsMap = {
    webModal: {
      title: "Web App Development Deliverables",
      overview: "We craft custom, lightning-fast web applications designed for scale, high conversion, and seamless API integration.",
      deliverables: [
        "Production Next.js / React application repository",
        "Custom responsive dashboard and user interfaces",
        "API integration with Stripe, Auth0, PostgreSQL/Supabase",
        "Comprehensive CI/CD deployment pipeline setup (Vercel/AWS)",
        "30 Days post-launch technical warranty"
      ]
    },
    mobileModal: {
      title: "Mobile App Development Deliverables",
      overview: "Native-quality mobile applications for iOS and Android built on React Native & Flutter.",
      deliverables: [
        "iOS & Android cross-platform codebase",
        "App Store & Google Play Store publishing management",
        "Push notifications system & deep linking",
        "Offline database sync & local caching",
        "In-app purchase & subscription architecture"
      ]
    },
    uiuxModal: {
      title: "UI/UX & Design System Deliverables",
      overview: "User-centered design artifacts engineered to boost user engagement and streamline frontend development.",
      deliverables: [
        "Figma master design system with components and variants",
        "Interactive desktop & mobile high-fidelity prototypes",
        "User journey maps and wireframe documentation",
        "Accessibility compliance (WCAG 2.1 AA standard)"
      ]
    },
    brandModal: {
      title: "Brand Strategy Deliverables",
      overview: "Stand out in your market with a distinctive visual identity and brand assets.",
      deliverables: [
        "Primary, secondary, and mark logo variations",
        "Brand style guide (Color palette, Typography, Imagery rules)",
        "Social media kit & marketing banner templates",
        "Custom vector icons and asset export package"
      ]
    },
    seoModal: {
      title: "SEO & Speed Optimization Deliverables",
      overview: "Maximize organic traffic and achieve top Google Lighthouse performance scores.",
      deliverables: [
        "100/100 Core Web Vitals speed optimization",
        "Technical schema markup & OpenGraph setup",
        "Sitemap, robots.txt, and canonical URL structure",
        "Analytics & conversion event tracking integration"
      ]
    },
    aiModal: {
      title: "AI & Automation Integration Deliverables",
      overview: "Empower your product with custom AI assistants, workflows, and automated intelligence.",
      deliverables: [
        "OpenAI / Anthropic LLM API integration",
        "Custom vector database RAG pipeline setup",
        "Automated customer support chatbot widget",
        "Internal admin workflow automation scripts"
      ]
    }
  };

  function openProjectModal(key) {
    const data = projectDetailsMap[key];
    if (!data) return;

    modalBody.innerHTML = `
      <div class="modal-badge-row">
        <span class="tag">${data.category}</span>
      </div>
      <h2 class="modal-header-title">${data.title}</h2>
      <p class="modal-metrics text-emerald"><strong><i class="fa-solid fa-trophy"></i> Impact:</strong> ${data.metrics}</p>
      
      <div class="modal-img-box" style="margin: 1.25rem 0; border-radius: 12px; overflow: hidden; max-height: 280px;">
        <img src="${data.image}" alt="${data.title}" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>

      <p class="modal-overview" style="margin-bottom: 1.25rem; font-size: 0.98rem; color: var(--text-muted); line-height: 1.6;">${data.overview}</p>

      <h4 style="font-family: var(--font-display); font-weight: 700; margin-bottom: 0.5rem;">Key Deliverables:</h4>
      <ul style="margin-bottom: 1.25rem; display: flex; flex-direction: column; gap: 0.4rem;">
        ${data.deliverables.map(item => `<li style="font-size: 0.9rem;"><i class="fa-solid fa-circle-check" style="color: var(--emerald); margin-right: 0.5rem;"></i>${item}</li>`).join('')}
      </ul>

      <h4 style="font-family: var(--font-display); font-weight: 700; margin-bottom: 0.5rem;">Tech Stack Used:</h4>
      <div class="modal-tech-stack">
        ${data.techStack.map(tech => `<span class="tag" style="background: var(--bg-surface-raised); color: var(--primary);">${tech}</span>`).join('')}
      </div>

      <div style="margin-top: 1.8rem; text-align: right;">
        <a href="#contact" class="btn btn-primary close-modal-to-contact">
          <span>Request Similar Project</span>
          <i class="fa-solid fa-arrow-right"></i>
        </a>
      </div>
    `;

    projectModal.classList.add('open');
    projectModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    const modalCta = modalBody.querySelector('.close-modal-to-contact');
    if (modalCta) {
      modalCta.addEventListener('click', () => {
        closeModal();
      });
    }
  }

  function openServiceModal(key) {
    const data = serviceDetailsMap[key];
    if (!data) return;

    modalBody.innerHTML = `
      <h2 class="modal-header-title">${data.title}</h2>
      <p style="margin-bottom: 1.25rem; font-size: 0.98rem; color: var(--text-muted); line-height: 1.6;">${data.overview}</p>

      <h4 style="font-family: var(--font-display); font-weight: 700; margin-bottom: 0.75rem;">Package Deliverables:</h4>
      <ul style="margin-bottom: 1.8rem; display: flex; flex-direction: column; gap: 0.6rem;">
        ${data.deliverables.map(item => `<li style="font-size: 0.92rem;"><i class="fa-solid fa-circle-check" style="color: var(--emerald); margin-right: 0.5rem;"></i>${item}</li>`).join('')}
      </ul>

      <div style="text-align: right;">
        <a href="#calculator" class="btn btn-primary close-modal-to-calc">
          <span>Calculate Price for This</span>
          <i class="fa-solid fa-calculator"></i>
        </a>
      </div>
    `;

    projectModal.classList.add('open');
    projectModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    const modalCalcBtn = modalBody.querySelector('.close-modal-to-calc');
    if (modalCalcBtn) {
      modalCalcBtn.addEventListener('click', () => {
        closeModal();
      });
    }
  }

  function closeModal() {
    projectModal.classList.remove('open');
    projectModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  viewProjectBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openProjectModal(btn.dataset.project);
    });
  });

  serviceModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      openServiceModal(btn.dataset.modal);
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (projectModal) {
    projectModal.addEventListener('click', (e) => {
      if (e.target === projectModal) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeDrawer();
    }
  });

  /* ==========================================================================
     8. TESTIMONIALS CAROUSEL
     ========================================================================== */
  const testimonialCards = document.querySelectorAll('.testimonial-card');
  const sliderDots = document.querySelectorAll('.slider-dots .dot');
  const prevTestimonialBtn = document.getElementById('prevTestimonial');
  const nextTestimonialBtn = document.getElementById('nextTestimonial');

  let currentSlide = 0;
  let autoSlideTimer = null;

  function showSlide(index) {
    if (index < 0) index = testimonialCards.length - 1;
    if (index >= testimonialCards.length) index = 0;

    currentSlide = index;

    testimonialCards.forEach((card, i) => {
      card.classList.toggle('active', i === currentSlide);
    });

    sliderDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  }

  if (prevTestimonialBtn) {
    prevTestimonialBtn.addEventListener('click', () => {
      showSlide(currentSlide - 1);
      resetAutoSlide();
    });
  }

  if (nextTestimonialBtn) {
    nextTestimonialBtn.addEventListener('click', () => {
      showSlide(currentSlide + 1);
      resetAutoSlide();
    });
  }

  sliderDots.forEach(dot => {
    dot.addEventListener('click', () => {
      showSlide(parseInt(dot.dataset.index));
      resetAutoSlide();
    });
  });

  function startAutoSlide() {
    autoSlideTimer = setInterval(() => {
      showSlide(currentSlide + 1);
    }, 6000);
  }

  function resetAutoSlide() {
    clearInterval(autoSlideTimer);
    startAutoSlide();
  }

  startAutoSlide();

  /* ==========================================================================
     9. CONTACT FORM VALIDATION & TOAST SYSTEM
     ========================================================================== */
  const contactForm = document.getElementById('contactForm');
  const toastContainer = document.getElementById('toastContainer');

  function showToast(message, type = 'info') {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-triangle-exclamation';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('contactName');
      const emailInput = document.getElementById('contactEmail');
      const messageInput = document.getElementById('contactMessage');
      const submitBtn = document.getElementById('submitContactBtn');

      let isValid = true;

      // Validate Name
      if (!nameInput.value.trim()) {
        nameInput.closest('.form-group').classList.add('has-error');
        isValid = false;
      } else {
        nameInput.closest('.form-group').classList.remove('has-error');
      }

      // Validate Email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput.value.trim())) {
        emailInput.closest('.form-group').classList.add('has-error');
        isValid = false;
      } else {
        emailInput.closest('.form-group').classList.remove('has-error');
      }

      // Validate Message
      if (!messageInput.value.trim()) {
        messageInput.closest('.form-group').classList.add('has-error');
        isValid = false;
      } else {
        messageInput.closest('.form-group').classList.remove('has-error');
      }

      if (isValid) {
        const origBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Sending...`;

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origBtnText;
          contactForm.reset();
          showToast('Thank you! Your project quote inquiry has been submitted.', 'success');
        }, 1200);
      } else {
        showToast('Please correct highlighted fields before submitting.', 'error');
      }
    });
  }

  // Newsletter Form
  const newsletterBtn = document.getElementById('newsletterBtn');
  const newsletterEmail = document.getElementById('newsletterEmail');

  if (newsletterBtn && newsletterEmail) {
    newsletterBtn.addEventListener('click', () => {
      const email = newsletterEmail.value.trim();
      if (email && email.includes('@')) {
        newsletterEmail.value = '';
        showToast('Subscribed to Nexus Engineering Newsletter!', 'success');
      } else {
        showToast('Please enter a valid email address.', 'error');
      }
    });
  }

});
