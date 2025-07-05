# Terraform outputs for Google Cloud Run deployment

output "service_url" {
  description = "URL of the deployed Cloud Run service"
  value       = google_cloud_run_service.tax_calculator.status[0].url
  sensitive   = false
}

output "service_name" {
  description = "Name of the Cloud Run service"
  value       = google_cloud_run_service.tax_calculator.name
  sensitive   = false
}

output "service_location" {
  description = "Location of the Cloud Run service"
  value       = google_cloud_run_service.tax_calculator.location
  sensitive   = false
}

output "service_account_email" {
  description = "Email of the service account used by Cloud Run"
  value       = google_service_account.cloud_run_service.email
  sensitive   = false
}

output "container_image" {
  description = "Container image deployed to Cloud Run"
  value       = var.container_image
  sensitive   = false
}

output "project_id" {
  description = "GCP Project ID"
  value       = var.project_id
  sensitive   = false
}

output "region" {
  description = "GCP region where resources are deployed"
  value       = var.region
  sensitive   = false
}

# Optional outputs for custom domain
output "custom_domain_url" {
  description = "Custom domain URL (if configured)"
  value       = var.custom_domain != "" ? "https://${var.custom_domain}" : null
  sensitive   = false
}

output "load_balancer_ip" {
  description = "Load balancer IP address (if custom domain is configured)"
  value       = var.custom_domain != "" ? google_compute_global_address.lb_ip[0].address : null
  sensitive   = false
}

# Service configuration outputs
output "service_configuration" {
  description = "Service configuration details"
  value = {
    cpu_limit               = var.cpu_limit
    memory_limit           = var.memory_limit
    min_instances          = var.min_instances
    max_instances          = var.max_instances
    container_concurrency  = var.container_concurrency
    timeout_seconds        = var.timeout_seconds
  }
  sensitive = false
}

# Security outputs
output "service_account_unique_id" {
  description = "Unique ID of the service account"
  value       = google_service_account.cloud_run_service.unique_id
  sensitive   = false
}

# Cloud Build trigger outputs (if enabled)
output "cloud_build_trigger_id" {
  description = "ID of the Cloud Build trigger (if enabled)"
  value       = var.enable_cloud_build_trigger ? google_cloudbuild_trigger.deploy_trigger[0].id : null
  sensitive   = false
}

output "cloud_build_trigger_name" {
  description = "Name of the Cloud Build trigger (if enabled)"
  value       = var.enable_cloud_build_trigger ? google_cloudbuild_trigger.deploy_trigger[0].name : null
  sensitive   = false
}

# Environment information
output "environment" {
  description = "Environment name"
  value       = var.environment
  sensitive   = false
}

output "deployment_timestamp" {
  description = "Timestamp of the deployment"
  value       = timestamp()
  sensitive   = false
}

# Useful commands
output "useful_commands" {
  description = "Useful commands for managing the service"
  value = {
    view_logs = "gcloud logging read 'resource.type=cloud_run_revision AND resource.labels.service_name=${google_cloud_run_service.tax_calculator.name}' --limit 50 --format json"
    scale_service = "gcloud run services update ${google_cloud_run_service.tax_calculator.name} --region ${var.region} --min-instances=1 --max-instances=5"
    get_service_info = "gcloud run services describe ${google_cloud_run_service.tax_calculator.name} --region ${var.region}"
    deploy_new_image = "gcloud run deploy ${google_cloud_run_service.tax_calculator.name} --image gcr.io/${var.project_id}/tax-calculator:latest --region ${var.region}"
    view_metrics = "gcloud monitoring metrics list --filter='resource.type=cloud_run_revision'"
  }
  sensitive = false
}

# Resource URLs for management
output "resource_urls" {
  description = "URLs to view resources in Google Cloud Console"
  value = {
    cloud_run_service = "https://console.cloud.google.com/run/detail/${var.region}/${google_cloud_run_service.tax_calculator.name}/general?project=${var.project_id}"
    logs = "https://console.cloud.google.com/logs/query;query=resource.type%3D%22cloud_run_revision%22%0Aresource.labels.service_name%3D%22${google_cloud_run_service.tax_calculator.name}%22?project=${var.project_id}"
    metrics = "https://console.cloud.google.com/monitoring/dashboards/resourceList/cloud_run_revision?project=${var.project_id}"
    container_registry = "https://console.cloud.google.com/gcr/images/${var.project_id}?project=${var.project_id}"
  }
  sensitive = false
}