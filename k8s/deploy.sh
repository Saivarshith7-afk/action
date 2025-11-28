#!/bin/bash

# Kubernetes Deployment Script
# Usage: ./deploy.sh [namespace] [dockerhub-username]

set -e

NAMESPACE=${1:-online-auction}
DOCKERHUB_USERNAME=${2:-YOUR_DOCKERHUB_USERNAME}

echo "Deploying to namespace: $NAMESPACE"
echo "Using Docker Hub username: $DOCKERHUB_USERNAME"

# Update image names in manifests
find . -name "*.yaml" -type f -exec sed -i "s/YOUR_DOCKERHUB_USERNAME/$DOCKERHUB_USERNAME/g" {} \;

# Apply manifests in order
echo "Creating namespace..."
kubectl apply -f namespace.yaml

echo "Creating secrets..."
kubectl apply -f secret-backend.yaml
kubectl apply -f secret-mysql.yaml

echo "Creating configmaps..."
kubectl apply -f configmap-backend.yaml

echo "Deploying MySQL..."
kubectl apply -f mysql-deployment.yaml

echo "Waiting for MySQL to be ready..."
kubectl wait --for=condition=ready pod -l app=mysql -n $NAMESPACE --timeout=300s

echo "Deploying backend..."
kubectl apply -f backend-deployment.yaml

echo "Deploying frontend..."
kubectl apply -f frontend-deployment.yaml

echo "Creating ingress..."
kubectl apply -f ingress.yaml

echo "Waiting for all pods to be ready..."
kubectl wait --for=condition=ready pod -l app=backend -n $NAMESPACE --timeout=300s
kubectl wait --for=condition=ready pod -l app=frontend -n $NAMESPACE --timeout=300s

echo "Deployment complete!"
echo "Checking pod status..."
kubectl get pods -n $NAMESPACE

echo "Checking services..."
kubectl get svc -n $NAMESPACE

