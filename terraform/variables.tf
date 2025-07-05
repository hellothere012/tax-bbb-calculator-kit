# Terraform variables for Google Cloud Run deployment

variable "project_id" {
  description = "The GCP project ID"
  type        = string
  default     = "tax-2025-calc"
}

variable "region" {
  description = "The GCP region for Cloud Run service"
  type        = string
  default     = "us-west1"
}

variable "service_name" {
  description = "Name of the Cloud Run service"
  type        = string
  default     = "tax-calculator-app"
}

variable "container_image" {
  description = "Container image to deploy"
  type        = string
  default     = "gcr.io/tax-2025-calc/tax-calculator:latest"
}

# Resource configuration
variable "cpu_limit" {
  description = "CPU limit for the container"
  type        = string
  default     = "1000m"
}

variable "memory_limit" {
  description = "Memory limit for the container"
  type        = string
  default     = "512Mi"
}

variable "cpu_request" {
  description = "CPU request for the container"
  type        = string
  default     = "100m"
}

variable "memory_request" {
  description = "Memory request for the container"
  type        = string
  default     = "128Mi"
}

# Scaling configuration
variable "min_instances" {
  description = "Minimum number of instances"
  type        = string
  default     = "0"
}

variable "max_instances" {
  description = "Maximum number of instances"
  type        = string
  default     = "10"
}

variable "container_concurrency" {
  description = "Maximum number of concurrent requests per container"
  type        = number
  default     = 80
}

variable "timeout_seconds" {
  description = "Request timeout in seconds"
  type        = number
  default     = 300
}

# Optional features
variable "enable_cloud_build_trigger" {
  description = "Enable Cloud Build trigger for CI/CD"
  type        = bool
  default     = false
}

variable "github_owner" {
  description = "GitHub repository owner (for Cloud Build trigger)"
  type        = string
  default     = ""
}

variable "github_repo" {
  description = "GitHub repository name (for Cloud Build trigger)"
  type        = string
  default     = ""
}

variable "custom_domain" {
  description = "Custom domain for the service"
  type        = string
  default     = ""
}

variable "enable_monitoring" {
  description = "Enable monitoring and alerting"
  type        = bool
  default     = false
}

variable "notification_channels" {
  description = "List of notification channels for alerts"
  type        = list(string)
  default     = []
}

# Environment-specific variables
variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "labels" {
  description = "Labels to apply to resources"
  type        = map(string)
  default = {
    app         = "tax-calculator"
    environment = "prod"
    managed-by  = "terraform"
  }
}

# Security configuration
variable "vpc_connector_name" {
  description = "VPC connector name for private networking"
  type        = string
  default     = ""
}

variable "cloudsql_connection_name" {
  description = "Cloud SQL connection name"
  type        = string
  default     = ""
}

variable "enable_vpc_access" {
  description = "Enable VPC access for the service"
  type        = bool
  default     = false
}

# Backup and disaster recovery
variable "enable_backup" {
  description = "Enable backup for the service"
  type        = bool
  default     = false
}

variable "backup_schedule" {
  description = "Backup schedule in cron format"
  type        = string
  default     = "0 2 * * *"
}

# Cost optimization
variable "enable_cost_optimization" {
  description = "Enable cost optimization features"
  type        = bool
  default     = true
}

variable "preemptible_instances" {
  description = "Use preemptible instances for cost savings"
  type        = bool
  default     = false
}