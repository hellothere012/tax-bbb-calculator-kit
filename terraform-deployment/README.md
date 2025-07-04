# Tax BBB Cloud Deployment

This repository contains Terraform configurations for deploying the Tax BBB application to Google Cloud Platform (GCP). The application consists of a frontend web app and an AI analyzer microservice, both deployed to Google Cloud Run.

## 🧩 Architecture

The deployment consists of two main components:

1. **Frontend Web App**
   - React/Vite-based UI for tax savings calculations
   - Containerized and deployed on Google Cloud Run
   - Publicly accessible

2. **AI Analyzer Microservice**
   - Node.js/Python-based backend for document analysis
   - Processes tax documents (CSV, Excel, JSON, PDF)
   - Integrates with Gemini AI API
   - Deployed on Google Cloud Run as an autonomous microservice
   - Publicly accessible API

## 📁 Repository Structure

```
tax-bbb-cloud-deployment/
├── terraform/
│   ├── main.tf          # Main Terraform configuration
│   ├── variables.tf     # Global variables
│   ├── outputs.tf       # Global outputs
├── frontend/
│   ├── main.tf          # Frontend module configuration
│   ├── variables.tf     # Frontend module variables
│   ├── outputs.tf       # Frontend module outputs
└── analyzer-service/
    ├── main.tf          # Analyzer service module configuration
    ├── variables.tf     # Analyzer service module variables
    └── outputs.tf       # Analyzer service module outputs
```

## 🚀 Getting Started

### Prerequisites

- [Terraform](https://www.terraform.io/downloads.html) (v1.0 or later)
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
- A Google Cloud Platform account with billing enabled
- Docker images for the frontend and analyzer service

### Setup

1. **Authenticate with Google Cloud:**

   ```bash
   gcloud auth application-default login
   ```

2. **Initialize Terraform:**

   ```bash
   cd terraform
   terraform init
   ```

3. **Configure Variables:**

   Create a `terraform.tfvars` file in the `terraform` directory:

   ```hcl
   project_id          = "your-gcp-project-id"
   region              = "us-west1"
   frontend_image_url  = "gcr.io/your-project/tax-bbb-frontend:latest"
   analyzer_image_url  = "gcr.io/your-project/tax-bbb-analyzer:latest"
   ```

4. **Plan the Deployment:**

   ```bash
   terraform plan
   ```

5. **Apply the Deployment:**

   ```bash
   terraform apply
   ```

6. **Access the Deployed Services:**

   After deployment, Terraform will output the URLs for the frontend and analyzer service.

## 🔄 CI/CD Integration

This Terraform configuration is designed to be integrated with GitHub Actions for CI/CD. To set up CI/CD:

1. **Create a Service Account** with the following roles:
   - Cloud Run Admin
   - Service Account User
   - Storage Admin (if using GCS backend)

2. **Generate a Key** for the service account and store it as a GitHub secret named `GCP_SA_KEY`.

3. **Create a GitHub Actions Workflow** file (e.g., `.github/workflows/terraform.yml`):

   ```yaml
   name: 'Terraform'

   on:
     push:
       branches: [ main ]
     pull_request:
       branches: [ main ]

   jobs:
     terraform:
       runs-on: ubuntu-latest
       steps:
       - uses: actions/checkout@v3

       - name: Setup Terraform
         uses: hashicorp/setup-terraform@v2

       - name: Authenticate to GCP
         uses: google-github-actions/auth@v1
         with:
           credentials_json: ${{ secrets.GCP_SA_KEY }}

       - name: Terraform Init
         run: |
           cd terraform
           terraform init

       - name: Terraform Plan
         run: |
           cd terraform
           terraform plan -var="project_id=${{ secrets.GCP_PROJECT_ID }}" -var="frontend_image_url=${{ secrets.FRONTEND_IMAGE_URL }}" -var="analyzer_image_url=${{ secrets.ANALYZER_IMAGE_URL }}"

       - name: Terraform Apply
         if: github.ref == 'refs/heads/main' && github.event_name == 'push'
         run: |
           cd terraform
           terraform apply -auto-approve -var="project_id=${{ secrets.GCP_PROJECT_ID }}" -var="frontend_image_url=${{ secrets.FRONTEND_IMAGE_URL }}" -var="analyzer_image_url=${{ secrets.ANALYZER_IMAGE_URL }}"
   ```

## 🔧 Customization

### Scaling Configuration

You can customize the scaling configuration by uncommenting and modifying the optional variables in `variables.tf` files.

### Custom Domain

To use a custom domain for your services, uncomment and configure the `google_cloud_run_domain_mapping` resource in the module files.

### Secret Management

For production deployments, it's recommended to use Secret Manager for sensitive values like API keys. Uncomment and configure the Secret Manager resources in the module files.

## 📝 Notes

- This deployment uses a local Terraform backend. For production, consider using a remote backend like Google Cloud Storage.
- The services are configured to be publicly accessible. For production, consider restricting access using IAM.
- The Gemini AI API key is set as an environment variable. For production, use Secret Manager.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

