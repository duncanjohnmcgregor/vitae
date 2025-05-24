# Comprehensive Testing Guide 🧪

This document describes the comprehensive testing suite for the Vitae project, covering frontend, backend, and infrastructure testing.

## Overview

The testing suite ensures code quality, security, and reliability across three main areas:

- **Frontend Testing**: JavaScript, HTML, CSS validation and testing
- **Backend Testing**: Firebase Cloud Functions testing
- **Infrastructure Testing**: Terraform configuration validation and testing

## Test Requirements

All tests must pass before any code can be merged into the main branch. The PR validation workflow enforces:

- ✅ **Frontend**: 70% test coverage minimum
- ✅ **Backend**: 75% test coverage minimum
- ✅ **Infrastructure**: All Terraform validations must pass
- ✅ **Security**: No hardcoded secrets or security vulnerabilities
- ✅ **Code Quality**: All linting and formatting checks must pass

## Frontend Testing

### Location: `src/`

#### Test Types

1. **Unit Tests** (`src/tests/script.test.js`)
   - Tests JavaScript functionality
   - Navigation, modals, testimonials, form submissions
   - Animation systems and user interactions

2. **HTML Validation** (`src/tests/html.test.js`)
   - HTML structure and semantic validation
   - Accessibility compliance (WCAG guidelines)
   - SEO optimization (meta tags, Open Graph, etc.)
   - Performance optimization checks

3. **ESLint** (Code Quality)
   - JavaScript code style and best practices
   - Security pattern detection
   - Code consistency enforcement

4. **HTML Validate** (Markup Validation)
   - HTML5 compliance
   - Accessibility requirements
   - Semantic structure validation

5. **Stylelint** (CSS Quality)
   - CSS syntax validation
   - Style consistency
   - Best practices enforcement

#### Running Frontend Tests

```bash
# Navigate to frontend directory
cd src

# Install dependencies
npm install

# Run all tests
npm run test:all

# Run individual test types
npm run test          # Jest unit tests
npm run lint          # ESLint code quality
npm run validate:html # HTML validation
npm run validate:css  # CSS validation
npm run test:coverage # Coverage report
```

#### Test Coverage Requirements

- **Lines**: 70% minimum
- **Functions**: 70% minimum
- **Branches**: 70% minimum
- **Statements**: 70% minimum

Coverage reports are generated in `src/coverage/` directory.

### Frontend Test Examples

```javascript
// Example unit test
test('should show waitlist modal for "Start Your Story" button', () => {
  const button = screen.getByText('Start Your Story')
  fireEvent.click(button)

  expect(document.querySelector('.modal-overlay')).toBeInTheDocument()
  expect(screen.getByText('🚀 Join the Waitlist')).toBeInTheDocument()
})

// Example accessibility test
test('should have proper heading hierarchy', () => {
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
  expect(headings.length).toBeGreaterThan(0)
  
  const h1Elements = document.querySelectorAll('h1')
  expect(h1Elements.length).toBe(1) // Should have exactly one h1
})
```

## Backend Testing

### Location: `functions/`

#### Test Types

1. **Unit Tests** (`functions/test/index.test.js`)
   - Firebase Cloud Functions testing
   - API endpoint validation
   - Error handling and edge cases
   - Security and input validation

2. **Integration Tests**
   - Firestore database interactions
   - CORS handling
   - Authentication flows

3. **Performance Tests**
   - Response time validation
   - Concurrent request handling
   - Load testing scenarios

#### Running Backend Tests

```bash
# Navigate to functions directory
cd functions

# Install dependencies
npm install

# Run all tests
npm run test:ci

# Run individual test types
npm run test          # Jest unit tests
npm run lint          # ESLint code quality
npm run test:coverage # Coverage report
```

#### Test Coverage Requirements

- **Lines**: 75% minimum
- **Functions**: 75% minimum
- **Branches**: 75% minimum
- **Statements**: 75% minimum

Coverage reports are generated in `functions/coverage/` directory.

### Backend Test Examples

```javascript
// Example API test
test('should successfully handle valid waitlist submission', async () => {
  mockRequest.body = {
    email: 'test@example.com',
    name: 'Test User'
  }
  
  const mockDocRef = { id: 'mock-doc-id' }
  mockCollection.add.mockResolvedValue(mockDocRef)

  await handleWaitlistSubmission(mockRequest, mockResponse)

  expect(mockResponse.status).toHaveBeenCalledWith(200)
  expect(mockResponse.json).toHaveBeenCalledWith({
    success: true,
    message: 'Successfully joined the waitlist!',
    id: 'mock-doc-id'
  })
})

// Example security test
test('should reject invalid email formats', async () => {
  const invalidEmails = ['plainaddress', '@missing.com', 'invalid@']
  
  for (const email of invalidEmails) {
    mockRequest.body = { email, name: 'Test' }
    await handleWaitlistSubmission(mockRequest, mockResponse)
    expect(mockResponse.status).toHaveBeenLastCalledWith(400)
  }
})
```

## Infrastructure Testing

### Location: `terraform/`

#### Test Types

1. **Terraform Validation** (`terraform/tests/main.tftest.hcl`)
   - Configuration syntax validation
   - Resource configuration testing
   - Variable validation
   - Output validation

2. **Security Scanning**
   - tfsec security analysis
   - Best practices compliance
   - Security policy validation

3. **Format Validation**
   - Terraform formatting consistency
   - Code style compliance

#### Running Infrastructure Tests

```bash
# Navigate to terraform directory
cd terraform

# Initialize Terraform
terraform init

# Run validation
terraform validate

# Check formatting
terraform fmt -check -recursive

# Run comprehensive tests
terraform test

# Security scanning (if tfsec is installed)
tfsec .
```

#### Infrastructure Test Areas

1. **Bucket Configuration**
   - GCS bucket creation and settings
   - Public access configuration
   - CORS and caching policies

2. **Load Balancer Setup**
   - Global IP allocation
   - Backend bucket configuration
   - CDN and SSL setup

3. **Security Headers**
   - Content security policies
   - Cache control headers
   - Security metadata

4. **DNS Configuration**
   - Managed zone creation
   - A record configuration
   - Domain validation

### Infrastructure Test Examples

```hcl
# Example Terraform test
run "bucket_creation" {
  command = plan

  assert {
    condition     = google_storage_bucket.website_bucket.uniform_bucket_level_access == true
    error_message = "Bucket should have uniform bucket-level access enabled"
  }

  assert {
    condition     = length(google_storage_bucket.website_bucket.cors) > 0
    error_message = "Bucket should have CORS configuration"
  }
}

# Example security test
run "security_headers_validation" {
  command = plan

  assert {
    condition     = google_storage_bucket_object.index_html.metadata["X-Frame-Options"] == "DENY"
    error_message = "HTML files should prevent framing"
  }
}
```

## CI/CD Integration

### PR Validation Workflow

The `.github/workflows/pr-validation.yml` workflow automatically runs when:
- Pull requests are opened, updated, or reopened against main
- Manual workflow dispatch is triggered

#### Validation Steps

1. **Environment Setup**
   - Node.js 18 installation
   - Terraform 1.6+ installation
   - Firebase CLI installation

2. **Dependency Installation**
   - Root project dependencies
   - Frontend dependencies (`src/`)
   - Backend dependencies (`functions/`)

3. **Code Quality Checks**
   - PowerShell script syntax validation
   - Firebase configuration validation
   - ESLint code quality checks
   - HTML/CSS validation

4. **Test Execution**
   - Frontend unit tests with coverage
   - Backend unit tests with coverage
   - Infrastructure validation tests

5. **Security Scanning**
   - Hardcoded secret detection
   - JavaScript security pattern analysis
   - Terraform security scanning

6. **Coverage Validation**
   - Frontend: 70% minimum coverage
   - Backend: 75% minimum coverage
   - Coverage reports uploaded as artifacts

### Deployment Workflow

The `.github/workflows/deploy-production.yml` workflow runs when:
- PRs are merged into main (automatic deployment)
- Manual workflow dispatch is triggered

## Test Configuration Files

### Frontend Configuration

- **`src/package.json`**: Dependencies and test scripts
- **`src/tests/setup.js`**: Jest test environment setup
- **`src/.htmlvalidate.json`**: HTML validation rules
- **`src/.stylelintrc.json`**: CSS validation rules

### Backend Configuration

- **`functions/package.json`**: Dependencies and test scripts
- **`functions/.eslintrc.js`**: ESLint configuration

### Infrastructure Configuration

- **`terraform/tests/main.tftest.hcl`**: Terraform test definitions
- **`terraform/test-src/`**: Test source files for validation

## Local Development

### Running Tests Locally

```bash
# Run all tests from project root
npm run test:all          # If root package.json exists

# Frontend tests
cd src && npm run test:all

# Backend tests  
cd functions && npm run test:ci

# Infrastructure tests
cd terraform && terraform test
```

### Pre-commit Hooks (Recommended)

Set up pre-commit hooks to run tests automatically:

```bash
# Install husky (if not already installed)
npm install --save-dev husky

# Set up pre-commit hook
npx husky add .husky/pre-commit "npm run test:all"
```

## Test Data and Mocking

### Frontend Mocking

- DOM manipulation mocked with JSDOM
- Fetch API mocked for HTTP requests
- AOS animation library mocked
- Browser APIs (IntersectionObserver, etc.) mocked

### Backend Mocking

- Firebase Admin SDK mocked
- Firestore database operations mocked
- HTTP request/response objects mocked
- CORS middleware mocked

### Infrastructure Testing

- Uses Terraform's built-in testing framework
- Test variables defined for different scenarios
- No actual cloud resources created during testing

## Troubleshooting

### Common Issues

1. **Test Coverage Below Threshold**
   - Add more unit tests to cover untested code paths
   - Remove dead/unused code
   - Check coverage reports for specific areas needing tests

2. **Linting Errors**
   - Run `npm run lint:fix` to auto-fix issues
   - Follow ESLint configuration rules
   - Update code to match style guidelines

3. **HTML/CSS Validation Errors**
   - Check console output for specific validation failures
   - Ensure proper semantic HTML structure
   - Validate CSS syntax and properties

4. **Terraform Test Failures**
   - Verify variable values in test configuration
   - Check resource configuration syntax
   - Ensure test assertions match actual configuration

### Getting Help

1. **Review test output**: Check detailed error messages in workflow logs
2. **Run tests locally**: Reproduce issues in local environment
3. **Check documentation**: Review this guide and tool-specific docs
4. **Coverage reports**: Use coverage reports to identify missing tests

## Best Practices

### Writing Tests

1. **Descriptive Test Names**: Use clear, descriptive test names
2. **Arrange-Act-Assert**: Structure tests with clear setup, action, and verification
3. **Test Edge Cases**: Include error conditions and boundary conditions
4. **Mock External Dependencies**: Isolate units under test
5. **Keep Tests Fast**: Avoid slow operations in unit tests

### Maintaining Tests

1. **Update Tests with Code Changes**: Keep tests in sync with implementation
2. **Refactor Test Code**: Apply same quality standards to test code
3. **Review Test Coverage**: Regularly review and improve coverage
4. **Document Test Scenarios**: Explain complex test scenarios

## Test Metrics and Reporting

### Coverage Reports

- **Frontend**: Generated in `src/coverage/lcov-report/index.html`
- **Backend**: Generated in `functions/coverage/lcov-report/index.html`

### Artifacts

Test artifacts are automatically uploaded in CI/CD:
- Coverage reports
- Test results
- Terraform state information

### Monitoring

The PR validation ensures:
- ✅ All tests pass before merge
- ✅ Coverage thresholds are met
- ✅ Security scans are clean
- ✅ Code quality standards are maintained

---

## Quick Reference

### Commands Summary

```bash
# Frontend
cd src && npm run test:all

# Backend  
cd functions && npm run test:ci

# Infrastructure
cd terraform && terraform test

# Full validation (simulate CI)
# Run all the above commands in sequence
```

### Coverage Thresholds

- **Frontend**: 70% (lines, functions, branches, statements)
- **Backend**: 75% (lines, functions, branches, statements)
- **Infrastructure**: 100% validation pass rate

### Required Tools

- Node.js 18+
- npm
- Terraform 1.6+
- Firebase CLI
- PowerShell (for deployment scripts)

---

*This testing guide ensures comprehensive quality assurance for the Vitae project. All tests must pass before code can be merged into the main branch and deployed to production.* 