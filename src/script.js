// Modern JavaScript for Vitae Landing Page
document.addEventListener('DOMContentLoaded', function() {    // Initialize all interactions (disabled hero carousel and audio for text testimonials)    initNavigation();    initButtons();    initAnimations();    initScrollEffects();        // Load hero testimonials immediately    loadInitialTestimonials();        // Initialize AOS for all sections (not just mobile cards)    if (typeof AOS !== 'undefined') {        AOS.init({            duration: 600,            easing: 'ease-out-cubic',            once: true,            offset: 50        });    }});// Load initial testimonials immediatelyfunction loadInitialTestimonials() {    console.log('🔄 Loading initial testimonials...');        // Wait a bit to ensure DOM is fully ready    setTimeout(() => {        const testimonials = [            {                name: "Margaret Thompson",                age: 82,                text: "My grandkids always ask about my life. They want to know what it was like growing up on the farm. I've always wanted to write my stories down for them. With some help, I did it. Now it's not just about the past. It's about giving them something to remember me by. Writing my memories felt good. It was like making a connection to the future. I hope they'll read it and feel like they know me better."            },            {                name: "Harold Williams",                 age: 79,                text: "After my wife died, I had too many thoughts in my head. I've wanted to write my story for a long time. It started as something to do, but with help, it became more. I remembered the good times, like our trips, and the hard times, like my mistakes. It helped me understand myself better. Now my kids can see where they come from. It feels good to have done it."            },            {                name: "Eleanor Martinez",                age: 76,                text: "I have a big family, but we're spread out now. I've always wanted to write my life story to bring us closer together. With some help, I got it done. Sharing stories about growing up in Brooklyn or meeting their granddad got everyone talking. We laughed at the funny parts and cried over the tough ones. It's like I gave them a piece of me. Now they have stories to pass on too. That means a lot to me."            },            {                name: "Robert Chen",                age: 84,                text: "Lately, my memory's been slipping. Little things like the taste of my mom's apple pie or the sound of my old radio shows are fading. I was scared they'd be gone forever if I didn't write them down. With some help, I started putting them on paper. It felt like catching something special. It's not just for me. I want my nieces to know what life was like back then. I'm glad those moments are safe now."            },            {                name: "Dorothy Jackson",                age: 81,                text: "I grew up during big times, like the Civil Rights marches and the moon landing. I saw it all from my little town. I've always wanted to write my story to tell it how I saw it. With some help, I finally did. It's not just the history stuff. It's the everyday things too, like raising three kids on almost nothing. I wrote it for my family and for me, to say I was here. It feels really good."            },            {                name: "Frank Morrison",                age: 77,                text: "I don't have much to leave behind, no fancy jewelry or big house. But I've got plenty of stories. I've always thought writing them down would be like making something special. With a little push, I did it. It's like a gift for my kids and grandkids, full of memories from my nursing days and quiet nights with my cats. I hope they'll keep it close one day. It shows who I was."            },            {                name: "Ruth Patterson",                age: 73,                text: "I've always imagined that writing my story would be like taking a long walk through my past. With some guidance, I took that walk. I laughed remembering how I wrecked my first car, and I got teary thinking about friends who've passed. It wasn't just about saving those moments. It was about feeling them again. I want my family to read it and see the real me, not just the old lady they know now. It's been a joy to do this."            },            {                name: "Samuel Davis",                age: 85,                text: "My life has had its share of highs and lows, from lost jobs to cross-country moves. I've long wanted to write about it to understand how those struggles shaped me. With some support, I accomplished that goal. I even wondered if it might help others too. My sons rarely seek my advice, but now they have my experiences in writing. It proves you can falter and still thrive. It's my way of guiding them beyond my years."            },            {                name: "Grace Wilson",                age: 80,                text: "I often pondered whether my life warranted a written record, just an average woman laboring at the factory and raising a family. Yet at 80, with encouragement, I chose to proceed. The process was revelatory, unearthing memories and illuminating my journey's scope. My daughter assisted with transcribing, and we shared laughter and tears along the way. It's imperfect but authentically mine. I take pride in its creation, and that suffices as justification."            },            {                name: "Arthur Hughes",                age: 87,                text: "At 87, I've lived a rich existence, replete with moments of beauty and others tempered by hardship. I've long believed that documenting my autobiography would serve as an expression of gratitude for it all. With thoughtful assistance, I brought this vision to life. It honors the loved ones I've held dear, the places I've inhabited, and the trials that fortified my spirit. While crafted for my family's legacy, it also fulfills a personal need to celebrate my life's entirety. That fulfillment is beyond measure."            }        ];        // Get 3 random testimonials        const shuffled = testimonials.sort(() => 0.5 - Math.random());        const selectedTestimonials = shuffled.slice(0, 3);                // Find testimonial cards        const testimonialCards = document.querySelectorAll('.hero-testimonials-container .testimonial-card');        console.log(`🔍 Found ${testimonialCards.length} testimonial cards`);                if (testimonialCards.length === 0) {            console.error('❌ No testimonial cards found!');            return;        }                // Update each card        testimonialCards.forEach((card, index) => {            if (selectedTestimonials[index]) {                const testimonial = selectedTestimonials[index];                const nameElement = card.querySelector('.testimonial-name');                const ageElement = card.querySelector('.testimonial-age');                const textElement = card.querySelector('.testimonial-text');                                console.log(`📝 Updating card ${index + 1}:`, {                    name: testimonial.name,                    nameElement: !!nameElement,                    ageElement: !!ageElement,                    textElement: !!textElement                });                                if (nameElement) nameElement.textContent = testimonial.name;                if (ageElement) ageElement.textContent = `Age ${testimonial.age}`;                                // Try multiple ways to update the text                if (textElement) {                    textElement.textContent = `"${testimonial.text}"`;                    textElement.innerHTML = `"${testimonial.text}"`;                    console.log(`✅ Updated text for ${testimonial.name}`);                } else {                    console.error(`❌ Could not find text element for card ${index + 1}`);                    // Try finding it with different selectors                    const altTextElement = card.querySelector('p') || card.querySelector('.story-text');                    if (altTextElement) {                        altTextElement.textContent = `"${testimonial.text}"`;                        console.log(`✅ Updated text via alternative selector for ${testimonial.name}`);                    }                }            }        });                console.log('✅ Initial testimonials loaded successfully!');                // Set up the cycling after initial load        setInterval(() => {            const newShuffled = testimonials.sort(() => 0.5 - Math.random());            const newSelected = newShuffled.slice(0, 3);                        testimonialCards.forEach((card, index) => {                if (newSelected[index]) {                    card.classList.add('fade-out');                                        setTimeout(() => {                        const testimonial = newSelected[index];                        const nameElement = card.querySelector('.testimonial-name');                        const ageElement = card.querySelector('.testimonial-age');                        const textElement = card.querySelector('.testimonial-text');                                                if (nameElement) nameElement.textContent = testimonial.name;                        if (ageElement) ageElement.textContent = `Age ${testimonial.age}`;                                                // Try multiple ways to update the text                        if (textElement) {                            textElement.textContent = `"${testimonial.text}"`;                            textElement.innerHTML = `"${testimonial.text}"`;                        } else {                            const altTextElement = card.querySelector('p') || card.querySelector('.story-text');                            if (altTextElement) {                                altTextElement.textContent = `"${testimonial.text}"`;                            }                        }                                                card.classList.remove('fade-out');                        card.classList.add('fade-in');                                                setTimeout(() => {                            card.classList.remove('fade-in');                        }, 500);                    }, 250);                }            });        }, 60000); // 1 minute intervals            }, 100); // Small delay to ensure DOM is ready}

// Navigation functionality
function initNavigation() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    // Add scroll effect to navigation
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
}

// Button functionality
function initButtons() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        // Skip buttons that are actually navigation links
        if (button.tagName === 'A' && button.hasAttribute('href')) {
            // This is a navigation link, don't add modal behavior
            return;
        }
        
        button.addEventListener('click', function(e) {
            // Add ripple effect
            createRipple(e, this);
            
            // Handle different button actions
            const buttonText = this.textContent.toLowerCase();
            
            // Skip modal for ALL "Start your story" buttons - they should navigate naturally
            if (buttonText.includes('start your story')) {
                // Let the natural navigation happen or do nothing
                return;
            } else if (buttonText.includes('get started')) {
                e.preventDefault();
                showModal('waitlist');
            } else if (buttonText.includes('watch demo')) {
                e.preventDefault();
                showModal('demo');
            } else if (buttonText.includes('schedule a call')) {
                e.preventDefault();
                showModal('schedule');
            } else if (buttonText.includes('learn more')) {
                e.preventDefault();
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
    // Prevent modal from showing if one is already open
    if (document.querySelector('.modal-overlay')) {
        console.log('Modal already open, skipping');
        return;
    }
    
    // Prevent modal from showing if we're in the middle of navigation
    if (document.hidden || !document.hasFocus()) {
        console.log('Page not focused, skipping modal');
        return;
    }
    
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
        form.addEventListener('submit', (e) => {
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
    const form = document.getElementById('waitlistForm');
    if (!form) {
        console.error('Form not found');
        return;
    }

    const email = form.querySelector('input[type="email"]').value;
    const name = form.querySelector('input[type="text"]').value;
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    // Get the Cloud Function URL from the environment
    const functionUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://127.0.0.1:5001/vitae-local/us-central1/handleWaitlistSubmission' : 'https://us-central1-vitae-460717.cloudfunctions.net/handleWaitlistSubmission';

    // Submit the form
    fetch(functionUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name })
    })
    .then(response => response.json())
    .then(data => {
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

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Vitae application...');
    
    // Initialize core functionality
    initNavigation();
    initButtons();
    initAnimations();
    initScrollEffects();
    
    // Initialize AOS (Animate On Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 600,
            easing: 'ease-out-cubic',
            once: true,
            offset: 50
        });
        console.log('✅ AOS initialized');
    } else {
        console.warn('⚠️ AOS library not found');
    }
    
    console.log('✅ Vitae application initialized successfully');
});












