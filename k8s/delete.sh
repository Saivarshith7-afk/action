#!/bin/bash

# Kubernetes Cleanup Script
# Usage: ./delete.sh [namespace]

set -e

NAMESPACE=${1:-online-auction}

echo "Deleting all resources in namespace: $NAMESPACE"

# Delete all resources
kubectl delete -f ingress.yaml --ignore-not-found=true
kubectl delete -f frontend-deployment.yaml --ignore-not-found=true
kubectl delete -f backend-deployment.yaml --ignore-not-found=true
kubectl delete -f mysql-deployment.yaml --ignore-not-found=true
kubectl delete -f configmap-backend.yaml --ignore-not-found=true
kubectl delete -f secret-backend.yaml --ignore-not-found=true
kubectl delete -f secret-mysql.yaml --ignore-not-found=true
kubectl delete -f namespace.yaml --ignore-not-found=true

echo "Cleanup complete!"

