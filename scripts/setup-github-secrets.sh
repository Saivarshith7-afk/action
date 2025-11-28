#!/bin/bash

# Script to help set up GitHub Secrets
# This script provides instructions for setting up required secrets

echo "=========================================="
echo "GitHub Secrets Setup Guide"
echo "=========================================="
echo ""
echo "Go to your repository: https://github.com/Saivarshith7-afk/action"
echo "Navigate to: Settings > Secrets and variables > Actions"
echo ""
echo "Add the following secrets:"
echo ""
echo "1. DOCKER_HUB_USERNAME"
echo "   Value: Your Docker Hub username"
echo ""
echo "2. DOCKER_HUB_TOKEN"
echo "   Value: Your Docker Hub access token"
echo "   (Create at: https://hub.docker.com/settings/security)"
echo ""
echo "3. VITE_API_URL (Optional)"
echo "   Value: Your backend API URL (e.g., http://your-domain.com/api)"
echo "   Default: http://localhost:8090"
echo ""
echo "=========================================="
echo "After setting secrets, push to main/master branch"
echo "to trigger the GitHub Actions workflow."
echo "=========================================="

