#!/bin/bash

# Vitae Website Deployment Script
# This script automates the deployment of the Vitae landing page using Terraform

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if required tools are installed
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v terraform &> /dev/null; then
        print_error "Terraform is not installed. Please install Terraform first."
        exit 1
    fi
    
    if ! command -v gcloud &> /dev/null; then
        print_error "Google Cloud CLI is not installed. Please install gcloud first."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to validate terraform files
validate_terraform() {
    print_status "Validating Terraform configuration..."
    
    if ! terraform validate; then
        print_error "Terraform validation failed"
        exit 1
    fi
    
    print_success "Terraform validation passed"
}

# Function to check Google Cloud authentication
check_gcloud_auth() {
    print_status "Checking Google Cloud authentication..."
    
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n1 > /dev/null; then
        print_error "You are not authenticated with Google Cloud. Please run 'gcloud auth login'"
        exit 1
    fi
    
    local account=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n1)
    print_success "Authenticated as: $account"
}

# Function to set the correct GCP project
set_gcp_project() {
    local project_id=$(grep '^project_id' terraform.tfvars | cut -d'"' -f2)
    
    if [ -z "$project_id" ]; then
        print_error "Project ID not found in terraform.tfvars"
        exit 1
    fi
    
    print_status "Setting GCP project to: $project_id"
    gcloud config set project "$project_id"
    
    print_success "GCP project set successfully"
}

# Function to enable required APIs
enable_apis() {
    print_status "Enabling required Google Cloud APIs..."
    
    gcloud services enable compute.googleapis.com
    gcloud services enable storage.googleapis.com
    gcloud services enable dns.googleapis.com
    gcloud services enable certificatemanager.googleapis.com
    
    print_success "Required APIs enabled"
}

# Function to initialize Terraform
init_terraform() {
    print_status "Initializing Terraform..."
    
    terraform init
    
    print_success "Terraform initialized"
}

# Function to plan deployment
plan_deployment() {
    print_status "Planning Terraform deployment..."
    
    terraform plan -out=tfplan
    
    print_success "Terraform plan completed"
}

# Function to apply deployment
apply_deployment() {
    print_status "Applying Terraform deployment..."
    
    terraform apply tfplan
    
    print_success "Terraform deployment completed"
}

# Function to show deployment outputs
show_outputs() {
    print_status "Deployment Summary:"
    echo
    
    terraform output -json | jq -r '
        .deployment_summary.value | 
        "Environment: \(.environment)",
        "Domain: \(.domain)",
        "Load Balancer: \(.load_balancer)",
        "SSL Enabled: \(.ssl_enabled)",
        "CDN Enabled: \(.cdn_enabled)", 
        "DNS Managed: \(.dns_managed)",
        "Primary URL: \(.primary_url)"
    '
    
    echo
    print_success "You can view all outputs with: terraform output"
}

# Function to cleanup plan file
cleanup() {
    if [ -f "tfplan" ]; then
        rm tfplan
    fi
}

# Main deployment function
main() {
    echo "🚀 Vitae Website Deployment Script"
    echo "=================================="
    echo
    
    # Change to terraform directory if not already there
    if [ ! -f "main.tf" ]; then
        if [ -d "terraform" ]; then
            cd terraform
        else
            print_error "Terraform files not found. Please run this script from the project root or terraform directory."
            exit 1
        fi
    fi
    
    # Check if terraform.tfvars exists
    if [ ! -f "terraform.tfvars" ]; then
        print_error "terraform.tfvars file not found. Please create it with your configuration."
        exit 1
    fi
    
    # Run deployment steps
    check_prerequisites
    validate_terraform
    check_gcloud_auth
    set_gcp_project
    enable_apis
    init_terraform
    plan_deployment
    
    # Ask for confirmation before applying
    echo
    print_warning "Review the plan above. Do you want to apply these changes? (y/N)"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        apply_deployment
        show_outputs
        
        echo
        print_success "🎉 Deployment completed successfully!"
        print_status "Your modernized Vitae landing page is now live!"
        
        # Show SSL certificate note if applicable
        if grep -q 'enable_ssl = true' terraform.tfvars && grep -q 'domain_name = ' terraform.tfvars; then
            echo
            print_warning "Note: SSL certificate provisioning may take 10-60 minutes."
            print_status "You can check the status with: gcloud compute ssl-certificates list"
        fi
        
    else
        print_status "Deployment cancelled by user"
    fi
    
    cleanup
}

# Handle script interruption
trap cleanup EXIT

# Run main function
main "$@" 