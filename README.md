### **vitae**
*leave your legacy*

**vitae is an application that:**
- connects "listeners" to "storytellers"
- has both a vitae-run in-person white glove service and a media platform with two-sided content strategy
- media platform will be monetized through ads, white glove service will be a location agnostic high margin premium offering 
- revenue sharing for stories published on media platform

**🚀 Production Ready:** This project includes automated deployment scripts for both local development and production environments using Firebase and Google Cloud Platform.

## ✨ **Key Features**

- **🎯 One-Command Deployment**: `.\deploy.ps1 -Environment prod` deploys everything
- **🔧 Local Development**: Full Firebase emulator environment with `.\deploy.ps1`
- **🤖 Smart Configuration**: Automatically detects project settings from `terraform.tfvars`
- **📊 Full Stack**: Firebase Hosting + Functions + Firestore + optional Terraform infrastructure
- **💡 Waitlist Ready**: Functional email collection with Firestore database storage
- **🌐 Production URLs**: 
  - **Live Site**: https://vitae-460717.web.app
  - **Functions**: Auto-configured based on environment
- **📱 Responsive Design**: Modern, mobile-first landing page design

## 🚀 **Quick Start**

```powershell
# Clone and deploy to production in 3 commands
git clone <your-repo>
cd vitae
.\deploy.ps1 -Environment prod
```

**📖 For detailed setup instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)**

<details>
<summary>📋 <strong>vitae growth plan</strong></summary>

- Vitae built first - run as a high-touch ai assisted in person business
    - build out framework for recording support - ai to record conversations, process, generate initial & follow up questions, create transcript
    - build out framework for editing output - ai assisted tooling to parse through videos, select clips, edit together, create physical packaging, burn to external media
    - separately scale this as a business and have shared technology with media platform

- free option built next - setting up a video streaming media platform:
    - decide on how content will be consumed e.g. audio and/or video content, length (youtube vs tiktok style)
    -  build framework for consuming content e.g. video explorer/for you page
    - figure out how this interlocks with paid option for initial bootstrap - can we offer customers of the in person the chance to get it for a discount/free if they allow us to edit & upload their content?

- then 2 sided marketplace - enabling creator economy in free option:
    - figure out how we enable other people to use our ai tooling to create their own interviews with people they know, for some share of the revenue
</details>


---



<details>
<summary>💰 <strong>Cost Estimation</strong></summary>

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
<summary>📁 <strong>Project Structure</strong></summary>

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
├── deploy.ps1            # 🚀 Main deployment script (PowerShell)
├── firebase.json         # Firebase configuration
├── .firebaserc           # Firebase project aliases
├── firestore.rules       # Database security rules
├── DEPLOYMENT.md         # 📖 Comprehensive deployment guide
├── .gitignore           # Git ignore rules
└── README.md            # This file
```
</details>


---

<details>
<summary>🔧 <strong>Technical Help</strong></summary>

   <details>
   <summary>🚀 <strong>Quick Start - One-Command Deployment</strong></summary>

   Deploy your Vitae landing page to production with a single PowerShell command using our automated deployment script.

   ### **Prerequisites**

   1. **Required Tools** (script will check for these):
      - [Node.js](https://nodejs.org/) (v18 or later)
      - [Firebase CLI](https://firebase.google.com/docs/cli): `npm install -g firebase-tools`
      - [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
      - [Terraform](https://www.terraform.io/downloads.html) (optional, for advanced infrastructure)

   2. **Google Cloud Setup**:
      ```powershell
      # Authenticate with Google Cloud
      gcloud auth login
      gcloud auth application-default login
      
      # Enable required APIs
      gcloud services enable cloudfunctions.googleapis.com
      gcloud services enable storage-api.googleapis.com
      gcloud services enable compute.googleapis.com
      ```

   3. **Firebase Setup**:
      ```powershell
      # Login to Firebase
      firebase login
      
      # Create Firebase project (or use existing GCP project)
      firebase projects:addfirebase YOUR_GCP_PROJECT_ID
      ```

   ### **Deployment Commands**

   **🎯 Production Deployment (Automatic):**
   ```powershell
   # Deploy everything - uses project ID from terraform.tfvars automatically
   .\deploy.ps1 -Environment prod
   ```

   **🛠️ Local Development:**
   ```powershell
   # Start local development environment with emulators
   .\deploy.ps1
   ```

   **⚡ Quick Options:**
   ```powershell
   # Firebase only (no Terraform infrastructure)
   .\deploy.ps1 -Environment prod -SkipTerraform
   
   # Functions only
   .\deploy.ps1 -Environment prod -DeployFunctionsOnly
   
   # Custom project ID
   .\deploy.ps1 -Environment prod -ProjectId your-project-id
   ```

   ### **What Gets Deployed**

   **Firebase (Primary):**
   - ✅ **Hosting**: Static website at `https://your-project.web.app`
   - ✅ **Functions**: Serverless waitlist handler
   - ✅ **Firestore**: Database for storing submissions
   - ✅ **Security Rules**: Database access controls

   **Terraform (Optional):**
   - ✅ **Custom Domain**: SSL-enabled custom domain
   - ✅ **CDN**: Google Cloud Load Balancer with caching
   - ✅ **DNS**: Managed DNS zone

   ### **First-Time Setup**

   1. **Configure your project**:
      ```powershell
      # Edit terraform/terraform.tfvars with your project details
      # The script will auto-detect your project ID from here
      ```

   2. **Deploy to production**:
      ```powershell
      .\deploy.ps1 -Environment prod
      ```

   3. **Access your site**:
      - **Firebase URL**: `https://your-project-id.web.app`
      - **Custom Domain**: (if configured via Terraform)

   </details>

   <details>
   <summary>🏠 <strong>Local Development</strong></summary>

   **Start Development Environment:**
   ```powershell
   .\deploy.ps1
   ```

   **Local URLs:**
   - 🌐 **Website**: http://localhost:3000
   - 🔥 **Firebase UI**: http://localhost:4001
   - ⚡ **Functions**: http://localhost:5001
   - 🗄️ **Firestore**: http://localhost:8081

   **Features:**
   - ✅ Live reload for website changes
   - ✅ Local Firebase Functions testing
   - ✅ Local Firestore database
   - ✅ Automatic URL switching for development

   </details>

   <details>
   <summary>🌐 <strong>Custom Domain Setup</strong></summary>

   **Option 1: Firebase Hosting Domain (Easiest)**
   ```powershell
   # Add custom domain via Firebase Console
   # https://console.firebase.google.com/project/YOUR_PROJECT/hosting
   ```

   **Option 2: Terraform with Load Balancer (Advanced)**
   ```hcl
   # Edit terraform/terraform.tfvars
   domain_name = "vitae.yourdomain.com."
   enable_load_balancer = true
   enable_ssl = true
   ```

   ```powershell
   # Deploy with Terraform
   .\deploy.ps1 -Environment prod
   ```

   </details>

   <details>
   <summary>📊 <strong>Monitoring & Logs</strong></summary>

   **Firebase Console:**
   - **Hosting**: https://console.firebase.google.com/project/YOUR_PROJECT/hosting
   - **Functions**: https://console.firebase.google.com/project/YOUR_PROJECT/functions
   - **Firestore**: https://console.firebase.google.com/project/YOUR_PROJECT/firestore

   **Google Cloud Console:**
   - **Project Dashboard**: https://console.cloud.google.com/home/dashboard?project=YOUR_PROJECT
   - **Functions Logs**: https://console.cloud.google.com/functions
   - **Storage**: https://console.cloud.google.com/storage

   </details>

   <details>
   <summary>🧹 <strong>Cleanup</strong></summary>

   **Remove Production Resources:**
   ```powershell
   # Delete Terraform infrastructure
   cd terraform
   terraform destroy
   
   # Delete Firebase resources via console
   # https://console.firebase.google.com/project/YOUR_PROJECT/settings/general
   ```

   **Stop Local Development:**
   ```
   Press Ctrl+C in the terminal running emulators
   ```

   </details>

   <details>
   <summary>❓ <strong>Troubleshooting</strong></summary>

   **Common Issues:**

   1. **"Command not found" errors**
      - Install missing tools and restart terminal
      - Check PATH environment variable

   2. **Authentication errors**
      - Run `firebase login` and `gcloud auth login`
      - Ensure you have project permissions

   3. **Deployment fails**
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
   </details>




