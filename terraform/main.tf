# Terraform configuration for Google Cloud Run deployment
terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
  
  # Optional: Configure remote state storage
  # backend "gcs" {
  #   bucket = "your-terraform-state-bucket"
  #   prefix = "tax-calculator/state"
  # }
}

# Configure the Google Cloud Provider
provider "google" {
  project = var.project_id
  region  = var.region
}

# Enable required APIs
resource "google_project_service" "cloud_run_api" {
  service = "run.googleapis.com"
  
  disable_dependent_services = true
  disable_on_destroy         = false
}

resource "google_project_service" "container_registry_api" {
  service = "containerregistry.googleapis.com"
  
  disable_dependent_services = true
  disable_on_destroy         = false
}

resource "google_project_service" "cloud_build_api" {
  service = "cloudbuild.googleapis.com"
  
  disable_dependent_services = true
  disable_on_destroy         = false
}

# Cloud Run service
resource "google_cloud_run_service" "tax_calculator" {
  name     = var.service_name
  location = var.region
  
  depends_on = [google_project_service.cloud_run_api]
  
  template {
    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale" = var.max_instances
        "autoscaling.knative.dev/minScale" = var.min_instances
        "run.googleapis.com/cpu-throttling" = "false"
        "run.googleapis.com/execution-environment" = "gen2"
      }
    }
    
    spec {
      container_concurrency = var.container_concurrency
      timeout_seconds      = var.timeout_seconds
      
      containers {
        image = var.container_image
        
        ports {
          name           = "http1"
          container_port = 8080
          protocol       = "TCP"
        }
        
        resources {
          limits = {
            cpu    = var.cpu_limit
            memory = var.memory_limit
          }
          requests = {
            cpu    = var.cpu_request
            memory = var.memory_request
          }
        }
        
        # Environment variables
        env {
          name  = "NODE_ENV"
          value = "production"
        }
        
        env {
          name  = "PORT"
          value = "8080"
        }
        
        # Health check configuration
        startup_probe {
          http_get {
            path = "/health"
            port = 8080
          }
          initial_delay_seconds = 10
          timeout_seconds      = 3
          period_seconds       = 10
          failure_threshold    = 3
        }
        
        liveness_probe {
          http_get {
            path = "/health"
            port = 8080
          }
          initial_delay_seconds = 30
          timeout_seconds      = 3
          period_seconds       = 30
          failure_threshold    = 3
        }
      }
      
      service_account_name = google_service_account.cloud_run_service.email
    }
  }
  
  traffic {
    percent         = 100
    latest_revision = true
  }
  
  lifecycle {
    ignore_changes = [
      template[0].metadata[0].annotations["run.googleapis.com/operation-id"],
      template[0].metadata[0].annotations["serving.knative.dev/creator"],
      template[0].metadata[0].annotations["serving.knative.dev/lastModifier"],
      template[0].metadata[0].annotations["client.knative.dev/user-image"],
    ]
  }
}

# Service account for Cloud Run
resource "google_service_account" "cloud_run_service" {
  account_id   = "${var.service_name}-sa"
  display_name = "Service Account for ${var.service_name}"
  description  = "Service account used by the Tax Calculator Cloud Run service"
}

# IAM binding for Cloud Run service account
resource "google_project_iam_member" "cloud_run_service_account" {
  project = var.project_id
  role    = "roles/run.serviceAgent"
  member  = "serviceAccount:${google_service_account.cloud_run_service.email}"
}

# Allow public access to the Cloud Run service
data "google_iam_policy" "public_access" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}

resource "google_cloud_run_service_iam_policy" "public_access" {
  location    = google_cloud_run_service.tax_calculator.location
  project     = google_cloud_run_service.tax_calculator.project
  service     = google_cloud_run_service.tax_calculator.name
  policy_data = data.google_iam_policy.public_access.policy_data
}

# Optional: Cloud Build trigger for CI/CD
resource "google_cloudbuild_trigger" "deploy_trigger" {
  count = var.enable_cloud_build_trigger ? 1 : 0
  
  name        = "${var.service_name}-deploy"
  description = "Deploy ${var.service_name} on push to main branch"
  
  github {
    owner = var.github_owner
    name  = var.github_repo
    push {
      branch = "^main$"
    }
  }
  
  build {
    step {
      name = "gcr.io/cloud-builders/docker"
      args = [
        "build",
        "-t", "gcr.io/${var.project_id}/${var.service_name}:$COMMIT_SHA",
        "-t", "gcr.io/${var.project_id}/${var.service_name}:latest",
        "."
      ]
    }
    
    step {
      name = "gcr.io/cloud-builders/docker"
      args = [
        "push",
        "gcr.io/${var.project_id}/${var.service_name}:$COMMIT_SHA"
      ]
    }
    
    step {
      name = "gcr.io/cloud-builders/docker"
      args = [
        "push",
        "gcr.io/${var.project_id}/${var.service_name}:latest"
      ]
    }
    
    step {
      name = "gcr.io/google.com/cloudsdktool/cloud-sdk"
      entrypoint = "gcloud"
      args = [
        "run", "deploy", var.service_name,
        "--image", "gcr.io/${var.project_id}/${var.service_name}:$COMMIT_SHA",
        "--region", var.region,
        "--platform", "managed",
        "--allow-unauthenticated"
      ]
    }
  }
  
  depends_on = [
    google_project_service.cloud_build_api,
    google_project_service.cloud_run_api,
    google_project_service.container_registry_api
  ]
}

# Optional: Custom domain mapping
resource "google_cloud_run_domain_mapping" "custom_domain" {
  count = var.custom_domain != "" ? 1 : 0
  
  location = var.region
  name     = var.custom_domain
  
  metadata {
    namespace = var.project_id
  }
  
  spec {
    route_name = google_cloud_run_service.tax_calculator.name
  }
}

# Optional: Load balancer for custom domain with SSL
resource "google_compute_global_address" "lb_ip" {
  count = var.custom_domain != "" ? 1 : 0
  name  = "${var.service_name}-lb-ip"
}

resource "google_compute_managed_ssl_certificate" "ssl_cert" {
  count = var.custom_domain != "" ? 1 : 0
  name  = "${var.service_name}-ssl-cert"
  
  managed {
    domains = [var.custom_domain]
  }
}

# Optional: Monitoring and alerting
resource "google_monitoring_alert_policy" "high_error_rate" {
  count        = var.enable_monitoring ? 1 : 0
  display_name = "${var.service_name} High Error Rate"
  combiner     = "OR"
  
  conditions {
    display_name = "High 5xx error rate"
    
    condition_threshold {
      filter          = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"${var.service_name}\""
      comparison      = "COMPARISON_GT"
      threshold_value = 0.05
      duration        = "300s"
      
      aggregations {
        alignment_period   = "300s"
        per_series_aligner = "ALIGN_RATE"
      }
    }
  }
  
  notification_channels = var.notification_channels
  
  alert_strategy {
    auto_close = "86400s"
  }
}