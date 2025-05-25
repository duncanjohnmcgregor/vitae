// Tests for Firebase Cloud Functions
const admin = require("firebase-admin");
const functionsTest = require("firebase-functions-test")();

// Mock Firebase Admin SDK
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  firestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      add: jest.fn()
    }))
  }))
}))

// Mock CORS
const mockCors = jest.fn((req, res, callback) => callback())
jest.mock('cors', () => () => mockCors)

// Import the functions to test
const { handleWaitlistSubmission, handleStartStorySubmission } = require('../index')

describe('Firebase Cloud Functions', () => {
  let mockRequest, mockResponse, mockFirestore, mockCollection

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    
    // Setup mock Firestore
    mockCollection = {
      add: jest.fn()
    }
    mockFirestore = {
      collection: jest.fn(() => mockCollection)
    }
    admin.firestore.mockReturnValue(mockFirestore)

    // Setup mock request and response
    mockRequest = {
      method: 'POST',
      body: {},
      headers: {
        'user-agent': 'test-agent',
        'x-forwarded-for': '127.0.0.1'
      },
      connection: {
        remoteAddress: '127.0.0.1'
      }
    }

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis()
    }
  })

  afterAll(() => {
    functionsTest.cleanup();
  });

  describe('handleWaitlistSubmission', () => {
    test('should successfully handle valid waitlist submission', async () => {
      // Arrange
      mockRequest.body = {
        email: 'test@example.com',
        name: 'Test User'
      }
      
      const mockDocRef = { id: 'mock-doc-id' }
      mockCollection.add.mockResolvedValue(mockDocRef)

      // Act
      await handleWaitlistSubmission(mockRequest, mockResponse)

      // Assert
      expect(mockCors).toHaveBeenCalledWith(mockRequest, mockResponse, expect.any(Function))
      expect(mockFirestore.collection).toHaveBeenCalledWith('waitlist')
      expect(mockCollection.add).toHaveBeenCalledWith({
        email: 'test@example.com',
        timestamp: expect.any(Date),
        name: 'Test User',
        userAgent: 'test-agent',
        ip: '127.0.0.1'
      })
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Successfully joined the waitlist!',
        id: 'mock-doc-id'
      })
    })

    test('should handle missing email', async () => {
      // Arrange
      mockRequest.body = {
        name: 'Test User'
      }

      // Act
      await handleWaitlistSubmission(mockRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid email address'
      })
      expect(mockCollection.add).not.toHaveBeenCalled()
    })

    test('should handle invalid email format', async () => {
      // Arrange
      mockRequest.body = {
        email: 'invalid-email',
        name: 'Test User'
      }

      // Act
      await handleWaitlistSubmission(mockRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid email address'
      })
      expect(mockCollection.add).not.toHaveBeenCalled()
    })

    test('should handle database errors', async () => {
      // Arrange
      mockRequest.body = {
        email: 'test@example.com',
        name: 'Test User'
      }
      
      const dbError = new Error('Database connection failed')
      mockCollection.add.mockRejectedValue(dbError)

      // Act
      await handleWaitlistSubmission(mockRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Internal Server Error'
      })
    })

    test('should reject non-POST requests', async () => {
      // Arrange
      mockRequest.method = 'GET'

      // Act
      await handleWaitlistSubmission(mockRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(405)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Method Not Allowed'
      })
      expect(mockCollection.add).not.toHaveBeenCalled()
    })

    test('should handle missing name gracefully', async () => {
      // Arrange
      mockRequest.body = {
        email: 'test@example.com'
      }
      
      const mockDocRef = { id: 'mock-doc-id' }
      mockCollection.add.mockResolvedValue(mockDocRef)

      // Act
      await handleWaitlistSubmission(mockRequest, mockResponse)

      // Assert
      expect(mockCollection.add).toHaveBeenCalledWith({
        email: 'test@example.com',
        timestamp: expect.any(Date),
        name: '',
        userAgent: 'test-agent',
        ip: '127.0.0.1'
      })
      expect(mockResponse.status).toHaveBeenCalledWith(200)
    })

    test('should handle missing headers gracefully', async () => {
      // Arrange
      mockRequest.body = {
        email: 'test@example.com',
        name: 'Test User'
      }
      mockRequest.headers = {}
      mockRequest.connection = {}
      
      const mockDocRef = { id: 'mock-doc-id' }
      mockCollection.add.mockResolvedValue(mockDocRef)

      // Act
      await handleWaitlistSubmission(mockRequest, mockResponse)

      // Assert
      expect(mockCollection.add).toHaveBeenCalledWith({
        email: 'test@example.com',
        timestamp: expect.any(Date),
        name: 'Test User',
        userAgent: '',
        ip: ''
      })
      expect(mockResponse.status).toHaveBeenCalledWith(200)
    })
  })

  describe('handleStartStorySubmission', () => {
    test('should successfully handle valid start story submission', async () => {
      // Arrange
      mockRequest.body = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '555-1234',
        age: '65',
        motivation: 'For my grandchildren',
        timeline: '3 months'
      }
      
      const mockDocRef = { id: 'mock-story-doc-id' }
      mockCollection.add.mockResolvedValue(mockDocRef)

      // Act
      await handleStartStorySubmission(mockRequest, mockResponse)

      // Assert
      expect(mockFirestore.collection).toHaveBeenCalledWith('start-story-submissions')
      expect(mockCollection.add).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '555-1234',
        age: '65',
        motivation: 'For my grandchildren',
        timeline: '3 months',
        timestamp: expect.any(Date),
        userAgent: 'test-agent',
        ip: '127.0.0.1',
        status: 'pending'
      })
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Thank you for starting your story journey! We\'ll contact you within 24 hours.',
        id: 'mock-story-doc-id'
      })
    })

    test('should handle missing required fields', async () => {
      // Arrange
      mockRequest.body = {
        firstName: 'John'
        // Missing lastName and email
      }

      // Act
      await handleStartStorySubmission(mockRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'First name, last name, and email are required'
      })
      expect(mockCollection.add).not.toHaveBeenCalled()
    })

    test('should handle invalid email in start story submission', async () => {
      // Arrange
      mockRequest.body = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email'
      }

      // Act
      await handleStartStorySubmission(mockRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid email address'
      })
      expect(mockCollection.add).not.toHaveBeenCalled()
    })

    test('should handle optional fields gracefully', async () => {
      // Arrange
      mockRequest.body = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
        // Optional fields omitted
      }
      
      const mockDocRef = { id: 'mock-story-doc-id' }
      mockCollection.add.mockResolvedValue(mockDocRef)

      // Act
      await handleStartStorySubmission(mockRequest, mockResponse)

      // Assert
      expect(mockCollection.add).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '',
        age: '',
        motivation: '',
        timeline: '',
        timestamp: expect.any(Date),
        userAgent: 'test-agent',
        ip: '127.0.0.1',
        status: 'pending'
      })
      expect(mockResponse.status).toHaveBeenCalledWith(200)
    })

    test('should reject non-POST requests for start story', async () => {
      // Arrange
      mockRequest.method = 'GET'

      // Act
      await handleStartStorySubmission(mockRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(405)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Method Not Allowed'
      })
      expect(mockCollection.add).not.toHaveBeenCalled()
    })

    test('should handle database errors for start story', async () => {
      // Arrange
      mockRequest.body = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
      }
      
      const dbError = new Error('Database write failed')
      mockCollection.add.mockRejectedValue(dbError)

      // Act
      await handleStartStorySubmission(mockRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Internal Server Error'
      })
    })
  })

  describe('Security and Validation', () => {
    test('should sanitize and validate email addresses', async () => {
      const testEmails = [
        'test@example.com',
        'user.name+tag@example.co.uk',
        'firstname-lastname@domain.org'
      ]

      for (const email of testEmails) {
        mockRequest.body = { email, name: 'Test' }
        mockCollection.add.mockResolvedValue({ id: 'test-id' })
        
        await handleWaitlistSubmission(mockRequest, mockResponse)
        
        expect(mockResponse.status).toHaveBeenLastCalledWith(200)
        jest.clearAllMocks()
      }
    })

    test('should reject invalid email formats', async () => {
      const invalidEmails = [
        'plainaddress',
        '@missingdomain.com',
        'missing@.com',
        'spaces in@email.com',
        'toolong' + 'a'.repeat(250) + '@domain.com'
      ]

      for (const email of invalidEmails) {
        mockRequest.body = { email, name: 'Test' }
        
        await handleWaitlistSubmission(mockRequest, mockResponse)
        
        expect(mockResponse.status).toHaveBeenLastCalledWith(400)
        expect(mockCollection.add).not.toHaveBeenCalled()
        jest.clearAllMocks()
      }
    })

    test('should handle extremely long input strings', async () => {
      // Arrange
      const longString = 'a'.repeat(10000)
      mockRequest.body = {
        firstName: longString,
        lastName: 'Doe',
        email: 'test@example.com'
      }
      
      const mockDocRef = { id: 'test-id' }
      mockCollection.add.mockResolvedValue(mockDocRef)

      // Act
      await handleStartStorySubmission(mockRequest, mockResponse)

      // Assert - should still work but with the long string
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockCollection.add).toHaveBeenCalledWith({
        firstName: longString,
        lastName: 'Doe',
        email: 'test@example.com',
        phone: '',
        age: '',
        motivation: '',
        timeline: '',
        timestamp: expect.any(Date),
        userAgent: 'test-agent',
        ip: '127.0.0.1',
        status: 'pending'
      })
    })

    test('should handle special characters in input', async () => {
      // Arrange
      mockRequest.body = {
        firstName: 'José María',
        lastName: 'García-López',
        email: 'jose@example.com',
        motivation: 'For my niños & família! 💕'
      }
      
      const mockDocRef = { id: 'test-id' }
      mockCollection.add.mockResolvedValue(mockDocRef)

      // Act
      await handleStartStorySubmission(mockRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockCollection.add).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'José María',
          lastName: 'García-López',
          email: 'jose@example.com',
          motivation: 'For my niños & família! 💕'
        })
      )
    })
  })

  describe('Performance and Load Testing', () => {
    test('should handle multiple concurrent requests', async () => {
      // Arrange
      const requests = Array.from({ length: 10 }, (_, i) => ({
        method: 'POST',
        body: {
          email: `test${i}@example.com`,
          name: `User ${i}`
        },
        headers: mockRequest.headers,
        connection: mockRequest.connection
      }))

      const promises = requests.map(req => 
        handleWaitlistSubmission(req, mockResponse)
      )

      mockCollection.add.mockResolvedValue({ id: 'test-id' })

      // Act
      await Promise.all(promises)

      // Assert
      expect(mockCollection.add).toHaveBeenCalledTimes(10)
      expect(mockResponse.status).toHaveBeenCalledTimes(10)
    })

    test('should have reasonable response time', async () => {
      // Arrange
      mockRequest.body = {
        email: 'test@example.com',
        name: 'Test User'
      }
      mockCollection.add.mockResolvedValue({ id: 'test-id' })

      // Act
      const startTime = Date.now()
      await handleWaitlistSubmission(mockRequest, mockResponse)
      const endTime = Date.now()

      // Assert
      const responseTime = endTime - startTime
      expect(responseTime).toBeLessThan(1000) // Should respond within 1 second
    })
  })

  describe('Error Handling and Resilience', () => {
    test('should handle malformed JSON gracefully', async () => {
      // Arrange
      mockRequest.body = null

      // Act
      await handleWaitlistSubmission(mockRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400)
    })

    test('should handle Firestore timeout errors', async () => {
      // Arrange
      mockRequest.body = {
        email: 'test@example.com',
        name: 'Test User'
      }
      
      const timeoutError = new Error('Deadline exceeded')
      timeoutError.code = 4 // DEADLINE_EXCEEDED
      mockCollection.add.mockRejectedValue(timeoutError)

      // Act
      await handleWaitlistSubmission(mockRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Internal Server Error'
      })
    })

    test('should handle network errors gracefully', async () => {
      // Arrange
      mockRequest.body = {
        email: 'test@example.com',
        name: 'Test User'
      }
      
      const networkError = new Error('Network is unreachable')
      mockCollection.add.mockRejectedValue(networkError)

      // Act
      await handleWaitlistSubmission(mockRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500)
    })
  })
}) 