output "website_url" {
  description = "URL of the static website"
  value       = "https://storage.googleapis.com/${google_storage_bucket.website_bucket.name}/index.html"
}

output "bucket_name" {
  description = "Name of the created GCS bucket"
  value       = google_storage_bucket.website_bucket.name
}

output "bucket_url" {
  description = "GCS bucket URL"
  value       = google_storage_bucket.website_bucket.url
}

output "custom_domain_instructions" {
  description = "Instructions for setting up custom domain"
  value = var.domain_name != "" ? "Configure your domain's DNS to point to: c.storage.googleapis.com" : "No custom domain configured. Set domain_name variable to enable custom domain setup."
}

output "dns_name_servers" {
  description = "DNS name servers for the domain (if custom domain is configured)"
  value       = var.domain_name != "" ? google_dns_managed_zone.website_zone[0].name_servers : []
} 