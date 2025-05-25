# vitae

*leave your legacy*

**vitae is an application that:**
- connects "listeners" to "storytellers"
- has both a vitae-run in-person white glove service and a media platform with two-sided content strategy
- media platform will be monetized through ads, white glove service will be a location agnostic high margin premium offering 
- revenue sharing for stories published on media platform

🚀 **Production Ready:** This project includes automated deployment scripts for both local development and production environments using Firebase and Google Cloud Platform.

## Key Features

- **One-Command Deployment**: `.\deploy.ps1 -Environment prod` deploys everything
- **Local Development**: Full Firebase emulator environment with `.\deploy.ps1`
- **Smart Configuration**: Automatically detects project settings from `terraform.tfvars`
- **Full Stack**: Firebase Hosting + Functions + Firestore + optional Terraform infrastructure
- **Waitlist Ready**: Functional email collection with Firestore database storage
- **Production URLs**: 
  - **Live Site**: https://vitae-460717.web.app
  - **Functions**: Auto-configured based on environment
- **Responsive Design**: Modern, mobile-first landing page design

## Quick Start

```powershell
# Clone and deploy to production in 3 commands
git clone <your-repo>
cd vitae
.\deploy.ps1 -Environment prod
```

## Quick Local Testing

**Want to quickly test the website locally? Use our simple Node.js server:**

```bash
# Prerequisites: Node.js installed (https://nodejs.org/)

# Method 1: Using npm (recommended)
npm run serve

# Method 2: Direct Node.js command
node serve-local.js
```

**Your site will be available at:** http://localhost:8001

**This simple method:**
- ✅ Serves static files from the `src/` folder
- ✅ Works immediately without Firebase setup
- ✅ Perfect for testing HTML/CSS/JS changes
- ✅ No database or functions (for that, use Firebase emulators below)

---

**For detailed setup instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)**

## Project Roadmap

<details>
<summary>vitae growth plan</summary>

**Phase 1: High-touch AI-assisted in-person business**
- Build framework for recording support - AI to record conversations, process, generate initial & follow up questions, create transcript
- Build framework for editing output - AI assisted tooling to parse through videos, select clips, edit together, create physical packaging, burn to external media
- Scale this as a business with shared technology for media platform

**Phase 2: Free video streaming media platform**
- Decide on content consumption format (audio/video, length - YouTube vs TikTok style)
- Build framework for consuming content (video explorer/for you page)
- Integrate with paid option for initial bootstrap - offer discount/free to in-person customers who allow content upload

**Phase 3: Two-sided marketplace creator economy**
- Enable others to use AI tooling for their own interviews
- Revenue sharing model for user-generated content
- Scale the creator ecosystem

</details>

## Technical Information

<details>
<summary>Cost Estimation</summary>

This deployment uses Firebase + GCP with generous free tiers:

**Firebase (Primary):**
- **Hosting**: 10GB storage + 10GB/month transfer free
- **Functions**: 125K invocations + 40K GB-seconds free per month
- **Firestore**: 1GB storage + 20K reads + 20K writes free per day

**Google Cloud (Optional Terraform Infrastructure):**
- **Cloud Storage**: ~$0.02/GB/month for storage
- **Load Balancer**: ~$18/month (only if enabled)
- **DNS**: ~$0.40/month for managed zone

**Estimated monthly cost:**
- **Small website (Firebase only)**: $0/month (within free tier)
- **Production with custom domain + CDN**: $1-5/month
- **High-traffic with load balancer**: $20-30/month

</details>

<details>
<summary>Project Structure</summary>

```
vitae/
├── src/                    # Website source files
│   ├── index.html         # Main landing page
│   ├── styles.css         # Styling with muted pastel purple theme
│   └── script.js          # Interactive functionality with waitlist
├── functions/             # Firebase Functions (serverless backend)
│   ├── index.js          # Waitlist submission handler
│   └── package.json      # Node.js dependencies
├── terraform/             # Infrastructure as code (optional)
│   ├── main.tf           # Main Terraform configuration
│   ├── variables.tf      # Input variables
│   ├── outputs.tf        # Output values
│   ├── versions.tf       # Provider versions
│   └── terraform.tfvars  # Your project configuration
├── deploy.ps1            # Main deployment script (PowerShell)
├── serve-local.js         # Simple local development server
├── firebase.json         # Firebase configuration
├── .firebaserc           # Firebase project aliases
├── firestore.rules       # Database security rules
├── DEPLOYMENT.md         # Comprehensive deployment guide
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

</details>

<details>
<summary>Development Guide</summary>

### Prerequisites

**Required Tools** (deployment script will check for these):
- [Node.js](https://nodejs.org/) (v18 or later)
- [Firebase CLI](https://firebase.google.com/docs/cli): `npm install -g firebase-tools`
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
- [Terraform](https://www.terraform.io/downloads.html) (optional, for advanced infrastructure)

### Local Development Options

**Option 1: Quick Static Testing** (Recommended for UI/UX work)
```bash
# Simple static file server - no setup required
npm run serve
# or: node serve-local.js
```
- Website: http://localhost:8001
- ✅ Instant setup, perfect for HTML/CSS/JS testing
- ❌ No database or backend functions

**Option 2: Full Firebase Development** (For backend testing)
```powershell
# Complete development environment with Firebase emulators
.\deploy.ps1
```
- Website: http://localhost:3000
- Firebase UI: http://localhost:4001
- Functions: http://localhost:5001
- Firestore: http://localhost:8081
- ✅ Live reload for website changes
- ✅ Local Firebase Functions testing
- ✅ Local Firestore database

**Tip:** Use simple static testing for quick UI changes, Firebase emulators when testing the waitlist functionality.

### Deployment Commands

**Production Deployment:**
```powershell
# Deploy everything - uses project ID from terraform.tfvars automatically
.\deploy.ps1 -Environment prod
```

**Development Environment:**
```powershell
# Start local development environment with emulators
.\deploy.ps1
```

**Quick Options:**
```powershell
# Firebase only (no Terraform infrastructure)
.\deploy.ps1 -Environment prod -SkipTerraform

# Functions only
.\deploy.ps1 -Environment prod -DeployFunctionsOnly

# Custom project ID
.\deploy.ps1 -Environment prod -ProjectId your-project-id
```

</details>

<details>
<summary>Troubleshooting</summary>

**Common Issues:**

1. **"Python was not found" when trying to serve locally**
   - This project uses Node.js, not Python
   - Use `npm run serve` or `node serve-local.js` instead of `python -m http.server`
   - Install Node.js from https://nodejs.org/ if not already installed

2. **"Command not found" errors**
   - Install missing tools and restart terminal
   - Check PATH environment variable

3. **Authentication errors**
   - Run `firebase login` and `gcloud auth login`
   - Ensure you have project permissions

4. **Deployment fails**
   - Check that GCP project exists and billing is enabled
   - Verify Firebase project is properly set up
   - See detailed troubleshooting in [DEPLOYMENT.md](DEPLOYMENT.md)

**Get Help:**
```powershell
# Show script help
.\deploy.ps1 -?

# Check tool versions
node --version
firebase --version
gcloud --version
terraform --version
```

</details>

---

Built with ❤️ for preserving life stories




v i t a e 
 
 