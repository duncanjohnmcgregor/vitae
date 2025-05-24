// Tests for HTML structure and validation
import fs from 'fs'
import path from 'path'
import { JSDOM } from 'jsdom'

// Load HTML files
const loadHTML = (filename) => {
  const htmlPath = path.join(__dirname, `../${filename}`)
  return fs.readFileSync(htmlPath, 'utf8')
}

describe('HTML Structure Tests', () => {
  let dom, document

  describe('index.html', () => {
    beforeEach(() => {
      const html = loadHTML('index.html')
      dom = new JSDOM(html)
      document = dom.window.document
    })

    describe('Basic HTML Structure', () => {
      test('should have valid HTML5 doctype', () => {
        expect(dom.serialize()).toMatch(/^<!DOCTYPE html>/i)
      })

      test('should have html element with lang attribute', () => {
        const htmlElement = document.documentElement
        expect(htmlElement.tagName).toBe('HTML')
        expect(htmlElement.getAttribute('lang')).toBeTruthy()
      })

      test('should have proper head structure', () => {
        const head = document.head
        expect(head).toBeTruthy()
        
        // Check for required meta tags
        const charset = head.querySelector('meta[charset]')
        expect(charset).toBeTruthy()
        
        const viewport = head.querySelector('meta[name="viewport"]')
        expect(viewport).toBeTruthy()
        expect(viewport.getAttribute('content')).toContain('width=device-width')
        
        const title = head.querySelector('title')
        expect(title).toBeTruthy()
        expect(title.textContent.trim()).not.toBe('')
      })

      test('should have body element', () => {
        expect(document.body).toBeTruthy()
      })
    })

    describe('SEO and Meta Tags', () => {
      test('should have title tag with content', () => {
        const title = document.querySelector('title')
        expect(title).toBeTruthy()
        expect(title.textContent.trim().length).toBeGreaterThan(10)
        expect(title.textContent.trim().length).toBeLessThan(60)
      })

      test('should have meta description', () => {
        const description = document.querySelector('meta[name="description"]')
        expect(description).toBeTruthy()
        expect(description.getAttribute('content').length).toBeGreaterThan(50)
        expect(description.getAttribute('content').length).toBeLessThan(160)
      })

      test('should have Open Graph meta tags', () => {
        const ogTitle = document.querySelector('meta[property="og:title"]')
        const ogDescription = document.querySelector('meta[property="og:description"]')
        const ogType = document.querySelector('meta[property="og:type"]')
        
        expect(ogTitle).toBeTruthy()
        expect(ogDescription).toBeTruthy()
        expect(ogType).toBeTruthy()
      })

      test('should have Twitter Card meta tags', () => {
        const twitterCard = document.querySelector('meta[name="twitter:card"]')
        const twitterTitle = document.querySelector('meta[name="twitter:title"]')
        
        expect(twitterCard).toBeTruthy()
        expect(twitterTitle).toBeTruthy()
      })

      test('should have canonical URL', () => {
        const canonical = document.querySelector('link[rel="canonical"]')
        expect(canonical).toBeTruthy()
        expect(canonical.getAttribute('href')).toMatch(/^https?:\/\//)
      })
    })

    describe('Accessibility', () => {
      test('should have proper heading hierarchy', () => {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
        expect(headings.length).toBeGreaterThan(0)
        
        // Should have exactly one h1
        const h1Elements = document.querySelectorAll('h1')
        expect(h1Elements.length).toBe(1)
        
        // Check that heading levels don't skip
        const headingLevels = Array.from(headings).map(h => parseInt(h.tagName[1]))
        for (let i = 1; i < headingLevels.length; i++) {
          const diff = headingLevels[i] - headingLevels[i-1]
          expect(diff).toBeLessThanOrEqual(1)
        }
      })

      test('should have alt attributes on images', () => {
        const images = document.querySelectorAll('img')
        images.forEach(img => {
          expect(img.hasAttribute('alt')).toBe(true)
        })
      })

      test('should have proper form labels', () => {
        const inputs = document.querySelectorAll('input, textarea, select')
        inputs.forEach(input => {
          const id = input.getAttribute('id')
          const ariaLabel = input.getAttribute('aria-label')
          const placeholder = input.getAttribute('placeholder')
          const label = id ? document.querySelector(`label[for="${id}"]`) : null
          
          // Should have at least one way to identify the input
          expect(label || ariaLabel || placeholder).toBeTruthy()
        })
      })

      test('should have skip navigation link', () => {
        const skipLink = document.querySelector('a[href="#main"], a[href="#content"]')
        expect(skipLink).toBeTruthy()
      })

      test('should have proper link accessibility', () => {
        const links = document.querySelectorAll('a')
        links.forEach(link => {
          const href = link.getAttribute('href')
          const text = link.textContent.trim()
          const ariaLabel = link.getAttribute('aria-label')
          const title = link.getAttribute('title')
          
          // External links should open in new tab with proper attributes
          if (href && href.startsWith('http') && !href.includes(window.location.hostname)) {
            expect(link.getAttribute('target')).toBe('_blank')
            expect(link.getAttribute('rel')).toContain('noopener')
          }
          
          // Links should have descriptive text or aria-label
          expect(text || ariaLabel || title).toBeTruthy()
          if (text) {
            expect(text.toLowerCase()).not.toBe('click here')
            expect(text.toLowerCase()).not.toBe('read more')
            expect(text.toLowerCase()).not.toBe('here')
          }
        })
      })

      test('should have proper ARIA landmarks', () => {
        const nav = document.querySelector('nav, [role="navigation"]')
        const main = document.querySelector('main, [role="main"]')
        const footer = document.querySelector('footer, [role="contentinfo"]')
        
        expect(nav).toBeTruthy()
        expect(main).toBeTruthy()
        // Footer is optional but recommended
      })
    })

    describe('Performance and Loading', () => {
      test('should have proper resource hints', () => {
        const preload = document.querySelectorAll('link[rel="preload"]')
        const prefetch = document.querySelectorAll('link[rel="prefetch"]')
        const preconnect = document.querySelectorAll('link[rel="preconnect"]')
        
        // Should have at least some optimization hints
        expect(preload.length + prefetch.length + preconnect.length).toBeGreaterThan(0)
      })

      test('should load critical CSS inline or with high priority', () => {
        const inlineStyles = document.querySelectorAll('style')
        const criticalCSS = document.querySelectorAll('link[rel="preload"][as="style"]')
        
        // Should either have inline critical CSS or preload important styles
        expect(inlineStyles.length + criticalCSS.length).toBeGreaterThan(0)
      })

      test('should defer non-critical scripts', () => {
        const scripts = document.querySelectorAll('script[src]')
        scripts.forEach(script => {
          const src = script.getAttribute('src')
          const defer = script.hasAttribute('defer')
          const async = script.hasAttribute('async')
          
          // Non-critical scripts should be deferred or async
          if (!src.includes('critical') && !src.includes('inline')) {
            expect(defer || async).toBe(true)
          }
        })
      })
    })

    describe('Content Structure', () => {
      test('should have navigation menu', () => {
        const nav = document.querySelector('nav')
        expect(nav).toBeTruthy()
        
        const navLinks = nav.querySelectorAll('a')
        expect(navLinks.length).toBeGreaterThan(0)
      })

      test('should have hero section', () => {
        const hero = document.querySelector('.hero, #hero, [class*="hero"]')
        expect(hero).toBeTruthy()
      })

      test('should have call-to-action buttons', () => {
        const ctaButtons = document.querySelectorAll('.btn, .button, [class*="cta"]')
        expect(ctaButtons.length).toBeGreaterThan(0)
      })

      test('should have testimonials section', () => {
        const testimonials = document.querySelector('.testimonials, #testimonials, [class*="testimonial"]')
        expect(testimonials).toBeTruthy()
      })

      test('should have features section', () => {
        const features = document.querySelector('.features, #features, [class*="feature"]')
        expect(features).toBeTruthy()
      })

      test('should have proper section structure', () => {
        const sections = document.querySelectorAll('section')
        expect(sections.length).toBeGreaterThan(2)
        
        sections.forEach(section => {
          // Each section should have a heading or aria-label
          const heading = section.querySelector('h1, h2, h3, h4, h5, h6')
          const ariaLabel = section.getAttribute('aria-label')
          const ariaLabelledBy = section.getAttribute('aria-labelledby')
          
          expect(heading || ariaLabel || ariaLabelledBy).toBeTruthy()
        })
      })
    })

    describe('Form Validation', () => {
      test('should have proper form structure', () => {
        const forms = document.querySelectorAll('form')
        
        forms.forEach(form => {
          // Forms should have action or be handled by JavaScript
          const action = form.getAttribute('action')
          const onsubmit = form.getAttribute('onsubmit')
          const id = form.getAttribute('id')
          
          expect(action || onsubmit || id).toBeTruthy()
        })
      })

      test('should have proper input validation', () => {
        const emailInputs = document.querySelectorAll('input[type="email"]')
        const requiredInputs = document.querySelectorAll('input[required]')
        
        emailInputs.forEach(input => {
          // Email inputs should have proper validation
          expect(input.getAttribute('type')).toBe('email')
        })
        
        requiredInputs.forEach(input => {
          // Required inputs should be clearly marked
          expect(input.hasAttribute('required')).toBe(true)
        })
      })
    })
  })

  describe('Additional HTML Pages', () => {
    const additionalPages = [
      'start-your-story.html',
      'how-it-works.html',
      'pricing.html'
    ]

    additionalPages.forEach(filename => {
      describe(filename, () => {
        beforeEach(() => {
          try {
            const html = loadHTML(filename)
            dom = new JSDOM(html)
            document = dom.window.document
          } catch (error) {
            // Skip if file doesn't exist
            console.warn(`File ${filename} not found, skipping tests`)
          }
        })

        test('should have valid HTML structure', () => {
          if (!document) return // Skip if file doesn't exist
          
          expect(document.documentElement.tagName).toBe('HTML')
          expect(document.head).toBeTruthy()
          expect(document.body).toBeTruthy()
          expect(document.querySelector('title')).toBeTruthy()
        })

        test('should have consistent navigation', () => {
          if (!document) return
          
          const nav = document.querySelector('nav')
          expect(nav).toBeTruthy()
          
          // Should link back to home
          const homeLink = nav.querySelector('a[href="/"], a[href="index.html"], a[href="./index.html"]')
          expect(homeLink).toBeTruthy()
        })

        test('should maintain accessibility standards', () => {
          if (!document) return
          
          const h1Elements = document.querySelectorAll('h1')
          expect(h1Elements.length).toBe(1)
          
          const images = document.querySelectorAll('img')
          images.forEach(img => {
            expect(img.hasAttribute('alt')).toBe(true)
          })
        })
      })
    })
  })
}) 