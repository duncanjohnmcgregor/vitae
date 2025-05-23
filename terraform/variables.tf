variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region"
  type        = string
  default     = "us-central1"
}

variable "bucket_name" {
  description = "Name of the GCS bucket for static website hosting"
  type        = string
  default     = ""
}

variable "domain_name" {
  description = "Custom domain name (optional, include trailing dot for DNS zone)"
  type        = string
  default     = ""
}

variable "website_source_dir" {
  description = "Directory containing website source files"
  type        = string
  default     = "../src"
}

variable "enable_load_balancer" {
  description = "Enable Google Cloud Load Balancer with CDN for better performance"
  type        = bool
  default     = true
}

variable "enable_ssl" {
  description = "Enable managed SSL certificate (requires domain_name and enable_load_balancer)"
  type        = bool
  default     = true
}

variable "manage_dns" {
  description = "Create and manage DNS zone for the domain"
  type        = bool
  default     = true
}

variable "enable_versioning" {
  description = "Enable object versioning in the storage bucket"
  type        = bool
  default     = false
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
} 