#!/bin/bash
set -e

echo "==> Switching to docker-desktop context..."
kubectl config use-context docker-desktop

echo "==> Applying namespace..."
kubectl apply -f k8s/cart-service/namespace.yaml

echo "==> Applying ConfigMap..."
kubectl apply -f k8s/cart-service/configmap.yaml

echo "==> Applying Secret..."
kubectl apply -f k8s/cart-service/secret.yaml

echo "==> Applying Deployment..."
kubectl apply -f k8s/cart-service/deployment.yaml

echo "==> Applying Service..."
kubectl apply -f k8s/cart-service/service.yaml

echo "==> Applying HPA..."
kubectl apply -f k8s/cart-service/hpa.yaml

echo ""
echo "==> Waiting for rollout..."
kubectl rollout status deployment/cart-service -n message-queue --timeout=120s

echo ""
kubectl get pods -n message-queue -l app=cart-service -o wide

echo ""
echo "Done. Cart service available at http://localhost:30001"
echo "  curl http://localhost:30001/cart/user1"
