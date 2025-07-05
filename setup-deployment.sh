#!/bin/bash

# Tax Calculator 2025 - Google Cloud Deployment Setup
# This script collects all required values and deploys the application

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration file
CONFIG_FILE=".deployment-config"

print_header() {
    echo -e "${BLUE}=================================================${NC}"
    echo -e "${BLUE}  Tax Calculator 2025 - Deployment Setup${NC}"
    echo -e "${BLUE}=================================================${NC}"
}

print_step() {
    echo -e "${GREEN}[STEP]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_help() {
    echo -e "${CYAN}[HELP]${NC} $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to validate email format
validate_email() {
    local email=$1
    if [[ $email =~ ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]]; then
        return 0
    else
        return 1
    fi
}

# Function to validate project ID format
validate_project_id() {
    local project_id=$1
    if [[ $project_id =~ ^[a-z][a-z0-9-]{4,28}$ ]]; then
        return 0
    else
        return 1
    fi
}

# Function to check dependencies
check_dependencies() {
    print_step "Checking deployment dependencies..."
    
    local missing_deps=()
    
    if ! command_exists gcloud; then
        missing_deps+=("Google Cloud SDK (gcloud)")
    fi
    
    if ! command_exists terraform; then
        missing_deps+=("Terraform")
    fi
    
    if ! command_exists docker; then
        missing_deps+=("Docker")
    fi
    
    if ! command_exists git; then
        missing_deps+=("Git")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing required dependencies:"
        for dep in "${missing_deps[@]}"; do
            echo "  - $dep"
        done
        echo
        print_info "Installation instructions:"
        echo "  - Google Cloud SDK: https://cloud.google.com/sdk/docs/install"
        echo "  - Terraform: https://www.terraform.io/downloads"
        echo "  - Docker: https://docs.docker.com/get-docker/"
        echo "  - Git: https://git-scm.com/downloads"
        exit 1
    fi
    
    print_success "All dependencies are installed ✅"
}

# Function to check Google Cloud authentication
check_gcloud_auth() {
    print_step "Checking Google Cloud authentication..."
    
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
        print_warning "Not authenticated with Google Cloud"
        print_info "Please run: gcloud auth login"
        print_info "Then run this script again."
        exit 1
    fi
    
    local current_account=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -1)
    print_success "Authenticated as: $current_account ✅"
}

# Function to collect deployment configuration
collect_configuration() {
    print_step "Collecting deployment configuration..."
    
    # Check if config file exists and ask if user wants to use it
    if [ -f "$CONFIG_FILE" ]; then
        echo
        print_info "Found existing configuration file: $CONFIG_FILE"
        read -p "Do you want to use the existing configuration? (y/N): " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            source "$CONFIG_FILE"
            print_success "Using existing configuration ✅"
            return 0
        fi
    fi
    
    echo
    print_info "Please provide the following information for deployment:"
    echo
    
    # Project ID
    while true; do
        read -p "Enter your Google Cloud Project ID (e.g., my-tax-calculator-2025): " PROJECT_ID
        if validate_project_id "$PROJECT_ID"; then
            break
        else
            print_error "Invalid project ID format. Must be 6-30 characters, lowercase letters, numbers, and hyphens only, starting with a letter."
        fi
    done
    
    # Region
    echo
    print_info "Available regions (recommended: us-west1, us-central1, us-east1):"
    echo "  us-west1, us-west2, us-west3, us-west4"
    echo "  us-central1, us-central2"
    echo "  us-east1, us-east4, us-east5"
    echo "  europe-west1, europe-west2, europe-west3"
    echo "  asia-east1, asia-southeast1"
    echo
    read -p "Enter your preferred region (default: us-west1): " REGION
    REGION=${REGION:-us-west1}
    
    # Service name
    echo
    read -p "Enter service name (default: tax-calculator-app): " SERVICE_NAME
    SERVICE_NAME=${SERVICE_NAME:-tax-calculator-app}
    
    # Environment
    echo
    print_info "Available environments: dev, staging, prod"
    read -p "Enter environment (default: prod): " ENVIRONMENT
    ENVIRONMENT=${ENVIRONMENT:-prod}
    
    # GitHub repository (optional, for CI/CD)
    echo
    print_info "GitHub repository information (optional, for CI/CD setup):"
    read -p "Enter GitHub repository owner (e.g., yourusername): " GITHUB_OWNER
    read -p "Enter GitHub repository name (e.g., tax-calculator): " GITHUB_REPO
    
    # Custom domain (optional)
    echo
    print_info "Custom domain (optional):"
    read -p "Enter custom domain (e.g., taxcalc.yourdomain.com): " CUSTOM_DOMAIN
    
    # Enable monitoring
    echo
    read -p "Enable monitoring and alerting? (y/N): " -n 1 -r
    echo
    ENABLE_MONITORING=$([[ $REPLY =~ ^[Yy]$ ]] && echo "true" || echo "false")
    
    # Enable Cloud Build trigger
    echo
    read -p "Enable Cloud Build trigger for CI/CD? (y/N): " -n 1 -r
    echo
    ENABLE_CLOUD_BUILD_TRIGGER=$([[ $REPLY =~ ^[Yy]$ ]] && echo "true" || echo "false")
    
    # Save configuration
    cat > "$CONFIG_FILE" << EOF
# Tax Calculator 2025 - Deployment Configuration
# Generated on $(date)

PROJECT_ID="$PROJECT_ID"
REGION="$REGION"
SERVICE_NAME="$SERVICE_NAME"
ENVIRONMENT="$ENVIRONMENT"
GITHUB_OWNER="$GITHUB_OWNER"
GITHUB_REPO="$GITHUB_REPO"
CUSTOM_DOMAIN="$CUSTOM_DOMAIN"
ENABLE_MONITORING="$ENABLE_MONITORING"
ENABLE_CLOUD_BUILD_TRIGGER="$ENABLE_CLOUD_BUILD_TRIGGER"
EOF
    
    print_success "Configuration saved to $CONFIG_FILE ✅"
}

# Function to enable required APIs
enable_apis() {
    print_step "Enabling required Google Cloud APIs..."
    
    local apis=(
        "run.googleapis.com"           # Cloud Run
        "containerregistry.googleapis.com"  # Container Registry
        "cloudbuild.googleapis.com"    # Cloud Build
        "iam.googleapis.com"           # Identity and Access Management
        "compute.googleapis.com"       # Compute Engine (for networking)
        "monitoring.googleapis.com"    # Cloud Monitoring
        "logging.googleapis.com"       # Cloud Logging
    )
    
    for api in "${apis[@]}"; do
        print_info "Enabling $api..."
        gcloud services enable "$api" --project="$PROJECT_ID" --quiet || true
    done
    
    print_success "All required APIs enabled ✅"
}

# Function to create service account
create_service_account() {
    print_step "Creating service account for deployment..."
    
    local sa_name="${SERVICE_NAME}-deploy-sa"
    local sa_email="${sa_name}@${PROJECT_ID}.iam.gserviceaccount.com"
    
    # Check if service account already exists
    if gcloud iam service-accounts describe "$sa_email" --project="$PROJECT_ID" >/dev/null 2>&1; then
        print_info "Service account already exists: $sa_email"
    else
        print_info "Creating service account: $sa_name"
        gcloud iam service-accounts create "$sa_name" \
            --display-name="Tax Calculator Deployment Service Account" \
            --description="Service account for Tax Calculator deployment" \
            --project="$PROJECT_ID"
    fi
    
    # Grant necessary roles
    local roles=(
        "roles/run.admin"              # Cloud Run Admin
        "roles/storage.admin"          # Storage Admin (for Container Registry)
        "roles/iam.serviceAccountUser" # Service Account User
        "roles/cloudbuild.builds.builder" # Cloud Build Service Account
        "roles/monitoring.admin"       # Monitoring Admin
        "roles/logging.admin"          # Logging Admin
    )
    
    for role in "${roles[@]}"; do
        print_info "Granting role: $role"
        gcloud projects add-iam-policy-binding "$PROJECT_ID" \
            --member="serviceAccount:$sa_email" \
            --role="$role" \
            --quiet || true
    done
    
    # Create and download service account key
    local key_file="service-account-key.json"
    print_info "Creating service account key..."
    gcloud iam service-accounts keys create "$key_file" \
        --iam-account="$sa_email" \
        --project="$PROJECT_ID"
    
    print_warning "Service account key saved to: $key_file"
    print_warning "Keep this file secure and do not commit it to version control!"
    
    # Set environment variable for Terraform
    export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/$key_file"
    
    print_success "Service account setup completed ✅"
}

# Function to build and push Docker image
build_and_push_image() {
    print_step "Building and pushing Docker image..."
    
    cd "$(dirname "$0")" # Go to project root
    
    # Build the Docker image
    local commit_sha=$(git rev-parse --short HEAD 2>/dev/null || echo "latest")
    local image_tag="gcr.io/$PROJECT_ID/$SERVICE_NAME:$commit_sha"
    local latest_tag="gcr.io/$PROJECT_ID/$SERVICE_NAME:latest"
    
    print_info "Building image: $image_tag"
    docker build -t "$image_tag" -t "$latest_tag" .
    
    # Configure Docker for GCR
    gcloud auth configure-docker --quiet
    
    # Push the images
    print_info "Pushing images to Google Container Registry..."
    docker push "$image_tag"
    docker push "$latest_tag"
    
    # Save image tag for Terraform
    echo "IMAGE_TAG=$image_tag" >> "$CONFIG_FILE"
    
    print_success "Image pushed successfully ✅"
}

# Function to deploy with Terraform
deploy_with_terraform() {
    print_step "Deploying with Terraform..."
    
    cd terraform
    
    # Initialize Terraform
    print_info "Initializing Terraform..."
    terraform init
    
    # Select or create workspace for environment
    if ! terraform workspace list | grep -q "$ENVIRONMENT"; then
        print_info "Creating workspace: $ENVIRONMENT"
        terraform workspace new "$ENVIRONMENT"
    else
        print_info "Selecting workspace: $ENVIRONMENT"
        terraform workspace select "$ENVIRONMENT"
    fi
    
    # Source the image tag
    if [ -f "../$CONFIG_FILE" ]; then
        source "../$CONFIG_FILE"
    fi
    
    # Plan deployment
    print_info "Planning deployment..."
    terraform plan \
        -var="project_id=$PROJECT_ID" \
        -var="region=$REGION" \
        -var="service_name=$SERVICE_NAME" \
        -var="container_image=${IMAGE_TAG:-gcr.io/$PROJECT_ID/$SERVICE_NAME:latest}" \
        -var="environment=$ENVIRONMENT" \
        -var="github_owner=$GITHUB_OWNER" \
        -var="github_repo=$GITHUB_REPO" \
        -var="custom_domain=$CUSTOM_DOMAIN" \
        -var="enable_monitoring=$ENABLE_MONITORING" \
        -var="enable_cloud_build_trigger=$ENABLE_CLOUD_BUILD_TRIGGER" \
        -out="tfplan-$ENVIRONMENT"
    
    # Apply deployment
    print_info "Applying deployment..."
    terraform apply "tfplan-$ENVIRONMENT"
    
    # Get the service URL
    local service_url=$(terraform output -raw service_url 2>/dev/null || echo "")
    
    if [ -n "$service_url" ]; then
        print_success "Deployment completed successfully! ✅"
        echo -e "${GREEN}🚀 Service URL: $service_url${NC}"
        
        # Save service URL to config
        echo "SERVICE_URL=$service_url" >> "../$CONFIG_FILE"
    else
        print_warning "Could not retrieve service URL. Check Terraform outputs manually."
    fi
    
    # Clean up plan file
    rm -f "tfplan-$ENVIRONMENT"
    
    cd ..
}

# Function to verify deployment
verify_deployment() {
    print_step "Verifying deployment..."
    
    if [ -f "$CONFIG_FILE" ]; then
        source "$CONFIG_FILE"
    fi
    
    if [ -n "${SERVICE_URL:-}" ]; then
        print_info "Testing service health..."
        
        # Wait for service to be ready
        sleep 10
        
        # Health check
        local http_status=$(curl -s -o /dev/null -w "%{http_code}" "$SERVICE_URL" || echo "000")
        
        if [ "$http_status" -eq 200 ]; then
            print_success "Health check passed (HTTP $http_status) ✅"
        else
            print_warning "Health check returned HTTP $http_status"
            print_info "Service might still be starting up. Please check manually."
        fi
    else
        print_warning "Service URL not available. Please check deployment manually."
    fi
}

# Function to display next steps
display_next_steps() {
    print_step "Deployment Summary and Next Steps"
    echo
    
    if [ -f "$CONFIG_FILE" ]; then
        source "$CONFIG_FILE"
        echo -e "${CYAN}Configuration:${NC}"
        echo "  Project ID: $PROJECT_ID"
        echo "  Region: $REGION"
        echo "  Service Name: $SERVICE_NAME"
        echo "  Environment: $ENVIRONMENT"
        echo "  Service URL: ${SERVICE_URL:-Not available}"
        echo
    fi
    
    echo -e "${CYAN}Important Files:${NC}"
    echo "  Configuration: $CONFIG_FILE"
    echo "  Service Account Key: service-account-key.json"
    echo
    echo -e "${CYAN}Next Steps:${NC}"
    echo "  1. Test your application at the service URL"
    echo "  2. Set up custom domain (if configured)"
    echo "  3. Configure monitoring alerts (if enabled)"
    echo "  4. Set up GitHub Actions for CI/CD (if enabled)"
    echo
    echo -e "${CYAN}Useful Commands:${NC}"
    echo "  View logs: gcloud logging read 'resource.type=cloud_run_revision' --limit 50"
    echo "  Update service: gcloud run services update $SERVICE_NAME --region $REGION"
    echo "  View service: gcloud run services describe $SERVICE_NAME --region $REGION"
    echo
    echo -e "${YELLOW}Security Notes:${NC}"
    echo "  - Keep service-account-key.json secure"
    echo "  - Add service-account-key.json to .gitignore"
    echo "  - Consider using Workload Identity for production"
    echo
}

# Main execution
main() {
    print_header
    
    # Check dependencies
    check_dependencies
    
    # Check authentication
    check_gcloud_auth
    
    # Collect configuration
    collect_configuration
    
    # Source configuration
    source "$CONFIG_FILE"
    
    # Set project
    print_info "Setting project to: $PROJECT_ID"
    gcloud config set project "$PROJECT_ID"
    
    # Enable APIs
    enable_apis
    
    # Create service account
    create_service_account
    
    # Build and push image
    build_and_push_image
    
    # Deploy with Terraform
    deploy_with_terraform
    
    # Verify deployment
    verify_deployment
    
    # Display next steps
    display_next_steps
    
    print_success "Deployment setup completed! 🎉"
}

# Run main function
main "$@" 