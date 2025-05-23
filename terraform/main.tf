# Generate a random suffix for bucket name to ensure uniqueness
resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# Local values for computed names
locals {
  bucket_name = var.bucket_name != "" ? var.bucket_name : "vitae-website-${random_id.bucket_suffix.hex}"
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

  # CORS configuration for web assets
  cors {
    origin          = ["*"]
    method          = ["GET", "HEAD"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}

# Make the bucket publicly readable
resource "google_storage_bucket_iam_member" "public_read" {
  bucket = google_storage_bucket.website_bucket.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

# Upload website files to the bucket
resource "google_storage_bucket_object" "index_html" {
  name   = "index.html"
  bucket = google_storage_bucket.website_bucket.name
  source = "${var.website_source_dir}/index.html"

  # Set content type
  content_type = "text/html"

  # Cache control
  cache_control = "public, max-age=3600"
}

resource "google_storage_bucket_object" "styles_css" {
  name   = "styles.css"
  bucket = google_storage_bucket.website_bucket.name
  source = "${var.website_source_dir}/styles.css"

  # Set content type
  content_type = "text/css"

  # Cache control for CSS (longer cache time)
  cache_control = "public, max-age=86400"
}

resource "google_storage_bucket_object" "script_js" {
  name   = "script.js"
  bucket = google_storage_bucket.website_bucket.name
  source = "${var.website_source_dir}/script.js"

  # Set content type
  content_type = "application/javascript"

  # Cache control for JS (longer cache time)
  cache_control = "public, max-age=86400"
}

# Optional: Create a Cloud DNS managed zone if domain_name is provided
resource "google_dns_managed_zone" "website_zone" {
  count       = var.domain_name != "" ? 1 : 0
  name        = "vitae-website-zone"
  dns_name    = "${var.domain_name}."
  description = "DNS zone for Vitae website"
}

# Optional: Create DNS record pointing to the bucket
resource "google_dns_record_set" "website_cname" {
  count        = var.domain_name != "" ? 1 : 0
  name         = var.domain_name
  managed_zone = google_dns_managed_zone.website_zone[0].name
  type         = "CNAME"
  ttl          = 300
  rrdatas      = ["c.storage.googleapis.com."]
} 