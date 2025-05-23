# Generate a random suffix for bucket name to ensure uniqueness
resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# Local values for computed names
locals {
  bucket_name = var.bucket_name != "" ? var.bucket_name : "vitae-website-${random_id.bucket_suffix.hex}"
  
  # Define MIME types for proper content serving
  mime_types = {
    ".html" = "text/html"
    ".css"  = "text/css"
    ".js"   = "application/javascript"
    ".json" = "application/json"
    ".ico"  = "image/x-icon"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif"
    ".svg"  = "image/svg+xml"
    ".woff" = "font/woff"
    ".woff2" = "font/woff2"
    ".ttf"  = "font/ttf"
    ".eot"  = "application/vnd.ms-fontobject"
  }
}

# Create the GCS bucket for static website hosting
resource "google_storage_bucket" "website_bucket" {
  name          = local.bucket_name
  location      = var.region
  force_destroy = true

  # Enable static website hosting
  website {
    main_page_suffix = "index.html"
    not_found_page   = "index.html"
  }

  # Enable uniform bucket-level access
  uniform_bucket_level_access = true

  # CORS configuration for web assets and modern browser features
  cors {
    origin          = ["*"]
    method          = ["GET", "HEAD", "OPTIONS"]
    response_header = ["Content-Type", "Access-Control-Allow-Origin", "Access-Control-Allow-Methods", "Access-Control-Allow-Headers"]
    max_age_seconds = 3600
  }

  # Lifecycle rule to keep costs down (optional)
  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type = "Delete"
    }
  }

  # Versioning for rollback capability
  versioning {
    enabled = var.enable_versioning
  }
}

# Make the bucket publicly readable
resource "google_storage_bucket_iam_member" "public_read" {
  bucket = google_storage_bucket.website_bucket.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

# Upload index.html with optimized cache settings
resource "google_storage_bucket_object" "index_html" {
  name   = "index.html"
  bucket = google_storage_bucket.website_bucket.name
  source = "${var.website_source_dir}/index.html"

  content_type = "text/html; charset=utf-8"
  
  # Short cache for HTML to allow quick updates
  cache_control = "public, max-age=300, s-maxage=600"
  
  # Add security headers
  metadata = {
    "Cache-Control"           = "public, max-age=300, s-maxage=600"
    "X-Content-Type-Options"  = "nosniff"
    "X-Frame-Options"         = "DENY"
    "X-XSS-Protection"        = "1; mode=block"
    "Referrer-Policy"         = "strict-origin-when-cross-origin"
    "Permissions-Policy"      = "camera=(), microphone=(), location=(), payment=()"
  }
}

# Upload styles.css with long cache time
resource "google_storage_bucket_object" "styles_css" {
  name   = "styles.css"
  bucket = google_storage_bucket.website_bucket.name
  source = "${var.website_source_dir}/styles.css"

  content_type = "text/css; charset=utf-8"
  
  # Long cache for CSS since it changes less frequently
  cache_control = "public, max-age=31536000, s-maxage=31536000, immutable"
  
  metadata = {
    "Cache-Control"          = "public, max-age=31536000, s-maxage=31536000, immutable"
    "X-Content-Type-Options" = "nosniff"
  }
}

# Upload script.js with long cache time
resource "google_storage_bucket_object" "script_js" {
  name   = "script.js"
  bucket = google_storage_bucket.website_bucket.name
  source = "${var.website_source_dir}/script.js"

  content_type = "application/javascript; charset=utf-8"
  
  # Long cache for JS since it changes less frequently
  cache_control = "public, max-age=31536000, s-maxage=31536000, immutable"
  
  metadata = {
    "Cache-Control"          = "public, max-age=31536000, s-maxage=31536000, immutable"
    "X-Content-Type-Options" = "nosniff"
  }
}

# Create Load Balancer for better performance and custom domain support
resource "google_compute_global_address" "website_ip" {
  count = var.enable_load_balancer ? 1 : 0
  name  = "vitae-website-ip"
}

# Backend bucket for Load Balancer
resource "google_compute_backend_bucket" "website_backend" {
  count       = var.enable_load_balancer ? 1 : 0
  name        = "vitae-website-backend"
  bucket_name = google_storage_bucket.website_bucket.name
  enable_cdn  = true

  cdn_policy {
    cache_mode                   = "CACHE_ALL_STATIC"
    default_ttl                  = 3600
    max_ttl                      = 86400
    negative_caching             = true
    negative_caching_policy {
      code = 404
      ttl  = 120
    }
    serve_while_stale = 86400
  }
}

# URL Map for Load Balancer
resource "google_compute_url_map" "website_map" {
  count           = var.enable_load_balancer ? 1 : 0
  name            = "vitae-website-map"
  default_service = google_compute_backend_bucket.website_backend[0].self_link
}

# HTTPS Target Proxy
resource "google_compute_target_https_proxy" "website_proxy" {
  count   = var.enable_load_balancer && var.enable_ssl ? 1 : 0
  name    = "vitae-website-proxy"
  url_map = google_compute_url_map.website_map[0].self_link
  
  ssl_certificates = var.domain_name != "" ? [google_compute_managed_ssl_certificate.website_ssl[0].self_link] : []
}

# HTTP Target Proxy (redirect to HTTPS)
resource "google_compute_target_http_proxy" "website_http_proxy" {
  count   = var.enable_load_balancer ? 1 : 0
  name    = "vitae-website-http-proxy"
  url_map = google_compute_url_map.website_redirect[0].self_link
}

# URL Map for HTTP to HTTPS redirect
resource "google_compute_url_map" "website_redirect" {
  count = var.enable_load_balancer ? 1 : 0
  name  = "vitae-website-redirect"

  default_url_redirect {
    https_redirect         = true
    redirect_response_code = "MOVED_PERMANENTLY_DEFAULT"
    strip_query            = false
  }
}

# Managed SSL Certificate
resource "google_compute_managed_ssl_certificate" "website_ssl" {
  count = var.enable_load_balancer && var.enable_ssl && var.domain_name != "" ? 1 : 0
  name  = "vitae-website-ssl"

  managed {
    domains = [trimsuffix(var.domain_name, ".")]
  }
}

# Global Forwarding Rule for HTTPS
resource "google_compute_global_forwarding_rule" "website_https_forwarding_rule" {
  count      = var.enable_load_balancer && var.enable_ssl ? 1 : 0
  name       = "vitae-website-https-forwarding-rule"
  target     = google_compute_target_https_proxy.website_proxy[0].self_link
  port_range = "443"
  ip_address = google_compute_global_address.website_ip[0].address
}

# Global Forwarding Rule for HTTP (redirect to HTTPS)
resource "google_compute_global_forwarding_rule" "website_http_forwarding_rule" {
  count      = var.enable_load_balancer ? 1 : 0
  name       = "vitae-website-http-forwarding-rule"
  target     = google_compute_target_http_proxy.website_http_proxy[0].self_link
  port_range = "80"
  ip_address = google_compute_global_address.website_ip[0].address
}

# Optional: Create a Cloud DNS managed zone if domain_name is provided
resource "google_dns_managed_zone" "website_zone" {
  count       = var.domain_name != "" && var.manage_dns ? 1 : 0
  name        = "vitae-website-zone"
  dns_name    = var.domain_name
  description = "DNS zone for Vitae website"
}

# Create A records pointing to Load Balancer IP (if using Load Balancer)
resource "google_dns_record_set" "website_a_records" {
  count        = var.domain_name != "" && var.manage_dns && var.enable_load_balancer ? 1 : 0
  name         = var.domain_name
  managed_zone = google_dns_managed_zone.website_zone[0].name
  type         = "A"
  ttl          = 300
  rrdatas      = [google_compute_global_address.website_ip[0].address]
}

# Create A records pointing to Google Storage IPs (if not using Load Balancer)
resource "google_dns_record_set" "website_storage_a_records" {
  count        = var.domain_name != "" && var.manage_dns && !var.enable_load_balancer ? 1 : 0
  name         = var.domain_name
  managed_zone = google_dns_managed_zone.website_zone[0].name
  type         = "A"
  ttl          = 300
  rrdatas      = [
    "216.239.32.21",
    "216.239.34.21",
    "216.239.36.21",
    "216.239.38.21"
  ]
}

