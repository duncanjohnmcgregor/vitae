// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for anchor links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add click handlers for buttons (placeholder functionality)
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Add ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            // Remove ripple after animation
            setTimeout(() => {
                ripple.remove();
            }, 600);
            
            // Placeholder functionality
            if (this.textContent.includes('Start Your Story') || this.textContent.includes('Get Started Today')) {
                showComingSoonModal();
            } else if (this.textContent.includes('Learn More')) {
                document.querySelector('#about').scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add scroll-triggered animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe feature cards for animation
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Add floating animation to SVG elements
    const memories = document.querySelector('.memories');
    if (memories) {
        memories.style.animationDelay = '1s';
    }

    const soundWaves = document.querySelector('.sound-waves');
    if (soundWaves) {
        soundWaves.style.animationDelay = '0.5s';
    }
});

// Coming Soon Modal functionality
function showComingSoonModal() {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(155, 126, 173, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    // Create modal content
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        padding: 3rem;
        border-radius: 1.5rem;
        text-align: center;
        max-width: 500px;
        margin: 1rem;
        box-shadow: 0 20px 25px -5px rgba(155, 126, 173, 0.1), 0 10px 10px -5px rgba(155, 126, 173, 0.04);
        transform: scale(0.9);
        transition: transform 0.3s ease;
    `;

    modal.innerHTML = `
        <h3 style="color: #4A3B5C; margin-bottom: 1rem; font-size: 1.5rem; font-weight: 600;">Coming Soon!</h3>
        <p style="color: #6B5B7A; margin-bottom: 2rem; line-height: 1.6;">
            Vitae is currently in development. Join our waitlist to be the first to know when we launch and start preserving your legacy.
        </p>
        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
            <button id="joinWaitlist" style="
                background: linear-gradient(135deg, #9B7EAD 0%, #B8A5CB 100%);
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 0.75rem;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.3s ease;
            ">Join Waitlist</button>
            <button id="closeModal" style="
                background: white;
                color: #9B7EAD;
                border: 2px solid #C8B5DB;
                padding: 0.75rem 1.5rem;
                border-radius: 0.75rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            ">Close</button>
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Animate in
    setTimeout(() => {
        overlay.style.opacity = '1';
        modal.style.transform = 'scale(1)';
    }, 10);

    // Add event listeners
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('joinWaitlist').addEventListener('click', function() {
        alert('Thank you for your interest! We\'ll notify you when Vitae launches.');
        closeModal();
    });

    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closeModal();
        }
    });

    function closeModal() {
        overlay.style.opacity = '0';
        modal.style.transform = 'scale(0.9)';
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 300);
    }

    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .btn:hover {
        transform: translateY(-2px);
    }
    
    .btn-secondary:hover {
        background: #E8D5F2;
        border-color: #9B7EAD;
    }
`;
document.head.appendChild(style); 