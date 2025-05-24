// Modern JavaScript for Vitae Landing Page
document.addEventListener('DOMContentLoaded', function() {
    // Check if all required libraries are available
    if (typeof Glide === 'undefined') {
        // Wait a bit for external scripts to load
        setTimeout(function() {
            if (typeof Glide === 'undefined') {
                console.error('❌ Glide still not available after waiting');
            } else {
                initHeroCarousel();
            }
        }, 100);
    } else {
        initHeroCarousel();
    }
    
    // Initialize all other interactions
    initNavigation();
    initButtons();
    initAnimations();
    initScrollEffects();
    initAudioControls();
    
    // Initialize AOS for all sections (not just mobile cards)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 600,
            easing: 'ease-out-cubic',
            once: true,
            offset: 50
        });
    }
});

// Navigation functionality
function initNavigation() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerOffset = 80;
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add scroll effect to navigation
    let lastScrollTop = 0;
    const nav = document.querySelector('.nav');
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            nav.style.transform = 'translateY(-100%)';
        } else {
            nav.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
}

// Button interactions
function initButtons() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Add ripple effect
            createRipple(e, this);
            
            // Handle different button actions
            const buttonText = this.textContent.toLowerCase();
            
            if (buttonText.includes('start your story') || buttonText.includes('get started')) {
                showModal('waitlist');
            } else if (buttonText.includes('watch demo')) {
                showModal('demo');
            } else if (buttonText.includes('schedule a call')) {
                showModal('schedule');
            } else if (buttonText.includes('learn more')) {
                document.querySelector('#features')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Create ripple effect
function createRipple(event, element) {
    const circle = document.createElement('span');
    const diameter = Math.max(element.clientWidth, element.clientHeight);
    const radius = diameter / 2;
    
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - element.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - element.offsetTop - radius}px`;
    circle.classList.add('ripple');
    
    const ripple = element.getElementsByClassName('ripple')[0];
    if (ripple) {
        ripple.remove();
    }
    
    element.appendChild(circle);
    
    setTimeout(() => {
        circle.remove();
    }, 600);
}

// Animation system
function initAnimations() {
    // Animate hero cards
    animateHeroCards();
    
    // Animate wave bars
    animateWaveBars();
    
    // Animate floating elements
    animateFloatingElements();

    // Initialize testimonial carousel
    initTestimonialCarousel();
}

function animateHeroCards() {
    const cards = document.querySelectorAll('.story-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.2}s`;
        card.classList.add('fade-in-up');
    });
}

function animateWaveBars() {
    const waveBars = document.querySelectorAll('.wave-bar');
    waveBars.forEach((bar, index) => {
        bar.style.animationDelay = `${index * 0.1}s`;
    });
}

function animateFloatingElements() {
    const elements = document.querySelectorAll('.floating-element');
    elements.forEach((element, index) => {
        element.style.animationDelay = `${index * 0.5}s`;
    });
}

// Testimonial carousel functionality
function initTestimonialCarousel() {
    const testimonialsGrid = document.querySelector('.testimonials-grid');
    if (!testimonialsGrid) return;

    const cards = testimonialsGrid.querySelectorAll('.testimonial-card');
    if (cards.length <= 1) return;

    // Add carousel controls
    const controls = document.createElement('div');
    controls.className = 'carousel-controls';
    controls.innerHTML = `
        <button class="carousel-prev" aria-label="Previous testimonial">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>
        <div class="carousel-dots"></div>
        <button class="carousel-next" aria-label="Next testimonial">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>
    `;
    testimonialsGrid.parentNode.insertBefore(controls, testimonialsGrid.nextSibling);

    // Add dots
    const dotsContainer = controls.querySelector('.carousel-dots');
    cards.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot';
        dot.setAttribute('aria-label', `Go to testimonial ${index + 1}`);
        dotsContainer.appendChild(dot);
    });

    let currentIndex = 0;
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    const prevButton = controls.querySelector('.carousel-prev');
    const nextButton = controls.querySelector('.carousel-next');

    function updateCarousel() {
        // Move the entire grid to show the current card
        // Each card + gap takes up exactly one viewport width
        const translatePercentage = currentIndex * 33.333;
        testimonialsGrid.style.transform = `translateX(-${translatePercentage}%)`;
        
        // Update card opacity and active states
        cards.forEach((card, index) => {
            const isActive = index === currentIndex;
            card.classList.toggle('active', isActive);
        });
        
        // Update dots
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    function goToSlide(index) {
        currentIndex = (index + cards.length) % cards.length;
        updateCarousel();
    }

    // Add event listeners
    prevButton.addEventListener('click', () => goToSlide(currentIndex - 1));
    nextButton.addEventListener('click', () => goToSlide(currentIndex + 1));
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => goToSlide(index));
    });

    // Auto-advance carousel
    let autoplayInterval = setInterval(() => goToSlide(currentIndex + 1), 5000);

    // Pause autoplay on hover
    testimonialsGrid.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
    testimonialsGrid.addEventListener('mouseleave', () => {
        autoplayInterval = setInterval(() => goToSlide(currentIndex + 1), 5000);
    });

    // Touch/swipe functionality for mobile
    let startX = 0;
    let isDragging = false;

    testimonialsGrid.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
        clearInterval(autoplayInterval);
    });

    testimonialsGrid.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
    });

    testimonialsGrid.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;
        
        const endX = e.changedTouches[0].clientX;
        const diffX = startX - endX;
        
        // Minimum swipe distance to trigger slide change
        if (Math.abs(diffX) > 50) {
            if (diffX > 0) {
                // Swipe left - go to next slide
                goToSlide(currentIndex + 1);
            } else {
                // Swipe right - go to previous slide
                goToSlide(currentIndex - 1);
            }
        }
        
        // Restart autoplay
        autoplayInterval = setInterval(() => goToSlide(currentIndex + 1), 5000);
    });

    // Clean up any scroll animation styles that might interfere
    cards.forEach(card => {
        card.style.opacity = '';
        card.style.transform = '';
        card.style.transition = '';
    });
    
    // Initialize carousel
    updateCarousel();
    
    // Ensure first card is active on load
    if (cards.length > 0) {
        cards[0].classList.add('active');
    }
}

// Scroll-triggered animations with AOS
function initScrollEffects() {
    // Add AOS attributes to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-duration', '600');
        card.setAttribute('data-aos-delay', `${index * 100}`);
    });
    
    // Add AOS attributes to steps
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        step.setAttribute('data-aos', 'fade-up');
        step.setAttribute('data-aos-duration', '600');
        step.setAttribute('data-aos-delay', `${index * 150}`);
    });
    
    // Add AOS attributes to testimonial cards
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    testimonialCards.forEach((card, index) => {
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-duration', '600');
        card.setAttribute('data-aos-delay', `${index * 100}`);
    });
    
    // Add AOS attributes to section headers
    const sectionHeaders = document.querySelectorAll('.section-header');
    sectionHeaders.forEach((header) => {
        header.setAttribute('data-aos', 'fade-up');
        header.setAttribute('data-aos-duration', '600');
        header.setAttribute('data-aos-delay', '0');
    });
}

// Modal system
function showModal(type) {
    const modals = {
        waitlist: {
            title: '🚀 Join the Waitlist',
            content: `
                <p style="margin-bottom: 1.5rem; color: var(--text-secondary); line-height: 1.6;">
                    Be among the first to preserve your legacy with Vitae. Get early access and special launch pricing.
                </p>
                <form id="waitlistForm" style="margin-bottom: 1.5rem;">
                    <input type="email" placeholder="Enter your email" required 
                           style="width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: 0.5rem; margin-bottom: 1rem; font-size: 1rem;">
                    <input type="text" placeholder="Your name" required 
                           style="width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: 0.5rem; margin-bottom: 1rem; font-size: 1rem;">
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Join Waitlist</button>
                </form>
            `,
            actions: [
                { text: 'Maybe Later', primary: false, action: closeModal }
            ]
        },
        demo: {
            title: '🎥 Watch Demo',
            content: `
                <p style="margin-bottom: 1.5rem; color: var(--text-secondary); line-height: 1.6;">
                    See how Vitae helps families preserve their most precious stories through guided storytelling.
                </p>
                <div style="background: var(--surface); padding: 3rem; border-radius: 1rem; margin-bottom: 1.5rem; text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📹</div>
                    <p style="color: var(--text-tertiary);">Demo video coming soon!</p>
                </div>
            `,
            actions: [
                { text: 'Notify Me', primary: true, action: () => showModal('waitlist') },
                { text: 'Close', primary: false, action: closeModal }
            ]
        },
        schedule: {
            title: '📞 Schedule a Call',
            content: `
                <p style="margin-bottom: 1.5rem; color: var(--text-secondary); line-height: 1.6;">
                    Talk to our team about how Vitae can help preserve your family's legacy.
                </p>
                <div style="background: var(--surface); padding: 2rem; border-radius: 1rem; margin-bottom: 1.5rem;">
                    <h4 style="margin-bottom: 1rem; color: var(--text-primary);">What we'll cover:</h4>
                    <ul style="text-align: left; color: var(--text-secondary); line-height: 1.6;">
                        <li>Your storytelling goals</li>
                        <li>Our process and timeline</li>
                        <li>Pricing and packages</li>
                        <li>Next steps</li>
                    </ul>
                </div>
            `,
            actions: [
                { text: 'Book a Call', primary: true, action: () => alert('Booking system coming soon!') },
                { text: 'Not Now', primary: false, action: closeModal }
            ]
        }
    };

    const modal = modals[type];
    if (!modal) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.innerHTML = `
        <h3 class="modal-title">${modal.title}</h3>
        <div class="modal-body">${modal.content}</div>
        <div class="modal-actions">
            ${modal.actions.map(action => 
                `<button class="btn ${action.primary ? 'btn-primary' : 'btn-secondary'}" data-action="${action.text}">
                    ${action.text}
                </button>`
            ).join('')}
        </div>
    `;

    overlay.appendChild(modalContent);
    document.body.appendChild(overlay);

    // Add event listeners
    modal.actions.forEach(action => {
        const button = modalContent.querySelector(`[data-action="${action.text}"]`);
        button.addEventListener('click', action.action);
    });

    // Add form submit listener
    const form = modalContent.querySelector('#waitlistForm');
    if (form) {
        console.log('Adding form submit listener');
        form.addEventListener('submit', (e) => {
            console.log('Form submit event triggered');
            e.preventDefault();
            submitWaitlist();
        });
    }

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // Animate in
    requestAnimationFrame(() => {
        overlay.classList.add('modal-open');
    });

    function closeModal() {
        overlay.classList.remove('modal-open');
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 300);
    }

    window.closeModal = closeModal;
}

function submitWaitlist() {
    console.log('submitWaitlist called');
    const form = document.getElementById('waitlistForm');
    if (!form) {
        console.error('Form not found');
        return;
    }
    console.log('Form found');

    const email = form.querySelector('input[type="email"]').value;
    const name = form.querySelector('input[type="text"]').value;
    console.log('Form values:', { email, name });
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    // Get the Cloud Function URL from the environment
    const functionUrl = window.location.hostname === 'localhost' ? 'http://localhost:5001/vitae-local/us-central1/handleWaitlistSubmission' : 'https://us-central1-vitae-460717.cloudfunctions.net/handleWaitlistSubmission';  // Production
    
    console.log('Sending request to:', functionUrl);

    // Submit the form
    fetch(functionUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name })
    })
    .then(response => {
        console.log('Response received:', response);
        return response.json();
    })
    .then(data => {
        console.log('Data received:', data);
        if (data.error) {
            throw new Error(data.error);
        }
        // Show success message
        const modalBody = document.querySelector('.modal-body');
        modalBody.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
                <h4 style="margin-bottom: 1rem; color: var(--text-primary);">Welcome to the waitlist!</h4>
                <p style="color: var(--text-secondary); line-height: 1.6;">
                    We'll be in touch soon with updates about your early access.
                </p>
            </div>
        `;
        // Remove the form and buttons
        form.remove();
        document.querySelector('.modal-actions').remove();
    })
    .catch(error => {
        console.error('Error:', error);
        // Show error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = error.message || 'Something went wrong. Please try again.';
        errorMessage.style.color = 'var(--error)';
        errorMessage.style.marginTop = '1rem';
        form.appendChild(errorMessage);
        
        // Reset button state
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    });
}

// Add modern CSS
const styles = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    }

    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }

    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .modal-overlay.modal-open {
        opacity: 1;
    }

    .modal-content {
        background: white;
        padding: 2rem;
        border-radius: 1rem;
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        transform: scale(0.9) translateY(20px);
        transition: transform 0.3s ease;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .modal-open .modal-content {
        transform: scale(1) translateY(0);
    }

    .modal-title {
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 1rem;
        color: var(--text-primary);
    }

    .modal-body {
        margin-bottom: 1.5rem;
    }

    .modal-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        flex-wrap: wrap;
    }

    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }

    .fade-in-up {
        animation: fadeInUp 0.6s ease forwards;
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .nav {
        transition: transform 0.3s ease;
    }

    @media (max-width: 768px) {
        .modal-content {
            padding: 1.5rem;
            margin: 1rem;
        }
        
        .modal-actions {
            flex-direction: column;
        }
        
        .modal-actions .btn {
            width: 100%;
        }
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet); 

// Hero Cards GlideJS Carousel
function initHeroCarousel() {
    // Check if Glide is available
    if (typeof Glide === 'undefined') {
        console.error('❌ Glide is not loaded! Make sure GlideJS script is included before this script.');
        return;
    }

    const heroCarouselContainer = document.querySelector('.hero-cards-container.glide');
    
    if (!heroCarouselContainer) {
        console.error('❌ Hero carousel container not found');
        return;
    }

    // Debug: Check what we have
    const slides = heroCarouselContainer.querySelectorAll('.glide__slide');
    const cards = heroCarouselContainer.querySelectorAll('.story-card');
    console.log('🔍 Debug - Found slides:', slides.length, 'cards:', cards.length);
    console.log('🔍 Container dimensions:', heroCarouselContainer.offsetWidth, 'x', heroCarouselContainer.offsetHeight);

    let glide = null;
    let isMobile = window.innerWidth <= 768;
    console.log('📱 Is mobile?', isMobile, 'Screen width:', window.innerWidth);

    // Configure GlideJS options for mobile only
    function getGlideConfig() {
        return {
            type: 'carousel',
            startAt: 0,
            perView: 1,
            focusAt: 'center',
            gap: 0,
            autoplay: 3000,
            hoverpause: true,
            keyboard: true,
            swipeThreshold: 80,
            dragThreshold: 120,
            animationDuration: 600,
            animationTimingFunc: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            direction: 'ltr'
        };
    }

    function initializeGlide() {
        if (glide) {
            glide.destroy();
            glide = null;
        }

        console.log('🔧 Screen width:', window.innerWidth, 'isMobile:', isMobile);

        // Skip carousel on mobile, just show cards in simple layout
        if (isMobile) {
            console.log('📱 Setting up simple mobile layout (no carousel)...');
            setupMobileCards();
        } else {
            console.log('🖥️ Setting up desktop layout...');
            // Desktop: Set first card as active for floating animation
            setupDesktopCards();
        }
    }

    function setupMobileCards() {
        // For mobile, just add AOS animations without any styling changes
        const slides = heroCarouselContainer.querySelectorAll('.glide__slide');
        console.log('📱 Mobile setup - Found slides:', slides.length);
        
        slides.forEach((slide, index) => {
            const card = slide.querySelector('.story-card');
            if (card) {
                // Only add AOS parallax attributes - no styling changes
                if (index === 0) {
                    card.setAttribute('data-aos', 'fade-right');
                    card.setAttribute('data-aos-duration', '800');
                    card.setAttribute('data-aos-delay', '0');
                } else if (index === 1) {
                    card.setAttribute('data-aos', 'fade-left');
                    card.setAttribute('data-aos-duration', '800');
                    card.setAttribute('data-aos-delay', '200');
                } else if (index === 2) {
                    card.setAttribute('data-aos', 'fade-right');
                    card.setAttribute('data-aos-duration', '800');
                    card.setAttribute('data-aos-delay', '400');
                }
                
                console.log(`📱 Added AOS to mobile card ${index} with original styling`);
            }
        });
        
        // Initialize AOS after setting up cards
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-out-cubic',
                once: true,
                offset: 50,
                disable: function() {
                    // Disable AOS on desktop
                    return window.innerWidth > 768;
                }
            });
            console.log('📱 AOS initialized for mobile parallax');
        }
    }

    function setupDesktopCards() {
        // For desktop, we want to show all cards and activate the first one
        const slides = heroCarouselContainer.querySelectorAll('.glide__slide');
        const originalSlides = heroCarouselContainer.querySelectorAll('.glide__slide:not(.glide__slide--clone)');
        
        console.log('🖥️ Desktop setup - Total slides:', slides.length, 'Original slides:', originalSlides.length);
        
        // If no original slides found, use all slides (before GlideJS processes them)
        const slidesToUse = originalSlides.length > 0 ? originalSlides : slides;
        
        slidesToUse.forEach((slide, index) => {
            const card = slide.querySelector('.story-card');
            if (card) {
                card.classList.toggle('active', index === 0);
                if (index === 0) {
                    card.style.animation = 'float 4s ease-in-out infinite';
                    console.log('✨ Desktop: Activated first card');
                } else {
                    card.style.animation = 'none';
                }
                // Ensure all cards are visible on desktop
                card.style.opacity = '1';
                card.style.transform = 'none';
            }
        });
    }

    function updateActiveStates() {
        const allSlides = heroCarouselContainer.querySelectorAll('.glide__slide');
        const originalSlides = heroCarouselContainer.querySelectorAll('.glide__slide:not(.glide__slide--clone)');
        const bullets = heroCarouselContainer.querySelectorAll('.glide__bullet');
        
        // Find the currently active slide (including clones)
        const activeSlide = heroCarouselContainer.querySelector('.glide__slide--active');
        let activeIndex = -1;
        
        if (activeSlide) {
            // Check if it's a clone or original slide
            if (activeSlide.classList.contains('glide__slide--clone')) {
                // It's a clone - we need to find which original it represents
                const slideContent = activeSlide.innerHTML;
                originalSlides.forEach((slide, index) => {
                    if (slide.innerHTML === slideContent) {
                        activeIndex = index;
                    }
                });
            } else {
                // It's an original slide - find its index among original slides
                originalSlides.forEach((slide, index) => {
                    if (slide === activeSlide) {
                        activeIndex = index;
                    }
                });
            }
        }
        
        // If no active slide found, default to first slide
        if (activeIndex === -1) {
            activeIndex = 0;
        }
        
        console.log('🎯 Setting active index:', activeIndex, 'out of', originalSlides.length, 'slides');
        
        // Update card active states for original slides only
        originalSlides.forEach((slide, index) => {
            const card = slide.querySelector('.story-card');
            const isActive = index === activeIndex;
            
            if (card) {
                card.classList.toggle('active', isActive);
                
                if (isActive) {
                    // Add floating animation to active card
                    card.style.animation = 'float 4s ease-in-out infinite';
                    console.log('✨ Activated card', index);
                } else {
                    // Remove animation from inactive cards
                    card.style.animation = 'none';
                }
            }
        });

        // Update bullet active states (custom styling)
        bullets.forEach((bullet, index) => {
            const isActive = bullet.classList.contains('glide__bullet--active');
            if (isActive) {
                bullet.style.transform = 'scale(1.2)';
            } else {
                bullet.style.transform = 'scale(1)';
            }
        });
    }

    // Handle responsive behavior
    function handleResize() {
        const newIsMobile = window.innerWidth <= 768;
        
        if (newIsMobile !== isMobile) {
            isMobile = newIsMobile;
            initializeGlide();
        }
    }

    // Initial setup
    initializeGlide();

    // Handle window resize with debouncing
    window.addEventListener('resize', debounce(handleResize, 250));

    // Store glide instance for potential cleanup
    window.heroGlide = glide;
}

// Debounce utility function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Audio Controls functionality
function initAudioControls() {
    const storyCards = document.querySelectorAll('.story-card');
    
    storyCards.forEach((card, cardIndex) => {
        const playBtn = card.querySelector('.play-btn');
        const pauseBtn = card.querySelector('.pause-btn');
        const waveform = card.querySelector('.waveform');
        const waveBars = card.querySelectorAll('.wave-bar');
        
        let isPlaying = false;
        let animationInterval;
        
        // Play button functionality
        playBtn?.addEventListener('click', () => {
            // Stop all other cards
            stopAllOtherCards(cardIndex);
            
            isPlaying = true;
            playBtn.style.display = 'none';
            pauseBtn.style.display = 'flex';
            playBtn.classList.add('playing');
            
            // Animate wave bars more intensely
            startWaveAnimation();
            
            // Simulate audio progress (in real app, this would be tied to actual audio)
            console.log(`Playing story: ${card.querySelector('.card-name').textContent}`);
        });
        
        // Pause button functionality
        pauseBtn?.addEventListener('click', () => {
            isPlaying = false;
            playBtn.style.display = 'flex';
            pauseBtn.style.display = 'none';
            playBtn.classList.remove('playing');
            
            stopWaveAnimation();
            
            console.log(`Paused story: ${card.querySelector('.card-name').textContent}`);
        });
        
        // Next button has been removed from the design
        
        function startWaveAnimation() {
            // Enhanced wave animation for playing state
            waveBars.forEach((bar, index) => {
                bar.style.animationDuration = `${0.8 + Math.random() * 0.4}s`;
                bar.style.animationDelay = `${index * 0.05}s`;
                bar.style.opacity = '1';
            });
            
            // Add pulsing effect to waveform container
            waveform.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))';
            waveform.style.boxShadow = '0 0 20px rgba(99, 102, 241, 0.2)';
        }
        
        function stopWaveAnimation() {
            // Reset wave bars to default state
            waveBars.forEach((bar, index) => {
                bar.style.animationDuration = '1.5s';
                bar.style.animationDelay = `${index * 0.1}s`;
                bar.style.opacity = '0.7';
            });
            
            // Reset waveform container
            waveform.style.background = 'var(--surface)';
            waveform.style.boxShadow = 'none';
        }
        
        function stopCard() {
            isPlaying = false;
            playBtn.style.display = 'flex';
            pauseBtn.style.display = 'none';
            playBtn.classList.remove('playing');
            stopWaveAnimation();
        }
        
        function stopAllOtherCards(currentCardIndex) {
            storyCards.forEach((otherCard, otherIndex) => {
                if (otherIndex !== currentCardIndex) {
                    const otherPlayBtn = otherCard.querySelector('.play-btn');
                    const otherPauseBtn = otherCard.querySelector('.pause-btn');
                    const otherWaveform = otherCard.querySelector('.waveform');
                    const otherWaveBars = otherCard.querySelectorAll('.wave-bar');
                    
                    // Stop other card
                    otherPlayBtn.style.display = 'flex';
                    otherPauseBtn.style.display = 'none';
                    otherPlayBtn.classList.remove('playing');
                    
                    // Reset other card's wave animation
                    otherWaveBars.forEach((bar, index) => {
                        bar.style.animationDuration = '1.5s';
                        bar.style.animationDelay = `${index * 0.1}s`;
                        bar.style.opacity = '0.7';
                    });
                    
                    otherWaveform.style.background = 'var(--surface)';
                    otherWaveform.style.boxShadow = 'none';
                }
            });
        }
    });
}
















