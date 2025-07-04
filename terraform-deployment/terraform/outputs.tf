# ==============================================================================
# Outputs for Tax BBB Cloud Deployment
# ==============================================================================
# This file defines the outputs from the deployment, including URLs for
# accessing the deployed services.
# ==============================================================================

output "frontend_url" {
  description = "The URL of the deployed frontend application"
  value       = module.frontend.url
}

output "analyzer_service_url" {
  description = "The URL of the deployed analyzer microservice"
  value       = module.analyzer_service.url
}

# Additional useful outputs
output "project_id" {
  description = "The Google Cloud Project ID where resources are deployed"
  value       = var.project_id
}

output "region" {
  description = "The Google Cloud region where resources are deployed"
  value       = var.region
}

# ==============================================================================
# Usage Instructions (for developers)
# ==============================================================================
# After deployment, you can access:
#
# 1. The frontend application at the URL provided by `frontend_url`
# 2. The analyzer microservice at the URL provided by `analyzer_service_url`
#
# To connect the frontend to the analyzer service, configure the frontend
# with the analyzer service URL as an environment variable or API endpoint.
# ==============================================================================

