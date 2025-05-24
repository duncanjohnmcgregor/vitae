# Terraform tests for infrastructure validation
# Uses the native Terraform testing framework introduced in v1.6+

variables {
  project_id           = "test-project"
  region              = "us-central1"
  environment         = "test"
  website_source_dir  = "./test-src"
  bucket_name         = "test-bucket"
  enable_load_balancer = true
  enable_ssl          = true
  enable_versioning   = true
  domain_name         = ""
  manage_dns          = false
}

# Test basic bucket creation
run "bucket_creation" {
  command = plan

  assert {
    condition     = google_storage_bucket.website_bucket.location == "US-CENTRAL1"
    error_message = "Bucket should be created in the correct region"
  }

  assert {
    condition     = google_storage_bucket.website_bucket.uniform_bucket_level_access == true
    error_message = "Bucket should have uniform bucket-level access enabled"
  }

  assert {
    condition     = length(google_storage_bucket.website_bucket.cors) > 0
    error_message = "Bucket should have CORS configuration"
  }

  assert {
    condition     = google_storage_bucket.website_bucket.versioning[0].enabled == true
    error_message = "Bucket versioning should be enabled when specified"
  }
}

# Test bucket naming with random suffix
run "bucket_naming" {
  command = plan

  assert {
    condition     = can(regex("^test-bucket$", google_storage_bucket.website_bucket.name))
    error_message = "Bucket name should use the provided bucket_name when specified"
  }
}

# Test bucket website configuration
run "bucket_website_config" {
  command = plan

  assert {
    condition     = google_storage_bucket.website_bucket.website[0].main_page_suffix == "index.html"
    error_message = "Bucket should be configured for static website hosting with index.html"
  }

  assert {
    condition     = google_storage_bucket.website_bucket.website[0].not_found_page == "index.html"
    error_message = "Bucket should use index.html for 404 pages (SPA routing)"
  }
}

# Test public access configuration
run "bucket_public_access" {
  command = plan

  assert {
    condition     = google_storage_bucket_iam_member.public_read.role == "roles/storage.objectViewer"
    error_message = "Bucket should have public read access configured"
  }

  assert {
    condition     = google_storage_bucket_iam_member.public_read.member == "allUsers"
    error_message = "Public access should be granted to all users"
  }
}

# Test static file uploads
run "static_file_uploads" {
  command = plan

  assert {
    condition     = google_storage_bucket_object.index_html.content_type == "text/html; charset=utf-8"
    error_message = "index.html should have correct content type"
  }

  assert {
    condition     = google_storage_bucket_object.styles_css.content_type == "text/css; charset=utf-8"
    error_message = "styles.css should have correct content type"
  }

  assert {
    condition     = google_storage_bucket_object.script_js.content_type == "application/javascript; charset=utf-8"
    error_message = "script.js should have correct content type"
  }
}

# Test cache control headers
run "cache_control_validation" {
  command = plan

  assert {
    condition     = can(regex("max-age=300", google_storage_bucket_object.index_html.cache_control))
    error_message = "HTML files should have short cache duration"
  }

  assert {
    condition     = can(regex("max-age=31536000", google_storage_bucket_object.styles_css.cache_control))
    error_message = "CSS files should have long cache duration"
  }

  assert {
    condition     = can(regex("max-age=31536000", google_storage_bucket_object.script_js.cache_control))
    error_message = "JS files should have long cache duration"
  }
}

# Test security headers
run "security_headers_validation" {
  command = plan

  assert {
    condition     = google_storage_bucket_object.index_html.metadata["X-Content-Type-Options"] == "nosniff"
    error_message = "HTML files should have security headers set"
  }

  assert {
    condition     = google_storage_bucket_object.index_html.metadata["X-Frame-Options"] == "DENY"
    error_message = "HTML files should prevent framing"
  }

  assert {
    condition     = google_storage_bucket_object.index_html.metadata["X-XSS-Protection"] == "1; mode=block"
    error_message = "HTML files should have XSS protection enabled"
  }
}

# Test load balancer configuration (when enabled)
run "load_balancer_configuration" {
  command = plan

  variables {
    enable_load_balancer = true
  }

  assert {
    condition     = length(google_compute_global_address.website_ip) == 1
    error_message = "Load balancer should create a global IP address when enabled"
  }

  assert {
    condition     = length(google_compute_backend_bucket.website_backend) == 1
    error_message = "Load balancer should create a backend bucket when enabled"
  }

  assert {
    condition     = google_compute_backend_bucket.website_backend[0].enable_cdn == true
    error_message = "Backend bucket should have CDN enabled"
  }
}

# Test CDN configuration
run "cdn_configuration" {
  command = plan

  variables {
    enable_load_balancer = true
  }

  assert {
    condition     = google_compute_backend_bucket.website_backend[0].cdn_policy[0].cache_mode == "CACHE_ALL_STATIC"
    error_message = "CDN should cache all static content"
  }

  assert {
    condition     = google_compute_backend_bucket.website_backend[0].cdn_policy[0].default_ttl == 3600
    error_message = "CDN should have appropriate default TTL"
  }

  assert {
    condition     = google_compute_backend_bucket.website_backend[0].cdn_policy[0].negative_caching == true
    error_message = "CDN should cache negative responses"
  }
}

# Test SSL configuration (when enabled)
run "ssl_configuration" {
  command = plan

  variables {
    enable_load_balancer = true
    enable_ssl          = true
    domain_name         = "example.com"
  }

  assert {
    condition     = length(google_compute_managed_ssl_certificate.website_ssl) == 1
    error_message = "SSL certificate should be created when SSL is enabled with domain"
  }

  assert {
    condition     = length(google_compute_target_https_proxy.website_proxy) == 1
    error_message = "HTTPS proxy should be created when SSL is enabled"
  }
}

# Test HTTP to HTTPS redirect
run "http_redirect_configuration" {
  command = plan

  variables {
    enable_load_balancer = true
  }

  assert {
    condition     = length(google_compute_url_map.website_redirect) == 1
    error_message = "HTTP redirect should be configured when load balancer is enabled"
  }

  assert {
    condition     = google_compute_url_map.website_redirect[0].default_url_redirect[0].https_redirect == true
    error_message = "HTTP should redirect to HTTPS"
  }

  assert {
    condition     = google_compute_url_map.website_redirect[0].default_url_redirect[0].redirect_response_code == "MOVED_PERMANENTLY_DEFAULT"
    error_message = "HTTP redirect should use 301 status code"
  }
}

# Test forwarding rules
run "forwarding_rules_configuration" {
  command = plan

  variables {
    enable_load_balancer = true
    enable_ssl          = true
  }

  assert {
    condition     = length(google_compute_global_forwarding_rule.website_https_forwarding_rule) == 1
    error_message = "HTTPS forwarding rule should be created when SSL is enabled"
  }

  assert {
    condition     = google_compute_global_forwarding_rule.website_https_forwarding_rule[0].port_range == "443"
    error_message = "HTTPS forwarding rule should use port 443"
  }

  assert {
    condition     = length(google_compute_global_forwarding_rule.website_http_forwarding_rule) == 1
    error_message = "HTTP forwarding rule should be created for redirect"
  }

  assert {
    condition     = google_compute_global_forwarding_rule.website_http_forwarding_rule[0].port_range == "80"
    error_message = "HTTP forwarding rule should use port 80"
  }
}

# Test DNS configuration (when enabled)
run "dns_configuration" {
  command = plan

  variables {
    domain_name         = "example.com"
    manage_dns          = true
    enable_load_balancer = true
  }

  assert {
    condition     = length(google_dns_managed_zone.website_zone) == 1
    error_message = "DNS zone should be created when DNS management is enabled"
  }

  assert {
    condition     = google_dns_managed_zone.website_zone[0].dns_name == "example.com"
    error_message = "DNS zone should have correct domain name"
  }

  assert {
    condition     = length(google_dns_record_set.website_a_records) == 1
    error_message = "A records should be created when using load balancer with DNS"
  }
}

# Test minimal configuration (no load balancer)
run "minimal_configuration" {
  command = plan

  variables {
    enable_load_balancer = false
    enable_ssl          = false
    domain_name         = ""
    manage_dns          = false
  }

  assert {
    condition     = length(google_compute_global_address.website_ip) == 0
    error_message = "No global IP should be created when load balancer is disabled"
  }

  assert {
    condition     = length(google_compute_backend_bucket.website_backend) == 0
    error_message = "No backend bucket should be created when load balancer is disabled"
  }

  assert {
    condition     = length(google_compute_managed_ssl_certificate.website_ssl) == 0
    error_message = "No SSL certificate should be created when SSL is disabled"
  }

  assert {
    condition     = length(google_dns_managed_zone.website_zone) == 0
    error_message = "No DNS zone should be created when domain is not specified"
  }
}

# Test variable validation
run "variable_validation" {
  command = plan

  variables {
    project_id = ""
  }

  expect_failures = [
    var.project_id
  ]
}

# Test resource naming consistency
run "resource_naming_consistency" {
  command = plan

  assert {
    condition = can(regex("^vitae-", google_compute_global_address.website_ip[0].name))
    error_message = "Global IP should follow naming convention"
  }

  assert {
    condition = can(regex("^vitae-", google_compute_backend_bucket.website_backend[0].name))
    error_message = "Backend bucket should follow naming convention"
  }

  assert {
    condition = can(regex("^vitae-", google_compute_url_map.website_map[0].name))
    error_message = "URL map should follow naming convention"
  }
}

# Test lifecycle management
run "lifecycle_configuration" {
  command = plan

  assert {
    condition     = google_storage_bucket.website_bucket.force_destroy == true
    error_message = "Bucket should allow force destroy for test environments"
  }

  assert {
    condition     = length(google_storage_bucket.website_bucket.lifecycle_rule) > 0
    error_message = "Bucket should have lifecycle rules configured"
  }

  assert {
    condition     = google_storage_bucket.website_bucket.lifecycle_rule[0].condition[0].age == 30
    error_message = "Lifecycle rule should delete objects after 30 days"
  }
} 