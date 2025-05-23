### **vitae**
*leave your legacy*

**vitae is an application that:**
- connects "listeners" to "storytellers"
- has both a vitae-run in-person white glove service and a media platform with two-sided content strategy
- media platform will be monetized through ads, white glove service will be a location agnostic high margin premium offering 
- revenue sharing for stories published on media platform

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

This deployment uses the cheapest possible GCP setup:
- **Google Cloud Storage**: ~$0.02/GB/month for storage
- **Data Transfer**: First 1GB free per month, then ~$0.12/GB
- **DNS (if using custom domain)**: ~$0.40/month for managed zone

**Estimated monthly cost for a small website: $1-5/month**
</details>

<details>
<summary>📁 <strong>Project Structure</strong></summary>

```
vitae/
├── src/                    # Website source files
│   ├── index.html         # Main landing page
│   ├── styles.css         # Styling with muted pastel purple theme
│   └── script.js          # Interactive functionality
├── terraform/             # Infrastructure as code
│   ├── main.tf           # Main Terraform configuration
│   ├── variables.tf      # Input variables
│   ├── outputs.tf        # Output values
│   ├── versions.tf       # Provider versions
│   └── terraform.tfvars.example  # Example configuration
├── .gitignore            # Git ignore rules
└── README.md             # This file
```
</details>


---

<details>
<summary>🔧 <strong>Technical Help</strong></summary>
   <details>
   <summary>🚀 <strong>Quick Start - Deploy to GCP</strong></summary>

   This project includes Terraform infrastructure to deploy the Vitae landing page to Google Cloud Platform using the simplest and cheapest method (Google Cloud Storage static website hosting).

   ### **Prerequisites**

   1. **Google Cloud Platform Account**
      - Create a GCP project
      - Enable billing
      - Enable the Cloud Storage API

   2. **Install Required Tools**
      ```bash
      # Install Terraform
      # Download from: https://www.terraform.io/downloads.html
      
      # Install Google Cloud CLI
      # Download from: https://cloud.google.com/sdk/docs/install
      ```

   3. **Authenticate with GCP**
      ```bash
      gcloud auth login
      gcloud config set project YOUR_PROJECT_ID
      gcloud auth application-default login
      ```

   ### **Deployment Steps**

   1. **Configure Terraform Variables**
      ```bash
      cd terraform
      cp terraform.tfvars.example terraform.tfvars
      # Edit terraform.tfvars with your project details
      ```

   2. **Initialize and Deploy**
      ```bash
      terraform init
      terraform plan
      terraform apply
      ```

   3. **Access Your Website**
      After deployment, Terraform will output the website URL. Your site will be available at:
      ```
      https://storage.googleapis.com/YOUR_BUCKET_NAME/index.html
      ```
   </details>



   <details>
   <summary>🌐 <strong>Custom Domain Setup (Optional)</strong></summary>

   To use a custom domain:

   1. **Set domain_name in terraform.tfvars**
      ```hcl
      domain_name = "vitae.yourdomain.com"
      ```

   2. **Apply Terraform changes**
      ```bash
      terraform apply
      ```

   3. **Update your domain's DNS**
      - Point your domain to the name servers output by Terraform
      - Or create a CNAME record pointing to `c.storage.googleapis.com`
   </details>

   <details>
   <summary>🧹 <strong>Cleanup</strong></summary>

   To destroy all resources and stop billing:
   ```bash
   cd terraform
   terraform destroy
   ```
   </details>
   </details>




