// Jest setup file for frontend tests
import '@testing-library/jest-dom'

// Mock AOS (Animate On Scroll) library
global.AOS = {
  init: jest.fn(),
  refresh: jest.fn(),
  refreshHard: jest.fn()
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback) => {
  return setTimeout(callback, 16)
}

global.cancelAnimationFrame = (id) => {
  clearTimeout(id)
}

// Mock getComputedStyle
global.getComputedStyle = () => ({
  getPropertyValue: () => '',
  marginTop: '0px',
  marginBottom: '0px'
})

// Mock scrollTo
global.scrollTo = jest.fn()

// Mock fetch for API calls
global.fetch = jest.fn()

// Mock console methods to reduce noise in tests
const originalConsole = global.console
global.console = {
  ...originalConsole,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}

// Clean up after each test
afterEach(() => {
  // Clear all mocks
  jest.clearAllMocks()
  
  // Clean up DOM
  document.body.innerHTML = ''
  document.head.innerHTML = ''
  
  // Clear timers
  jest.clearAllTimers()
  
  // Reset fetch mock
  if (fetch.mockClear) {
    fetch.mockClear()
  }
})

// Setup DOM before each test
beforeEach(() => {
  // Add viewport meta tag
  const viewport = document.createElement('meta')
  viewport.name = 'viewport'
  viewport.content = 'width=device-width, initial-scale=1'
  document.head.appendChild(viewport)
  
  // Add charset meta tag
  const charset = document.createElement('meta')
  charset.setAttribute('charset', 'UTF-8')
  document.head.appendChild(charset)
}) 