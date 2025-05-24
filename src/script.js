// Modern JavaScript for Vitae Landing Page
document.addEventListener('DOMContentLoaded', function() {    // Initialize all interactions (disabled hero carousel and audio for text testimonials)    initNavigation();    initButtons();    initAnimations();    initScrollEffects();        // Load hero testimonials immediately    loadInitialTestimonials();        // Initialize AOS for all sections (not just mobile cards)    if (typeof AOS !== 'undefined') {        AOS.init({            duration: 600,            easing: 'ease-out-cubic',            once: true,            offset: 50        });    }});// Load initial testimonials immediatelyfunction loadInitialTestimonials() {    console.log('🔄 Loading initial testimonials...');        // Wait a bit to ensure DOM is fully ready    setTimeout(() => {        const testimonials = [            {                name: "Margaret Thompson",                age: 82,                text: "My grandkids always ask about my life. They want to know what it was like growing up on the farm. I've always wanted to write my stories down for them. With some help, I did it. Now it's not just about the past. It's about giving them something to remember me by. Writing my memories felt good. It was like making a connection to the future. I hope they'll read it and feel like they know me better."            },            {                name: "Harold Williams",                 age: 79,                text: "After my wife died, I had too many thoughts in my head. I've wanted to write my story for a long time. It started as something to do, but with help, it became more. I remembered the good times, like our trips, and the hard times, like my mistakes. It helped me understand myself better. Now my kids can see where they come from. It feels good to have done it."            },            {                name: "Eleanor Martinez",                age: 76,                text: "I have a big family, but we're spread out now. I've always wanted to write my life story to bring us closer together. With some help, I got it done. Sharing stories about growing up in Brooklyn or meeting their granddad got everyone talking. We laughed at the funny parts and cried over the tough ones. It's like I gave them a piece of me. Now they have stories to pass on too. That means a lot to me."            },            {                name: "Robert Chen",                age: 84,                text: "Lately, my memory's been slipping. Little things like the taste of my mom's apple pie or the sound of my old radio shows are fading. I was scared they'd be gone forever if I didn't write them down. With some help, I started putting them on paper. It felt like catching something special. It's not just for me. I want my nieces to know what life was like back then. I'm glad those moments are safe now."            },            {                name: "Dorothy Jackson",                age: 81,                text: "I grew up during big times, like the Civil Rights marches and the moon landing. I saw it all from my little town. I've always wanted to write my story to tell it how I saw it. With some help, I finally did. It's not just the history stuff. It's the everyday things too, like raising three kids on almost nothing. I wrote it for my family and for me, to say I was here. It feels really good."            },            {                name: "Frank Morrison",                age: 77,                text: "I don't have much to leave behind, no fancy jewelry or big house. But I've got plenty of stories. I've always thought writing them down would be like making something special. With a little push, I did it. It's like a gift for my kids and grandkids, full of memories from my nursing days and quiet nights with my cats. I hope they'll keep it close one day. It shows who I was."            },            {                name: "Ruth Patterson",                age: 73,                text: "I've always imagined that writing my story would be like taking a long walk through my past. With some guidance, I took that walk. I laughed remembering how I wrecked my first car, and I got teary thinking about friends who've passed. It wasn't just about saving those moments. It was about feeling them again. I want my family to read it and see the real me, not just the old lady they know now. It's been a joy to do this."            },            {                name: "Samuel Davis",                age: 85,                text: "My life has had its share of highs and lows, from lost jobs to cross-country moves. I've long wanted to write about it to understand how those struggles shaped me. With some support, I accomplished that goal. I even wondered if it might help others too. My sons rarely seek my advice, but now they have my experiences in writing. It proves you can falter and still thrive. It's my way of guiding them beyond my years."            },            {                name: "Grace Wilson",                age: 80,                text: "I often pondered whether my life warranted a written record, just an average woman laboring at the factory and raising a family. Yet at 80, with encouragement, I chose to proceed. The process was revelatory, unearthing memories and illuminating my journey's scope. My daughter assisted with transcribing, and we shared laughter and tears along the way. It's imperfect but authentically mine. I take pride in its creation, and that suffices as justification."            },            {                name: "Arthur Hughes",                age: 87,                text: "At 87, I've lived a rich existence, replete with moments of beauty and others tempered by hardship. I've long believed that documenting my autobiography would serve as an expression of gratitude for it all. With thoughtful assistance, I brought this vision to life. It honors the loved ones I've held dear, the places I've inhabited, and the trials that fortified my spirit. While crafted for my family's legacy, it also fulfills a personal need to celebrate my life's entirety. That fulfillment is beyond measure."            }        ];        // Get 3 random testimonials        const shuffled = testimonials.sort(() => 0.5 - Math.random());        const selectedTestimonials = shuffled.slice(0, 3);                // Find testimonial cards        const testimonialCards = document.querySelectorAll('.hero-testimonials-container .testimonial-card');        console.log(`🔍 Found ${testimonialCards.length} testimonial cards`);                if (testimonialCards.length === 0) {            console.error('❌ No testimonial cards found!');            return;        }                // Update each card        testimonialCards.forEach((card, index) => {            if (selectedTestimonials[index]) {                const testimonial = selectedTestimonials[index];                const nameElement = card.querySelector('.testimonial-name');                const ageElement = card.querySelector('.testimonial-age');                const textElement = card.querySelector('.testimonial-text');                                console.log(`📝 Updating card ${index + 1}:`, {                    name: testimonial.name,                    nameElement: !!nameElement,                    ageElement: !!ageElement,                    textElement: !!textElement                });                                if (nameElement) nameElement.textContent = testimonial.name;                if (ageElement) ageElement.textContent = `Age ${testimonial.age}`;                                // Try multiple ways to update the text                if (textElement) {                    textElement.textContent = `"${testimonial.text}"`;                    textElement.innerHTML = `"${testimonial.text}"`;                    console.log(`✅ Updated text for ${testimonial.name}`);                } else {                    console.error(`❌ Could not find text element for card ${index + 1}`);                    // Try finding it with different selectors                    const altTextElement = card.querySelector('p') || card.querySelector('.story-text');                    if (altTextElement) {                        altTextElement.textContent = `"${testimonial.text}"`;                        console.log(`✅ Updated text via alternative selector for ${testimonial.name}`);                    }                }            }        });                console.log('✅ Initial testimonials loaded successfully!');                // Set up the cycling after initial load        setInterval(() => {            const newShuffled = testimonials.sort(() => 0.5 - Math.random());            const newSelected = newShuffled.slice(0, 3);                        testimonialCards.forEach((card, index) => {                if (newSelected[index]) {                    card.classList.add('fade-out');                                        setTimeout(() => {                        const testimonial = newSelected[index];                        const nameElement = card.querySelector('.testimonial-name');                        const ageElement = card.querySelector('.testimonial-age');                        const textElement = card.querySelector('.testimonial-text');                                                if (nameElement) nameElement.textContent = testimonial.name;                        if (ageElement) ageElement.textContent = `Age ${testimonial.age}`;                                                // Try multiple ways to update the text                        if (textElement) {                            textElement.textContent = `"${testimonial.text}"`;                            textElement.innerHTML = `"${testimonial.text}"`;                        } else {                            const altTextElement = card.querySelector('p') || card.querySelector('.story-text');                            if (altTextElement) {                                altTextElement.textContent = `"${testimonial.text}"`;                            }                        }                                                card.classList.remove('fade-out');                        card.classList.add('fade-in');                                                setTimeout(() => {                            card.classList.remove('fade-in');                        }, 500);                    }, 250);                }            });        }, 60000); // 1 minute intervals            }, 100); // Small delay to ensure DOM is ready}

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

// Animation systemfunction initAnimations() {    // Animate hero cards    animateHeroCards();        // Animate wave bars    animateWaveBars();        // Animate floating elements    animateFloatingElements();    // Initialize testimonial carousel    initTestimonialCarousel();        // Initialize hero testimonials cycling    initHeroTestimonials();}

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

// Hero testimonials cycling functionality (10 second intervals, single testimonial)
function initTestimonialCarousel() {
    const heroTestimonialCard = document.querySelector('.hero-testimonials-container .testimonial-card');
    
    if (!heroTestimonialCard) return;

    // Complete pool of testimonials for cycling
    const testimonialPool = [
        {
            name: "Margaret Thompson",
            age: 82,
            text: "My grandkids always ask about my life. They want to know what it was like growing up on the farm. I've always wanted to write my stories down for them. With some help, I did it. Now it's not just about the past. It's about giving them something to remember me by.",
            avatar: ""
        },
        {
            name: "Harold Williams",
            age: 79,
            text: "After my wife died, I had too many thoughts in my head. I've wanted to write my story for a long time. It started as something to do, but with help, it became more. I remembered the good times, like our trips, and the hard times, like my mistakes.",
            avatar: "avatar-2"
        },
        {
            name: "Eleanor Martinez",
            age: 76,
            text: "I have a big family, but we're spread out now. I've always wanted to write my life story to bring us closer together. With some help, I got it done. Sharing stories about growing up in Brooklyn got everyone talking.",
            avatar: "avatar-3"
        },
        {
            name: "Dorothy Williams",
            age: 85,
            text: "I was worried about technology, but the process was so simple. Now I have a beautiful book to pass down to my family that captures all my memories from the war years.",
            avatar: "avatar-4"
        },
        {
            name: "Michael Thompson",
            age: 68,
            text: "The final book exceeded all my expectations. Every page captures the essence of my father's incredible journey through the Great Depression.",
            avatar: "avatar-5"
        },
        {
            name: "Helen Chang",
            age: 74,
            text: "Vitae captured stories I thought were lost forever. The writing quality is exceptional and truly honors my experiences as an immigrant.",
            avatar: "avatar-6"
        },
        {
            name: "Frank Morrison",
            age: 91,
            text: "The team made me feel so comfortable sharing my memories. They truly understood the importance of preserving family history for future generations.",
            avatar: "avatar-7"
        },
        {
            name: "Patricia Davis",
            age: 77,
            text: "My family is scattered across the country, but this book has brought us all closer together through shared stories and memories.",
            avatar: "avatar-8"
        },
        {
            name: "James Peterson",
            age: 83,
            text: "I never thought my stories mattered, but Vitae showed me they do. Now my grandkids ask to read 'Grandpa's book' every visit.",
            avatar: "avatar-9"
        },
        {
            name: "Elizabeth Foster",
            age: 72,
            text: "The quality of the final book is museum-worthy. It's a treasure that will be passed down for generations to come.",
            avatar: "avatar-10"
        }
    ];

    let currentIndex = 0;
    
    // Initialize the first testimonial (just show it, no animation)
    heroTestimonialCard.classList.add('active');
    setInitialTestimonial(heroTestimonialCard, testimonialPool[currentIndex]);
    
    function setInitialTestimonial(card, testimonial) {
        // Set initial testimonial without animations
        const nameElement = card.querySelector('.testimonial-name');
        const ageElement = card.querySelector('.testimonial-age');
        const textElement = card.querySelector('.testimonial-text');
        const avatar = card.querySelector('.avatar');
        
        if (nameElement) nameElement.textContent = testimonial.name;
        if (ageElement) ageElement.textContent = `Age ${testimonial.age}`;
        if (textElement) textElement.textContent = `"${testimonial.text}"`;
        
        // Update avatar class
        if (avatar) {
            avatar.className = avatar.className.replace(/avatar-\d+/g, '');
            if (testimonial.avatar) {
                avatar.classList.add(testimonial.avatar);
            }
        }
    }
    
    function getNextTestimonial() {
        currentIndex = (currentIndex + 1) % testimonialPool.length;
        return testimonialPool[currentIndex];
    }
    
    function updateTestimonialCard(card, testimonial) {
        // Add fade out class
        card.classList.add('fade-out');
        card.classList.remove('active');
        
        // After fade out, update content and fade back in
        setTimeout(() => {
            // Update content
            const nameElement = card.querySelector('.testimonial-name');
            const ageElement = card.querySelector('.testimonial-age');
            const textElement = card.querySelector('.testimonial-text');
            const avatar = card.querySelector('.avatar');
            
            if (nameElement) nameElement.textContent = testimonial.name;
            if (ageElement) ageElement.textContent = `Age ${testimonial.age}`;
            if (textElement) textElement.textContent = `"${testimonial.text}"`;
            
            // Update avatar class
            if (avatar) {
                // Remove all existing avatar classes
                avatar.className = avatar.className.replace(/avatar-\d+/g, '');
                if (testimonial.avatar) {
                    avatar.classList.add(testimonial.avatar);
                }
            }
            
            // Remove fade out and add fade in
            card.classList.remove('fade-out');
            card.classList.add('fade-in', 'active');
            
            // Clean up fade in class after animation
            setTimeout(() => {
                card.classList.remove('fade-in');
            }, 600);
            
        }, 400); // Wait for fade-out animation
    }
    
    function cycleTestimonial() {
        const nextTestimonial = getNextTestimonial();
        updateTestimonialCard(heroTestimonialCard, nextTestimonial);
    }
    
    // Start cycling every 10 seconds
    setInterval(cycleTestimonial, 10000);
    
    console.log('✅ Hero testimonials cycling initialized - single testimonial every 10 seconds');
}

// Hero testimonials cycling system
function initHeroTestimonials() {
    // This function handles the hero section testimonials, separate from main testimonials
    console.log('✅ Hero testimonials system initialized');
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
}}  
 