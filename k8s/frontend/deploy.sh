#!/bin/bash
# Deploy frontend to Docker Desktop Kubernetes
# Usage: bash k8s/frontend/deploy.sh   (run from project root)
set -e

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

echo "==> Switching to docker-desktop context..."
kubectl config use-context docker-desktop

echo "==> Building Docker image..."
docker build -t frontend:latest "$ROOT/frontend"

echo "==> Applying namespace..."
kubectl apply -f "$ROOT/k8s/frontend/namespace.yaml"

echo "==> Applying ConfigMap..."
kubectl apply -f "$ROOT/k8s/frontend/configmap.yaml"

echo "==> Applying Deployment..."
kubectl apply -f "$ROOT/k8s/frontend/deployment.yaml"

echo "==> Applying Service..."
kubectl apply -f "$ROOT/k8s/frontend/service.yaml"

echo "==> Applying HPA..."
kubectl apply -f "$ROOT/k8s/frontend/hpa.yaml"

echo ""
echo "==> Waiting for rollout..."
kubectl rollout status deployment/frontend -n message-queue --timeout=120s

echo ""
kubectl get pods -n message-queue -l app=frontend -o wide

echo ""
echo "Done. Frontend available at http://localhost:30004"
