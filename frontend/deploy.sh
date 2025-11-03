#!/bin/bash

# Travel Planner - Google App Engine Deployment Script

echo "🚀 Starting deployment to Google App Engine..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud SDK is not installed."
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "🔐 Please authenticate with Google Cloud..."
    gcloud auth login
fi

# Build the application
echo "🔨 Building the application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build completed successfully!"

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "❌ dist folder not found. Build may have failed."
    exit 1
fi

# Deploy to App Engine
echo "☁️ Deploying to Google App Engine..."
gcloud app deploy app.yaml --quiet

if [ $? -eq 0 ]; then
    echo "🎉 Deployment successful!"
    echo "📱 Your app is now live!"
    echo ""
    echo "🔗 Open your app:"
    gcloud app browse
else
    echo "❌ Deployment failed. Please check the errors above."
    exit 1
fi
