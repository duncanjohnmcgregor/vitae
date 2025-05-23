// Modern JavaScript for Vitae Landing Page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all interactions
    initNavigation();
    initButtons();
    initAnimations();
    initScrollEffects();
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
        cards.forEach((card, index) => {
            card.style.transform = `translateX(${(index - currentIndex) * 100}%)`;
            card.style.opacity = index === currentIndex ? '1' : '0.5';
        });
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

    // Initialize carousel
    updateCarousel();
}

// Scroll-triggered animations
function initScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Elements to animate on scroll
    const animatedElements = document.querySelectorAll(
        '.feature-card, .step, .testimonial-card, .section-header'
    );
    
    animatedElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(element);
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







