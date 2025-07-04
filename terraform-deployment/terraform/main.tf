# ==============================================================================
# Main Terraform Configuration for Tax BBB Cloud Deployment
# ==============================================================================
# This file orchestrates the deployment of both frontend and analyzer services
# to Google Cloud Run using modular Terraform configurations.
#
# Architecture:
# - Frontend: React/Vite app containerized and deployed to Cloud Run
# - Analyzer: Node.js/Python microservice for AI document analysis
# - Both services are publicly accessible and auto-scaling
# ==============================================================================

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }

  # Local backend for development - replace with remote backend for production
  # For GitHub Actions CI/CD, consider using:
  # backend "gcs" {
  #   bucket = "your-terraform-state-bucket"
  #   prefix = "terraform/state"
  # }
  backend "local" {
    path = "terraform.tfstate"
  }
}

# Configure the Google Cloud Provider
provider "google" {
  project = var.project_id
  region  = var.region
}

# Enable required Google Cloud APIs
resource "google_project_service" "cloud_run_api" {
  service = "run.googleapis.com"
  
  disable_dependent_services = true
  disable_on_destroy         = false
}

resource "google_project_service" "cloud_resource_manager_api" {
  service = "cloudresourcemanager.googleapis.com"
  
  disable_dependent_services = true
  disable_on_destroy         = false
}

resource "google_project_service" "iam_api" {
  service = "iam.googleapis.com"
  
  disable_dependent_services = true
  disable_on_destroy         = false
}

# ==============================================================================
# Frontend Module - React/Vite Tax Calculator UI
# ==============================================================================
module "frontend" {
  source = "../frontend"
  
  project_id = var.project_id
  region     = var.region
  image_url  = var.frontend_image_url
  
  # Ensure APIs are enabled before deploying services
  depends_on = [
    google_project_service.cloud_run_api,
    google_project_service.cloud_resource_manager_api,
    google_project_service.iam_api
  ]
}

# ==============================================================================
# Analyzer Service Module - AI Document Processing Microservice
# ==============================================================================
module "analyzer_service" {
  source = "../analyzer-service"
  
  project_id = var.project_id
  region     = var.region
  image_url  = var.analyzer_image_url
  
  # Ensure APIs are enabled before deploying services
  depends_on = [
    google_project_service.cloud_run_api,
    google_project_service.cloud_resource_manager_api,
    google_project_service.iam_api
  ]
}

# ==============================================================================
# GitHub Actions Integration Notes:
# ==============================================================================
# To integrate with GitHub Actions CI/CD:
#
# 1. Create a service account with necessary permissions:
#    - Cloud Run Admin
#    - Service Account User
#    - Storage Admin (if using GCS backend)
#
# 2. Generate and store service account key as GitHub secret: GCP_SA_KEY
#
# 3. Example GitHub Actions workflow step:
#    - name: Setup Terraform
#      uses: hashicorp/setup-terraform@v2
#    
#    - name: Authenticate to GCP
#      uses: google-github-actions/auth@v1
#      with:
#        credentials_json: ${{ secrets.GCP_SA_KEY }}
#    
#    - name: Terraform Plan
#      run: terraform plan -var="project_id=${{ secrets.GCP_PROJECT_ID }}"
#
# 4. Set up branch protection and require terraform plan on PRs
# ==============================================================================

