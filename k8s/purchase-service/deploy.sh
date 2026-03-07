#!/bin/bash
# Deploy purchase-service to Docker Desktop Kubernetes
# Usage: bash k8s/purchase-service/deploy.sh

set -e

echo "==> Switching to docker-desktop context..."
kubectl config use-context docker-desktop

echo "==> Applying namespace..."
kubectl apply -f k8s/purchase-service/namespace.yaml

echo "==> Applying ConfigMap..."
kubectl apply -f k8s/purchase-service/configmap.yaml

echo "==> Applying Secret..."
kubectl apply -f k8s/purchase-service/secret.yaml

echo "==> Applying Deployment..."
kubectl apply -f k8s/purchase-service/deployment.yaml

echo "==> Applying Service..."
kubectl apply -f k8s/purchase-service/service.yaml

echo "==> Applying HPA..."
kubectl apply -f k8s/purchase-service/hpa.yaml

echo ""
echo "==> Waiting for pods to be ready (timeout 120s)..."
kubectl rollout status deployment/purchase-service -n message-queue --timeout=120s

echo ""
echo "==> Pod status:"
kubectl get pods -n message-queue -o wide

echo ""
echo "==> Service:"
kubectl get svc -n message-queue

echo ""
echo "✓ Done. Purchase service available at http://localhost:30002"
echo "  curl http://localhost:30002/purchases"
echo "  curl http://localhost:30002/admin/queue"
echo "  curl http://localhost:30002/reports/daily"
