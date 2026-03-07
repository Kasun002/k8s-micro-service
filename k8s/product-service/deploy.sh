#!/bin/bash
set -e

echo "==> Switching to docker-desktop context..."
kubectl config use-context docker-desktop

echo "==> Applying namespace..."
kubectl apply -f k8s/product-service/namespace.yaml

echo "==> Applying ConfigMap..."
kubectl apply -f k8s/product-service/configmap.yaml

echo "==> Applying Secret..."
kubectl apply -f k8s/product-service/secret.yaml

echo "==> Applying Deployment..."
kubectl apply -f k8s/product-service/deployment.yaml

echo "==> Applying Service..."
kubectl apply -f k8s/product-service/service.yaml

echo "==> Applying HPA..."
kubectl apply -f k8s/product-service/hpa.yaml

echo ""
echo "==> Waiting for rollout..."
kubectl rollout status deployment/product-service -n message-queue --timeout=120s

echo ""
kubectl get pods -n message-queue -l app=product-service -o wide

echo ""
echo "Done. Product service available at http://localhost:30003"
echo "  curl http://localhost:30003/products"
