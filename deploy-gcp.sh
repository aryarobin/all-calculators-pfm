#!/bin/bash
# ─── GCP Cloud Run Deployment Script ────────────────────────────────────────
# Prerequisites:
#   1. Install Google Cloud CLI: https://cloud.google.com/sdk/docs/install
#   2. Run: gcloud auth login
#   3. Run: gcloud config set project YOUR_PROJECT_ID
#   4. Enable APIs: gcloud services enable run.googleapis.com cloudbuild.googleapis.com
#
# Usage: bash deploy-gcp.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e

PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
REGION="asia-south1"           # Mumbai — closest to Indian users
SERVICE_NAME="pfm-calculators"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

if [ -z "$PROJECT_ID" ]; then
  echo "❌ No GCP project set. Run: gcloud config set project YOUR_PROJECT_ID"
  exit 1
fi

echo "🚀 Deploying PFM Calculators to GCP Cloud Run"
echo "   Project: $PROJECT_ID"
echo "   Region:  $REGION"
echo "   Service: $SERVICE_NAME"
echo ""

# Build and push Docker image via Cloud Build
echo "📦 Building Docker image..."
cd pfm-calculators
gcloud builds submit --tag "$IMAGE_NAME" .

# Deploy to Cloud Run
echo "🌐 Deploying to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --image "$IMAGE_NAME" \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --port 8080 \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars "NODE_ENV=production"

# Get the URL
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format "value(status.url)")
echo ""
echo "✅ Deployment successful!"
echo "🌍 Your app is live at: $SERVICE_URL"
