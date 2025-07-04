# ==============================================================================
# Outputs for Frontend Module
# ==============================================================================
# This file defines the outputs from the frontend module deployment.
# ==============================================================================

output "url" {
  description = "The URL of the deployed frontend application"
  value       = google_cloud_run_service.frontend.status[0].url
}

output "service_name" {
  description = "The name of the deployed Cloud Run service"
  value       = google_cloud_run_service.frontend.name
}

output "service_account" {
  description = "The service account used by the frontend application"
  value       = google_service_account.frontend_service_account.email
}

output "latest_revision_name" {
  description = "The name of the latest revision of the frontend service"
  value       = google_cloud_run_service.frontend.status[0].latest_created_revision_name
}

# ==============================================================================
# Usage Instructions (for developers)
# ==============================================================================
# The frontend URL can be used to access the deployed application.
# To update the frontend:
#
# 1. Build and push a new Docker image
# 2. Update the `image_url` variable with the new image URL
# 3. Run `terraform apply` to deploy the new version
# ==============================================================================

