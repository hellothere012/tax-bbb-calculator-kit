# ==============================================================================
# Analyzer Service Module - AI Document Processing Microservice
# ==============================================================================
# This module deploys the Node.js/Python analyzer microservice to Google Cloud Run.
# The analyzer service processes tax documents and uses Gemini AI for analysis.
# ==============================================================================

# Cloud Run service for the analyzer microservice
resource "google_cloud_run_service" "analyzer_service" {
  name     = "tax-bbb-analyzer-service"
  location = var.region
  
  template {
    spec {
      containers {
        image = var.image_url
        
        # Environment variables for the analyzer service
        env {
          name  = "NODE_ENV"
          value = "production"
        }
        
        # Gemini AI API key (better to use Secret Manager in production)
        env {
          name  = "GEMINI_API_KEY"
          value = "placeholder-replace-with-secret-manager"
        }
        
        # Resource limits - higher for AI processing
        resources {
          limits = {
            cpu    = "2"
            memory = "1Gi"
          }
        }
        
        # Health check
        liveness_probe {
          http_get {
            path = "/health"
          }
          initial_delay_seconds = 10
          timeout_seconds       = 5
          period_seconds        = 15
          failure_threshold     = 3
        }
      }
      
      # Container concurrency (max simultaneous requests per container)
      container_concurrency = 50
      
      # Service account to run the service
      service_account_name = google_service_account.analyzer_service_account.email
      
      # Timeout for requests - longer for document processing
      timeout_seconds = 600
    }
    
    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = "0"
        "autoscaling.knative.dev/maxScale" = "10"
        # CPU always allocated for faster cold starts
        "run.googleapis.com/cpu-throttling" = "false"
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

# Create a dedicated service account for the analyzer service
resource "google_service_account" "analyzer_service_account" {
  account_id   = "tax-bbb-analyzer-sa"
  display_name = "Tax BBB Analyzer Service Account"
  description  = "Service account for the Tax BBB analyzer microservice"
}

# IAM policy to make the analyzer service publicly accessible
resource "google_cloud_run_service_iam_member" "analyzer_service_public" {
  location = google_cloud_run_service.analyzer_service.location
  service  = google_cloud_run_service.analyzer_service.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Grant the analyzer service access to Gemini AI API
resource "google_project_iam_member" "analyzer_gemini_access" {
  project = var.project_id
  role    = "roles/aiplatform.user"
  member  = "serviceAccount:${google_service_account.analyzer_service_account.email}"
}

# ==============================================================================
# Additional Resources (Uncomment as needed)
# ==============================================================================

# Cloud Storage bucket for document uploads
# resource "google_storage_bucket" "document_uploads" {
#   name     = "${var.project_id}-document-uploads"
#   location = var.region
#   
#   # Auto-delete files after 30 days
#   lifecycle_rule {
#     condition {
#       age = 30
#     }
#     action {
#       type = "Delete"
#     }
#   }
#   
#   # Encrypt bucket contents
#   encryption {
#     default_kms_key_name = google_kms_crypto_key.document_key.id
#   }
# }
# 
# # Grant the analyzer service access to the uploads bucket
# resource "google_storage_bucket_iam_member" "analyzer_storage_access" {
#   bucket = google_storage_bucket.document_uploads.name
#   role   = "roles/storage.objectAdmin"
#   member = "serviceAccount:${google_service_account.analyzer_service_account.email}"
# }

# Secret Manager for API keys and sensitive configuration
# resource "google_secret_manager_secret" "gemini_api_key" {
#   secret_id = "tax-bbb-gemini-api-key"
#   
#   replication {
#     automatic = true
#   }
# }
# 
# resource "google_secret_manager_secret_iam_member" "analyzer_secret_access" {
#   secret_id = google_secret_manager_secret.gemini_api_key.id
#   role      = "roles/secretmanager.secretAccessor"
#   member    = "serviceAccount:${google_service_account.analyzer_service_account.email}"
# }

