output "website_url" {
  description = "Primary URL of the static website"
  value = var.enable_load_balancer && var.domain_name != "" ? (
    var.enable_ssl ? "https://${trimsuffix(var.domain_name, ".")}" : "http://${trimsuffix(var.domain_name, ".")}"
  ) : "https://storage.googleapis.com/${google_storage_bucket.website_bucket.name}/index.html"
}

output "storage_url" {
  description = "Direct Google Cloud Storage URL"
  value       = "https://storage.googleapis.com/${google_storage_bucket.website_bucket.name}/index.html"
}

output "load_balancer_ip" {
  description = "Load balancer IP address (if enabled)"
  value       = var.enable_load_balancer ? google_compute_global_address.website_ip[0].address : null
}

output "bucket_name" {
  description = "Name of the created GCS bucket"
  value       = google_storage_bucket.website_bucket.name
}

output "bucket_url" {
  description = "GCS bucket URL"
  value       = google_storage_bucket.website_bucket.url
}

output "ssl_certificate_status" {
  description = "SSL certificate status (if enabled)"
  value = var.enable_load_balancer && var.enable_ssl && var.domain_name != "" ? {
    name   = google_compute_managed_ssl_certificate.website_ssl[0].name
    status = "Certificate will be automatically provisioned. This may take 10-60 minutes."
    domains = google_compute_managed_ssl_certificate.website_ssl[0].managed[0].domains
  } : {
    name   = null
    status = "SSL not enabled"
    domains = []
  }
}

output "dns_setup_instructions" {
  description = "Instructions for DNS setup"
  value = var.domain_name != "" ? (
    var.manage_dns ? {
      message = "DNS zone created. Update your domain's nameservers to:"
      nameservers = google_dns_managed_zone.website_zone[0].name_servers
      ip_address = null
      target = null
      cname_setup = null
      note = "DNS propagation may take 24-48 hours"
    } : var.enable_load_balancer ? {
      message = "Point your domain's A record to:"
      nameservers = []
      ip_address = google_compute_global_address.website_ip[0].address
      target = null
      cname_setup = "For www subdomain, create CNAME pointing to your apex domain"
      note = null
    } : {
      message = "Configure your domain's DNS to point to:"
      nameservers = []
      ip_address = null
      target = "c.storage.googleapis.com"
      cname_setup = null
      note = "Create CNAME record for your domain"
    }
  ) : {
    message = "No custom domain configured"
    nameservers = []
    ip_address = null
    target = null
    cname_setup = null
    note = null
  }
}

output "cdn_enabled" {
  description = "Whether CDN is enabled"
  value       = var.enable_load_balancer
}

output "environment" {
  description = "Deployment environment"
  value       = var.environment
}

output "deployment_summary" {
  description = "Summary of deployed resources"
  value = {
    environment     = var.environment
    domain         = var.domain_name != "" ? trimsuffix(var.domain_name, ".") : "No custom domain"
    load_balancer  = var.enable_load_balancer
    ssl_enabled    = var.enable_ssl && var.domain_name != ""
    cdn_enabled    = var.enable_load_balancer
    dns_managed    = var.manage_dns && var.domain_name != ""
    bucket_name    = google_storage_bucket.website_bucket.name
    primary_url    = var.enable_load_balancer && var.domain_name != "" ? (
      var.enable_ssl ? "https://${trimsuffix(var.domain_name, ".")}" : "http://${trimsuffix(var.domain_name, ".")}"
    ) : "https://storage.googleapis.com/${google_storage_bucket.website_bucket.name}/index.html"
  }
} 