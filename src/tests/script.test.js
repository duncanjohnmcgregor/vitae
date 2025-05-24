// Tests for main script.js functionality
import { screen, fireEvent, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import fs from 'fs'
import path from 'path'

// Load the actual script content
const scriptPath = path.join(__dirname, '../script.js')
const scriptContent = fs.readFileSync(scriptPath, 'utf8')

// Load the HTML content for testing
const htmlPath = path.join(__dirname, '../index.html')
const htmlContent = fs.readFileSync(htmlPath, 'utf8')

// Helper function to load script and trigger DOMContentLoaded
function loadScript() {
  // Execute the script content
  eval(scriptContent)
  
  // Trigger DOMContentLoaded event
  const event = new Event('DOMContentLoaded')
  document.dispatchEvent(event)
}

// Helper function to create a basic DOM structure
function setupBasicDOM() {
  document.body.innerHTML = `
    <nav class="nav">
      <a href="#features">Features</a>
      <a href="#how-it-works">How it Works</a>
    </nav>
    <main>
      <section id="features">Features Section</section>
      <section id="how-it-works">How it Works Section</section>
    </main>
  `
}

describe('Script.js Main Functionality', () => {
  describe('Navigation', () => {
    beforeEach(() => {
      setupBasicDOM()
      loadScript()
    })

    test('should handle smooth scroll navigation', async () => {
      const featureLink = screen.getByText('Features')
      const featuresSection = document.getElementById('features')
      
      // Mock getBoundingClientRect
      featuresSection.getBoundingClientRect = jest.fn(() => ({
        top: 500,
        left: 0,
        bottom: 600,
        right: 1000,
        width: 1000,
        height: 100
      }))

      fireEvent.click(featureLink)

      expect(window.scrollTo).toHaveBeenCalledWith({
        top: expect.any(Number),
        behavior: 'smooth'
      })
    })

    test('should hide navigation on scroll down', () => {
      const nav = document.querySelector('.nav')
      
      // Mock pageYOffset
      Object.defineProperty(window, 'pageYOffset', {
        writable: true,
        value: 150
      })

      // Trigger scroll event
      fireEvent.scroll(window)

      expect(nav.style.transform).toBe('translateY(-100%)')
    })

    test('should show navigation on scroll up', () => {
      const nav = document.querySelector('.nav')
      
      // Set initial scroll position
      Object.defineProperty(window, 'pageYOffset', {
        writable: true,
        value: 50
      })

      // Trigger scroll event
      fireEvent.scroll(window)

      expect(nav.style.transform).toBe('translateY(0)')
    })
  })

  describe('Button Interactions', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <button class="btn">Start Your Story</button>
        <button class="btn">Watch Demo</button>
        <button class="btn">Schedule a Call</button>
        <button class="btn">Learn More</button>
        <section id="features">Features Section</section>
      `
      loadScript()
    })

    test('should show waitlist modal for "Start Your Story" button', () => {
      const button = screen.getByText('Start Your Story')
      fireEvent.click(button)

      expect(document.querySelector('.modal-overlay')).toBeInTheDocument()
      expect(screen.getByText('🚀 Join the Waitlist')).toBeInTheDocument()
    })

    test('should show demo modal for "Watch Demo" button', () => {
      const button = screen.getByText('Watch Demo')
      fireEvent.click(button)

      expect(document.querySelector('.modal-overlay')).toBeInTheDocument()
      expect(screen.getByText('🎥 Watch Demo')).toBeInTheDocument()
    })

    test('should show schedule modal for "Schedule a Call" button', () => {
      const button = screen.getByText('Schedule a Call')
      fireEvent.click(button)

      expect(document.querySelector('.modal-overlay')).toBeInTheDocument()
      expect(screen.getByText('📞 Schedule a Call')).toBeInTheDocument()
    })

    test('should scroll to features for "Learn More" button', () => {
      const button = screen.getByText('Learn More')
      const featuresSection = document.getElementById('features')
      
      featuresSection.scrollIntoView = jest.fn()
      
      fireEvent.click(button)

      expect(featuresSection.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start'
      })
    })

    test('should create ripple effect on button click', () => {
      const button = screen.getByText('Start Your Story')
      
      fireEvent.click(button, {
        clientX: 100,
        clientY: 50
      })

      const ripple = button.querySelector('.ripple')
      expect(ripple).toBeInTheDocument()
    })
  })

  describe('Modal System', () => {
    beforeEach(() => {
      setupBasicDOM()
      loadScript()
    })

    test('should close modal when clicking overlay', () => {
      // Show a modal first
      eval('showModal("waitlist")')
      
      const overlay = document.querySelector('.modal-overlay')
      expect(overlay).toBeInTheDocument()

      fireEvent.click(overlay)
      
      setTimeout(() => {
        expect(document.querySelector('.modal-overlay')).not.toBeInTheDocument()
      }, 400)
    })

    test('should close modal on Escape key', () => {
      eval('showModal("waitlist")')
      
      const overlay = document.querySelector('.modal-overlay')
      expect(overlay).toBeInTheDocument()

      fireEvent.keyDown(document, { key: 'Escape' })
      
      setTimeout(() => {
        expect(document.querySelector('.modal-overlay')).not.toBeInTheDocument()
      }, 400)
    })

    test('should not close modal when clicking modal content', () => {
      eval('showModal("waitlist")')
      
      const modalContent = document.querySelector('.modal-content')
      fireEvent.click(modalContent)

      expect(document.querySelector('.modal-overlay')).toBeInTheDocument()
    })
  })

  describe('Testimonial System', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div class="hero-testimonials-container">
          <div class="testimonial-card">
            <div class="testimonial-name"></div>
            <div class="testimonial-age"></div>
            <div class="testimonial-text"></div>
          </div>
          <div class="testimonial-card">
            <div class="testimonial-name"></div>
            <div class="testimonial-age"></div>
            <div class="testimonial-text"></div>
          </div>
          <div class="testimonial-card">
            <div class="testimonial-name"></div>
            <div class="testimonial-age"></div>
            <div class="testimonial-text"></div>
          </div>
        </div>
      `
      
      // Mock setTimeout to run immediately for testing
      jest.spyOn(global, 'setTimeout').mockImplementation((fn) => fn())
      jest.spyOn(global, 'setInterval').mockImplementation((fn) => fn())
      
      loadScript()
    })

    test('should load initial testimonials', () => {
      const testimonialNames = document.querySelectorAll('.testimonial-name')
      
      // Should have populated all 3 testimonial cards
      testimonialNames.forEach(nameElement => {
        expect(nameElement.textContent).not.toBe('')
      })
    })

    test('should update testimonial content correctly', () => {
      const firstCard = document.querySelector('.testimonial-card')
      const nameElement = firstCard.querySelector('.testimonial-name')
      const ageElement = firstCard.querySelector('.testimonial-age')
      const textElement = firstCard.querySelector('.testimonial-text')

      expect(nameElement.textContent).toMatch(/^[A-Za-z\s]+$/) // Should be a name
      expect(ageElement.textContent).toMatch(/^Age \d+$/) // Should be "Age XX"
      expect(textElement.textContent).toMatch(/^".*"$/) // Should be quoted text
    })
  })

  describe('Form Submission', () => {
    beforeEach(() => {
      fetch.mockClear()
      setupBasicDOM()
      loadScript()
    })

    test('should submit waitlist form successfully', async () => {
      // Mock successful API response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Success!' })
      })

      // Show waitlist modal
      eval('showModal("waitlist")')
      
      // Fill in form
      const emailInput = screen.getByPlaceholderText('Enter your email')
      const nameInput = screen.getByPlaceholderText('Your name')
      const submitButton = screen.getByText('Join Waitlist')

      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(nameInput, 'Test User')
      
      fireEvent.click(submitButton)

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('handleWaitlistSubmission'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            name: 'Test User'
          })
        })
      )
    })

    test('should handle form submission errors', async () => {
      // Mock API error response
      fetch.mockRejectedValueOnce(new Error('Network error'))

      eval('showModal("waitlist")')
      
      const emailInput = screen.getByPlaceholderText('Enter your email')
      const nameInput = screen.getByPlaceholderText('Your name')
      const submitButton = screen.getByText('Join Waitlist')

      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(nameInput, 'Test User')
      
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(document.querySelector('.error-message')).toBeInTheDocument()
      })
    })

    test('should show loading state during submission', async () => {
      // Mock delayed API response
      fetch.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ success: true })
        }), 100))
      )

      eval('showModal("waitlist")')
      
      const emailInput = screen.getByPlaceholderText('Enter your email')
      const nameInput = screen.getByPlaceholderText('Your name')
      const submitButton = screen.getByText('Join Waitlist')

      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(nameInput, 'Test User')
      
      fireEvent.click(submitButton)

      expect(submitButton.textContent).toBe('Submitting...')
      expect(submitButton.disabled).toBe(true)
    })
  })

  describe('Animation System', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div class="story-card">Story Card 1</div>
        <div class="story-card">Story Card 2</div>
        <div class="wave-bar">Wave Bar 1</div>
        <div class="wave-bar">Wave Bar 2</div>
        <div class="floating-element">Float 1</div>
        <div class="floating-element">Float 2</div>
      `
      loadScript()
    })

    test('should initialize AOS when available', () => {
      expect(AOS.init).toHaveBeenCalledWith({
        duration: 600,
        easing: 'ease-out-cubic',
        once: true,
        offset: 50
      })
    })

    test('should add animation delays to hero cards', () => {
      const cards = document.querySelectorAll('.story-card')
      
      cards.forEach((card, index) => {
        expect(card.style.animationDelay).toBe(`${index * 0.2}s`)
        expect(card.classList.contains('fade-in-up')).toBe(true)
      })
    })

    test('should add animation delays to wave bars', () => {
      const waveBars = document.querySelectorAll('.wave-bar')
      
      waveBars.forEach((bar, index) => {
        expect(bar.style.animationDelay).toBe(`${index * 0.1}s`)
      })
    })

    test('should add animation delays to floating elements', () => {
      const elements = document.querySelectorAll('.floating-element')
      
      elements.forEach((element, index) => {
        expect(element.style.animationDelay).toBe(`${index * 0.5}s`)
      })
    })
  })

  describe('URL Detection', () => {
    beforeEach(() => {
      setupBasicDOM()
    })

    test('should use localhost URL in development', () => {
      // Mock localhost hostname
      Object.defineProperty(window.location, 'hostname', {
        writable: true,
        value: 'localhost'
      })

      loadScript()
      eval('showModal("waitlist")')
      
      const form = document.getElementById('waitlistForm')
      fireEvent.submit(form)

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5001/vitae-local/us-central1/handleWaitlistSubmission',
        expect.any(Object)
      )
    })

    test('should use production URL in production', () => {
      // Mock production hostname
      Object.defineProperty(window.location, 'hostname', {
        writable: true,
        value: 'vitae-app.com'
      })

      loadScript()
      eval('showModal("waitlist")')
      
      const form = document.getElementById('waitlistForm')
      fireEvent.submit(form)

      expect(fetch).toHaveBeenCalledWith(
        'https://us-central1-vitae-460717.cloudfunctions.net/handleWaitlistSubmission',
        expect.any(Object)
      )
    })
  })
}) 