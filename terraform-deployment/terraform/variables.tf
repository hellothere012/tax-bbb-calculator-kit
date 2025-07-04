# ==============================================================================
# Global Variables for Tax BBB Cloud Deployment
# ==============================================================================
# This file defines the variables used across the entire deployment.
# These variables are passed to the child modules for frontend and analyzer.
# ==============================================================================

variable "project_id" {
  description = "The Google Cloud Project ID where resources will be deployed"
  type        = string
}

variable "region" {
  description = "The Google Cloud region where resources will be deployed"
  type        = string
  default     = "us-west1"
}

variable "frontend_image_url" {
  description = "The URL of the Docker image for the frontend application (e.g., gcr.io/project-id/frontend:latest)"
  type        = string
}

variable "analyzer_image_url" {
  description = "The URL of the Docker image for the analyzer microservice (e.g., gcr.io/project-id/analyzer:latest)"
  type        = string
}

# ==============================================================================
# Optional Variables (Uncomment and modify as needed)
# ==============================================================================

# variable "environment" {
#   description = "Deployment environment (e.g., dev, staging, prod)"
#   type        = string
#   default     = "dev"
# }

# variable "frontend_memory_limit" {
#   description = "Memory limit for the frontend Cloud Run service"
#   type        = string
#   default     = "512Mi"
# }

# variable "analyzer_memory_limit" {
#   description = "Memory limit for the analyzer Cloud Run service"
#   type        = string
#   default     = "1Gi"  # Higher memory for AI processing
# }

# variable "frontend_cpu_limit" {
#   description = "CPU limit for the frontend Cloud Run service"
#   type        = number
#   default     = 1
# }

# variable "analyzer_cpu_limit" {
#   description = "CPU limit for the analyzer Cloud Run service"
#   type        = number
#   default     = 2  # Higher CPU for AI processing
# }

# variable "min_instances" {
#   description = "Minimum number of instances for Cloud Run services"
#   type        = number
#   default     = 0
# }

# variable "max_instances" {
#   description = "Maximum number of instances for Cloud Run services"
#   type        = number
#   default     = 10
# }

