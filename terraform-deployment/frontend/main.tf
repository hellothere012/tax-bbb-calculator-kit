# ==============================================================================
# Frontend Module - Tax BBB Calculator UI
# ==============================================================================
# This module deploys the React/Vite frontend application to Google Cloud Run.
# The frontend provides the user interface for the tax savings calculator.
# ==============================================================================

# Cloud Run service for the frontend application
resource "google_cloud_run_service" "frontend" {
  name     = "tax-bbb-frontend"
  location = var.region
  
  template {
    spec {
      containers {
        image = var.image_url
        
        # Environment variables for the frontend
        env {
          name  = "NODE_ENV"
          value = "production"
        }
        
        # Optional: Configure the analyzer service URL as an environment variable
        # env {
        #   name  = "VITE_ANALYZER_API_URL"
        #   value = "https://tax-bbb-analyzer-service-xxxx-uc.a.run.app"
        # }
        
        # Resource limits
        resources {
          limits = {
            cpu    = "1"
            memory = "512Mi"
          }
        }
        
        # Health checks
        startup_probe {
          http_get {
            path = "/"
          }
          initial_delay_seconds = 10
          timeout_seconds       = 3
          period_seconds        = 5
          failure_threshold     = 3
        }
      }
      
      # Container concurrency (max simultaneous requests per container)
      container_concurrency = 80
      
      # Service account to run the service
      service_account_name = google_service_account.frontend_service_account.email
      
      # Timeout for requests
      timeout_seconds = 300
    }
    
    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = "0"
        "autoscaling.knative.dev/maxScale" = "10"
      }
    }
  }
  
  # Traffic configuration (100% to latest revision)
  traffic {
    percent         = 100
    latest_revision = true
  }
  
  # Auto-generate revision name
  autogenerate_revision_name = true
}

# Create a dedicated service account for the frontend
resource "google_service_account" "frontend_service_account" {
  account_id   = "tax-bbb-frontend-sa"
  display_name = "Tax BBB Frontend Service Account"
  description  = "Service account for the Tax BBB frontend application"
}

# IAM policy to make the frontend publicly accessible
resource "google_cloud_run_service_iam_member" "frontend_public" {
  location = google_cloud_run_service.frontend.location
  service  = google_cloud_run_service.frontend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Optional: Custom domain mapping
# resource "google_cloud_run_domain_mapping" "frontend_domain" {
#   location = var.region
#   name     = "tax-calculator.yourdomain.com"
#   
#   metadata {
#     namespace = var.project_id
#   }
#   
#   spec {
#     route_name = google_cloud_run_service.frontend.name
#   }
# }

# ==============================================================================
# Additional Resources (Uncomment as needed)
# ==============================================================================

# Cloud CDN for static assets
# resource "google_compute_backend_bucket" "frontend_assets" {
#   name        = "tax-bbb-frontend-assets"
#   bucket_name = google_storage_bucket.frontend_assets.name
#   enable_cdn  = true
# }
# 
# resource "google_storage_bucket" "frontend_assets" {
#   name     = "${var.project_id}-frontend-assets"
#   location = var.region
# }

# Secret Manager for sensitive configuration
# resource "google_secret_manager_secret" "frontend_config" {
#   secret_id = "tax-bbb-frontend-config"
#   
#   replication {
#     automatic = true
#   }
# }
# 
# resource "google_secret_manager_secret_iam_member" "frontend_secret_access" {
#   secret_id = google_secret_manager_secret.frontend_config.id
#   role      = "roles/secretmanager.secretAccessor"
#   member    = "serviceAccount:${google_service_account.frontend_service_account.email}"
# }

