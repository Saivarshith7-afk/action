#!/bin/bash

# Ansible Deployment Script
# Usage: ./deploy.sh [inventory-file] [dockerhub-username]

set -e

INVENTORY=${1:-inventory.ini}
DOCKERHUB_USERNAME=${2:-YOUR_DOCKERHUB_USERNAME}

echo "Deploying with Ansible..."
echo "Inventory: $INVENTORY"
echo "Docker Hub username: $DOCKERHUB_USERNAME"

# Check if ansible is installed
if ! command -v ansible-playbook &> /dev/null; then
    echo "Ansible is not installed. Installing requirements..."
    pip install -r requirements.txt
fi

# Run the playbook
ansible-playbook -i $INVENTORY playbook.yml \
    -e "dockerhub_username=$DOCKERHUB_USERNAME" \
    -v

echo "Deployment complete!"

