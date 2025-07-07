# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **static HTML/JavaScript tax calculator** for the 2025 "One Big, Beautiful Bill" (BBB) tax benefits, targeting small business owners, freelancers, and side hustlers. The application is a pure static web app with no build process, deployed via Docker to Google Cloud Run.

**Live Application**: https://tax-calculator-app-715729810002.us-west1.run.app

## Architecture

### Core Application
- **Main Files**: `index.html` (468 lines) + `app.js` (636 lines)
- **Styling**: TailwindCSS via CDN (`https://cdn.tailwindcss.com`)
- **Icons**: Lucide via CDN (`https://unpkg.com/lucide@latest/dist/umd/lucide.js`)
- **PDF Export**: jsPDF via CDN (`https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js`)
- **State Management**: Global JavaScript objects (`calculatorData`)
- **Size**: 364KB total (highly optimized)

### Deployment Infrastructure
- **Docker**: nginx serving static files (`Dockerfile`)
- **Web Server**: nginx with custom configuration (`nginx.conf`)
- **Cloud Platform**: Google Cloud Run
- **Infrastructure**: Terraform configuration (`terraform/`)
- **Automation**: Deployment script (`setup-deployment.sh`)

## Development Commands

### Local Development
```bash
# Serve locally with Python
python -m http.server 8000
# Access at http://localhost:8000

# Serve locally with Node.js
npx serve .
# Access at http://localhost:3000

# Serve locally with nginx (if installed)
nginx -p . -c nginx.conf
```

### Docker Operations
```bash
# Build Docker image
docker build -t tax-calculator .

# Run container locally
docker run -p 8080:8080 tax-calculator

# Build for Google Cloud (with platform specification)
docker buildx build --platform linux/amd64 -t gcr.io/PROJECT_ID/tax-calculator-app:latest --push .
```

### Deployment
```bash
# Automated deployment to Google Cloud
./setup-deployment.sh

# Manual deployment steps
gcloud run deploy tax-calculator-app \
  --image gcr.io/PROJECT_ID/tax-calculator-app:latest \
  --region us-west1 \
  --allow-unauthenticated
```

### Infrastructure Management
```bash
# Terraform operations (from terraform/ directory)
cd terraform
terraform init
terraform plan
terraform apply
```

## Code Architecture

### File Structure
```
├── index.html              # Main application HTML (468 lines)
├── app.js                  # Complete application logic (636 lines)
├── public/favicon.ico      # Application icon
├── Dockerfile              # Static file serving configuration
├── nginx.conf              # Web server configuration
├── setup-deployment.sh     # Automated deployment script
├── terraform/              # Infrastructure as Code
│   ├── main.tf            # Cloud Run service configuration
│   ├── outputs.tf         # Deployment outputs
│   └── variables.tf       # Configurable variables
└── CLAUDE_DEPLOY.md       # Deployment guidelines and troubleshooting
```

### Application Logic (app.js)

#### Global State Management
```javascript
let calculatorData = {
    qbi: { beforeBBB: 0, afterBBB: 0, savings: 0 },
    vehicle: { beforeBBB: 0, afterBBB: 0, savings: 0 },
    asset: { beforeBBB: 0, afterBBB: 0, savings: 0 }
};
```

#### Key Components
- **Help System**: `helpContent` object with contextual tooltips
- **Tab Management**: JavaScript-based tab switching (QBI, Vehicle, Asset)
- **Calculations**: 
  - QBI deduction with phase-out logic
  - Vehicle loan interest calculations
  - Asset financing benefit calculations
- **Export Functions**: CSV and PDF generation
- **Form Validation**: Real-time input validation and error handling

#### Help System Architecture
- Modal-based tooltips triggered by 🛈 buttons
- Content stored in `helpContent` object
- Plain English explanations of tax concepts
- IRS form references and guidance

## Tax Calculation Logic

### QBI Deduction Calculator (BBB Section 70105)
- **Base Rate**: 20% of qualified business income
- **Phase-out Threshold**: $182,000 (single) / $364,000 (married) - unchanged by BBB
- **Phase-out Ranges**:
  - Before BBB: $50,000 (single) / $100,000 (married) - phase-out ends at $232k/$464k
  - After BBB: $75,000 (single) / $150,000 (married) - phase-out ends at $257k/$514k
- **BBB Impact**: Extended phase-out range allows more taxpayers to retain partial QBI deduction
- **Minimum Deduction**: $400 for taxpayers with at least $1,000 QBI (new BBB provision)
- **Limitations**: W-2 wages and qualified property (simplified in calculator)

### Vehicle Loan Interest Calculator (BBB Section 70203)
- **Eligibility**: New vehicles where original use commences with taxpayer (2025-2028)
- **Vehicle Types**: Cars, minivans, vans, SUVs, pickup trucks, motorcycles
- **Deduction Limit**: $10,000 annual interest maximum
- **Income Phase-out**: Begins at $100,000 (single) / $200,000 (married) - not yet implemented
- **Calculation**: Standard loan amortization
- **Bill Compliance**: ✅ Accurately implements bill provisions

### Asset Financing Calculator (BBB Section 70303)
- **Interest Deduction**: Enhanced through EBITDA → EBIT change
- **Mechanism**: 30% business interest limitation now based on EBIT instead of EBITDA
- **Asset Types**: Equipment, Real Estate, Vehicles, Leasehold Improvements
- **Practical Impact**: More deductible interest by excluding depreciation/amortization from limitation calculation

## Working with This Codebase

### Making Changes
1. **HTML Structure**: Modify `index.html` for layout changes
2. **Functionality**: Update `app.js` for calculator logic, help content, or interactions
3. **Styling**: Use TailwindCSS classes (loaded via CDN)
4. **Testing**: Serve locally and test manually (no automated test suite)

### Adding New Features
- **New Calculator**: Add tab in HTML, implement logic in `app.js`
- **Help Content**: Add entries to `helpContent` object
- **Export Formats**: Extend export functions in `app.js`

### Deployment Workflow
1. Make changes to static files
2. Test locally with HTTP server
3. Build and push Docker image: `docker buildx build --platform linux/amd64 -t gcr.io/PROJECT_ID/tax-calculator-app:latest --push .`
4. Deploy to Cloud Run: `gcloud run deploy tax-calculator-app --image gcr.io/PROJECT_ID/tax-calculator-app:latest --region us-west1`

## Testing

### Manual Testing Checklist
- [ ] All three calculator tabs switch correctly
- [ ] QBI calculator handles phase-out scenarios
- [ ] Vehicle calculator validates year range (2023-2028)
- [ ] Asset calculator shows correct financing benefits
- [ ] Help tooltips (🛈) display for all form fields
- [ ] CSV export generates correct data
- [ ] PDF export creates formatted reports
- [ ] Mobile responsiveness across devices
- [ ] Form validation shows appropriate errors

### Common Test Scenarios
- **QBI Phase-out**: Test with income above and below thresholds
- **Vehicle Eligibility**: Test with years outside 2023-2028 range
- **Help System**: Verify all help buttons show relevant content
- **Export Functions**: Test CSV and PDF with sample data

## Deployment Notes

### Google Cloud Run Configuration
- **Memory**: 512Mi (sufficient for static serving)
- **CPU**: 1 (required for concurrency > 1)
- **Concurrency**: 80 requests per instance
- **Min Instances**: 0 (cost optimization)
- **Max Instances**: 5 (scales based on traffic)

### Security Features
- **Non-root container**: nginx runs as `nginx-app` user
- **Health checks**: Built-in container health monitoring
- **HTTPS**: Automatic SSL via Cloud Run
- **Static files only**: No server-side processing reduces attack surface

## BBB Bill Compliance

### Analysis Summary (Based on BILLS-119hr1eas)
- **QBI Calculator**: ✅ Accurate to Section 70105 with corrections applied
- **Vehicle Calculator**: ✅ Fully compliant with Section 70203
- **Asset Calculator**: ✅ Correctly reflects Section 70303 EBITDA→EBIT change
- **Recent Updates**: Phase-out ranges, $400 minimum, accurate explanations

### Professional Disclaimer
This calculator implements BBB provisions as written but should not replace professional tax advice. Tax situations vary and professional consultation is recommended for actual tax planning.

## Important Notes

### No Build Process
- This is a **static application** - no compilation or bundling required
- Dependencies loaded via CDN (TailwindCSS, Lucide, jsPDF)
- Changes to HTML/JS files are immediately deployable

### State Management
- Uses global JavaScript objects (not React/Vue state)
- Data persists only during session (no backend storage)
- All calculations performed client-side

### CDN Dependencies
- **TailwindCSS**: Utility-first CSS framework
- **Lucide**: Icon library for UI elements
- **jsPDF**: PDF generation for export functionality

### Performance
- **Fast Loading**: 364KB total size
- **No Bundle**: Direct file serving
- **CDN Caching**: External dependencies cached by CDN providers
- **Responsive**: Mobile-first design with TailwindCSS