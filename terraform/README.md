# Vitae Website Terraform Deployment

This directory contains the Terraform configuration to deploy your modernized Vitae landing page to Google Cloud Platform with enterprise-grade features.

## 🚀 Features

### Enhanced Infrastructure
- **Google Cloud Storage** - Static website hosting with optimized caching
- **Cloud Load Balancer** - Global load balancing with CDN for superior performance
- **Managed SSL Certificates** - Automatic HTTPS with Google-managed certificates
- **Cloud DNS** - Domain management with automatic DNS configuration
- **Security Headers** - Built-in security headers for protection
- **Performance Optimization** - Aggressive caching strategies for fast loading

### Modern Architecture Benefits
- **Global CDN** - Content delivered from edge locations worldwide
- **Auto-scaling** - Handles traffic spikes automatically
- **99.95% SLA** - Enterprise-grade reliability
- **Zero Maintenance** - Fully managed infrastructure
- **Cost Effective** - Pay only for what you use

## 📋 Prerequisites

1. **Google Cloud Account** with billing enabled
2. **Terraform** installed (version >= 1.0)
3. **Google Cloud CLI** installed and authenticated
4. **Domain name** (optional, but recommended for production)

### Installation Links
- [Terraform Installation](https://learn.hashicorp.com/terraform/getting-started/install)
- [Google Cloud CLI](https://cloud.google.com/sdk/docs/install)

## 🛠 Quick Setup

### 1. Authenticate with Google Cloud
```bash
gcloud auth login
gcloud auth application-default login
```

### 2. Configure Your Settings
Review and update `terraform.tfvars` with your configuration:

```hcl
# Required: Your GCP Project ID
project_id = "your-project-id"

# Required: Your domain name (include trailing dot)
domain_name = "yourdomain.com."

# Optional: Deployment region
region = "us-central1"

# Optional: Custom bucket name
bucket_name = "your-website-bucket"

# Recommended: Enable all performance features
enable_load_balancer = true
enable_ssl = true
manage_dns = true
```

### 3. Deploy (Choose One Method)

#### Option A: Automated Deployment (Recommended)
```bash
# On Windows (PowerShell)
.\deploy.ps1

# On Linux/Mac
./deploy.sh
```

#### Option B: Manual Deployment
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

## 🔧 Configuration Options

### Core Settings
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `project_id` | Your GCP project ID | - | ✅ |
| `region` | GCP region for resources | `us-central1` | ❌ |
| `domain_name` | Your custom domain | `""` | ❌ |
| `website_source_dir` | Source files directory | `../src` | ❌ |

### Performance & Features
| Variable | Description | Default | Recommended |
|----------|-------------|---------|-------------|
| `enable_load_balancer` | Enable CDN and load balancing | `true` | ✅ |
| `enable_ssl` | Enable HTTPS with managed certificates | `true` | ✅ |
| `manage_dns` | Manage DNS in Google Cloud | `true` | ✅ |
| `enable_versioning` | Enable file versioning for rollbacks | `false` | ✅ |

### Environment Options
| Variable | Description | Options | Default |
|----------|-------------|---------|---------|
| `environment` | Deployment environment | `dev`, `staging`, `prod` | `prod` |

## 🌐 Domain Configuration

### Option 1: Full DNS Management (Recommended)
Set `manage_dns = true` and Terraform will:
1. Create a DNS zone in Google Cloud
2. Configure all necessary records automatically
3. Provide nameservers to update at your registrar

### Option 2: External DNS Management
Set `manage_dns = false` and manually configure:
- **A Record**: Point to the load balancer IP
- **CNAME Record**: `www` subdomain to apex domain

## 📊 Performance Features

### Caching Strategy
- **HTML Files**: 5 minutes (quick updates)
- **CSS/JS Files**: 1 year (with immutable flag)
- **Images**: 1 day (balance between freshness and speed)

### Security Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### CDN Benefits
- Global edge caching
- Automatic compression
- DDoS protection
- 99.95% uptime SLA

## 🚀 Deployment Outputs

After successful deployment, you'll see:

```
Environment: prod
Domain: yourdomain.com
Load Balancer: true
SSL Enabled: true
CDN Enabled: true
DNS Managed: true
Primary URL: https://yourdomain.com
```

## 📝 Common Commands

### View All Outputs
```bash
terraform output
```

### Update Website Content
```bash
terraform apply -replace="google_storage_bucket_object.index_html"
```

### Check SSL Certificate Status
```bash
gcloud compute ssl-certificates list
```

### Destroy Infrastructure
```bash
terraform destroy
```

## 🔍 Troubleshooting

### SSL Certificate Issues
- **Problem**: SSL certificate pending
- **Solution**: Wait 10-60 minutes for automatic provisioning
- **Check**: `gcloud compute ssl-certificates describe [cert-name]`

### DNS Propagation
- **Problem**: Domain not resolving
- **Solution**: DNS changes can take up to 48 hours
- **Check**: `nslookup yourdomain.com`

### Load Balancer Warming
- **Problem**: Slow initial requests
- **Solution**: Load balancer needs 5-10 minutes to warm up
- **Expected**: Performance improves after initial requests

## 💰 Cost Optimization

### Expected Monthly Costs (Low Traffic)
- **Storage**: $0.02 - $0.10
- **Load Balancer**: $18.26 (fixed cost)
- **DNS**: $0.50 per zone
- **Bandwidth**: $0.12 per GB

### Cost Saving Tips
1. Use storage-only mode for development (`enable_load_balancer = false`)
2. Enable lifecycle rules for old versions
3. Use regional buckets for local-only sites

## 🔐 Security Best Practices

### Infrastructure Security
- ✅ Uniform bucket-level access enabled
- ✅ Public access restricted to read-only
- ✅ HTTPS enforced with HTTP redirects
- ✅ Security headers configured

### Operational Security
- ✅ Version control for all infrastructure code
- ✅ Separate environments (dev/staging/prod)
- ✅ Least privilege access principles
- ✅ Regular dependency updates

## 📚 Advanced Topics

### Custom Error Pages
To add custom 404 pages, modify the bucket configuration:
```hcl
website {
  main_page_suffix = "index.html"
  not_found_page   = "404.html"
}
```

### Multiple Environments
Create separate `.tfvars` files:
- `dev.tfvars`
- `staging.tfvars`
- `prod.tfvars`

Deploy with:
```bash
terraform apply -var-file="prod.tfvars"
```

### Monitoring & Alerting
Add monitoring with Google Cloud Operations:
```hcl
resource "google_monitoring_uptime_check_config" "website_check" {
  display_name = "Vitae Website Uptime"
  # ... configuration
}
```

## 🆘 Support

### Documentation
- [Terraform Google Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [Google Cloud Storage](https://cloud.google.com/storage/docs)
- [Cloud Load Balancing](https://cloud.google.com/load-balancing/docs)

### Getting Help
1. Check the [troubleshooting section](#-troubleshooting)
2. Review Terraform logs: `terraform apply -detailed-exitcode`
3. Check Google Cloud Console for resource status
4. Verify authentication: `gcloud auth list`

---

**🎉 Your modernized Vitae landing page is now ready for enterprise deployment!** 