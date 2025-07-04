# ==============================================================================
# Variables for Frontend Module
# ==============================================================================
# This file defines the variables specific to the frontend deployment.
# These variables are passed from the parent module.
# ==============================================================================

variable "project_id" {
  description = "The Google Cloud Project ID where resources will be deployed"
  type        = string
}

variable "region" {
  description = "The Google Cloud region where resources will be deployed"
  type        = string
}

variable "image_url" {
  description = "The URL of the Docker image for the frontend application"
  type        = string
}

# ==============================================================================
# Optional Variables (Uncomment and modify as needed)
# ==============================================================================

# variable "service_name" {
#   description = "Name of the Cloud Run service for the frontend"
#   type        = string
#   default     = "tax-bbb-frontend"
# }

# variable "memory_limit" {
#   description = "Memory limit for the frontend Cloud Run service"
#   type        = string
#   default     = "512Mi"
# }

# variable "cpu_limit" {
#   description = "CPU limit for the frontend Cloud Run service"
#   type        = number
#   default     = 1
# }

# variable "min_instances" {
#   description = "Minimum number of instances for the frontend Cloud Run service"
#   type        = number
#   default     = 0
# }

# variable "max_instances" {
#   description = "Maximum number of instances for the frontend Cloud Run service"
#   type        = number
#   default     = 10
# }

# variable "container_concurrency" {
#   description = "Maximum number of concurrent requests per container instance"
#   type        = number
#   default     = 80
# }

# variable "timeout_seconds" {
#   description = "Maximum time a request can take before timing out"
#   type        = number
#   default     = 300
# }

