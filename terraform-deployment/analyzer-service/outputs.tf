# ==============================================================================
# Outputs for Analyzer Service Module
# ==============================================================================
# This file defines the outputs from the analyzer service module deployment.
# ==============================================================================

output "url" {
  description = "The URL of the deployed analyzer microservice"
  value       = google_cloud_run_service.analyzer_service.status[0].url
}

output "service_name" {
  description = "The name of the deployed Cloud Run service"
  value       = google_cloud_run_service.analyzer_service.name
}

output "service_account" {
  description = "The service account used by the analyzer microservice"
  value       = google_service_account.analyzer_service_account.email
}

output "latest_revision_name" {
  description = "The name of the latest revision of the analyzer service"
  value       = google_cloud_run_service.analyzer_service.status[0].latest_created_revision_name
}

# ==============================================================================
# Usage Instructions (for developers)
# ==============================================================================
# The analyzer service URL can be used as an API endpoint for document analysis.
# To update the analyzer service:
#
# 1. Build and push a new Docker image
# 2. Update the `image_url` variable with the new image URL
# 3. Run `terraform apply` to deploy the new version
#
# API Endpoints:
# - POST /analyze - Upload and analyze a document
# - GET /health - Health check endpoint
# ==============================================================================

