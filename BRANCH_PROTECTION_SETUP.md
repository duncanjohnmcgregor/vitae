# Branch Protection Setup Guide 🛡️

This guide explains how to set up branch protection rules to enforce the comprehensive testing framework outlined in `TESTING.md` before allowing merges into the main branch.

## Overview

The branch protection rules ensure that:
- ✅ All PR validation tests pass (70% frontend coverage, 75% backend coverage)
- ✅ Code quality checks pass (ESLint, HTML/CSS validation)
- ✅ Infrastructure validation passes (Terraform)
- ✅ Security scans are clean
- ✅ At least one reviewer approves the PR
- ✅ Branches are up-to-date before merging

## Setting Up Branch Protection Rules

### Step 1: Navigate to Repository Settings

1. Go to your GitHub repository
2. Click on **Settings** tab
3. In the left sidebar, click **Branches**

### Step 2: Add Branch Protection Rule

1. Click **Add rule** button
2. In **Branch name pattern**, enter: `main`
3. Configure the following settings:

#### Required Settings

**✅ Require a pull request before merging**
- Check this box
- Set **Required number of reviewers before merging**: `1`
- ✅ Check **Dismiss stale reviews when new commits are pushed**
- ✅ Check **Require review from code owners** (if you have CODEOWNERS file)

**✅ Require status checks to pass before merging**
- Check this box
- ✅ Check **Require branches to be up to date before merging**
- In the search box, add these required status checks:
  - `validate / Validate Pull Request`

**✅ Require conversation resolution before merging**
- Check this box (ensures all PR comments are resolved)

**✅ Require signed commits** (Optional but recommended)
- Check this box for additional security

**✅ Require linear history** (Optional)
- Check this box to prevent merge commits

#### Admin Settings

**✅ Do not allow bypassing the above settings**
- Uncheck **Allow force pushes**
- Uncheck **Allow deletions**

### Step 3: Save Protection Rule

Click **Create** to save the branch protection rule.

## What This Enforces

With these settings, every PR to main will require:

### 1. Code Quality Standards
- **Frontend**: ESLint, HTML validation, CSS validation
- **Backend**: ESLint for Cloud Functions
- **Infrastructure**: Terraform formatting and validation

### 2. Test Coverage Requirements
- **Frontend**: 70% minimum coverage (lines, functions, branches, statements)
- **Backend**: 75% minimum coverage (lines, functions, branches, statements)
- **All tests must pass**: No failing unit tests allowed

### 3. Security Requirements
- **No hardcoded secrets**: Automated scanning for credentials
- **Security pattern detection**: XSS, eval() usage, etc.
- **File security**: No committed .env files with secrets

### 4. Infrastructure Validation
- **Terraform syntax**: All .tf files must be valid
- **Terraform formatting**: Code must be properly formatted
- **Terraform tests**: All infrastructure tests must pass

### 5. Review Process
- **At least 1 reviewer**: Human review required
- **Up-to-date branches**: Must rebase/merge latest main
- **Resolved conversations**: All PR comments must be addressed

## Testing the Setup

### Create a Test PR

1. Create a new branch: `git checkout -b test-branch-protection`
2. Make a small change (e.g., update README.md)
3. Commit and push: `git push origin test-branch-protection`
4. Create a PR to main
5. Verify that the PR validation workflow runs
6. Try to merge without approval (should be blocked)

### Expected Behavior

- ❌ **Cannot merge without passing checks**: GitHub will show "Merging is blocked"
- ❌ **Cannot merge without review**: At least one approval required
- ❌ **Cannot merge with failing tests**: All validations must pass
- ✅ **Can merge when all requirements met**: Green merge button appears

## Workflow Integration

The branch protection works with the updated `.github/workflows/pr-validation.yml` workflow:

### Automatic Triggers
- **Pull Request Events**: opened, synchronize, reopened, ready_for_review
- **Manual Trigger**: workflow_dispatch for testing

### Validation Steps
1. **Environment Setup**: Node.js 18, Terraform 1.6+, Firebase CLI
2. **Dependency Installation**: Root, frontend, and backend dependencies
3. **Firebase Configuration**: Validate firebase.json, .firebaserc, and firestore.rules
4. **Code Quality**: ESLint, HTML/CSS validation
5. **Unit Testing**: Frontend and backend with coverage requirements
6. **Infrastructure**: Terraform validation and testing
7. **Security Scanning**: Comprehensive security checks
8. **Artifact Upload**: Coverage reports for review

## Troubleshooting

### Common Issues

#### 1. "Required status check is not passing"
- Check the Actions tab for workflow failures
- Review the specific step that failed
- Fix the issue and push new commits

#### 2. "Branch is not up to date"
- Merge or rebase the latest main branch
- Push the updated branch

#### 3. "Review required"
- Request review from team members
- Address any review comments
- Get approval from at least one reviewer

#### 4. Coverage below threshold
- Add more unit tests to increase coverage
- Check coverage reports in workflow artifacts
- Focus on untested code paths

### Getting Help

1. **Check workflow logs**: Detailed error messages in Actions tab
2. **Review coverage reports**: Download artifacts from failed runs
3. **Test locally**: Run the same commands locally before pushing
4. **Update tests**: Add tests for new functionality

## Best Practices

### For Developers

1. **Run tests locally**: Use `npm run test:all` before pushing
2. **Check coverage**: Ensure you meet the thresholds locally
3. **Small PRs**: Easier to review and test
4. **Clear descriptions**: Explain what changed and why

### For Reviewers

1. **Check test coverage**: Review the coverage reports
2. **Verify functionality**: Test the changes if possible
3. **Security review**: Look for potential security issues
4. **Code quality**: Ensure code follows project standards

### For Maintainers

1. **Monitor workflow performance**: Keep an eye on build times
2. **Update dependencies**: Keep testing tools up to date
3. **Review protection rules**: Adjust as project needs change
4. **Document exceptions**: If bypassing rules, document why

## Advanced Configuration

### Custom Status Checks

You can add additional required status checks:

1. Go to **Settings** > **Branches**
2. Edit the protection rule for `main`
3. In **Require status checks**, add:
   - `validate / Frontend Code Quality Checks`
   - `validate / Frontend Unit Tests`
   - `validate / Backend Code Quality Checks`
   - `validate / Backend Unit Tests`
   - `validate / Infrastructure Validation`
   - `validate / Security Scanning`

### CODEOWNERS File

Create a `.github/CODEOWNERS` file to automatically request reviews:

```
# Global owners
* @your-username @team-lead

# Frontend changes
src/ @frontend-team

# Backend changes
functions/ @backend-team

# Infrastructure changes
terraform/ @devops-team

# CI/CD changes
.github/ @devops-team
```

### Multiple Environments

For different environments, you can create separate protection rules:

- `main` - Production (strictest rules)
- `develop` - Development (moderate rules)
- `staging` - Staging (moderate rules)

## Monitoring and Metrics

### Key Metrics to Track

1. **PR Success Rate**: Percentage of PRs that pass all checks
2. **Time to Merge**: Average time from PR creation to merge
3. **Test Coverage Trends**: Track coverage over time
4. **Security Issues**: Number of security findings

### GitHub Insights

Use GitHub's built-in insights:
- **Actions**: Monitor workflow success rates
- **Security**: Review security advisories
- **Insights**: Track contributor activity

---

## Quick Reference

### Required for Merge
- ✅ All status checks passing
- ✅ At least 1 reviewer approval
- ✅ Branch up to date with main
- ✅ All conversations resolved
- ✅ 70% frontend test coverage
- ✅ 75% backend test coverage
- ✅ No security vulnerabilities

### Commands to Run Locally
```bash
# Frontend tests
cd src && npm run test:all

# Backend tests
cd functions && npm run test:ci

# Infrastructure tests
cd terraform && terraform test
```

### Workflow File
- **Location**: `.github/workflows/pr-validation.yml`
- **Triggers**: PR events to main, manual dispatch
- **Timeout**: 30 minutes
- **Artifacts**: Coverage reports uploaded

---

*This branch protection setup ensures code quality, security, and reliability for the Vitae project. All requirements must be met before code can be merged into the main branch.* 