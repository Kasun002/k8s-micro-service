#!/bin/bash
# Deploy all 3 microservices to Docker Desktop Kubernetes
# Run from project root: bash k8s/deploy-all.sh
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "========================================"
echo " Message Queue — Full K8s Deploy"
echo "========================================"

echo ""
echo "── Step 1: Switch context ───────────────"
kubectl config use-context docker-desktop

echo ""
echo "── Step 2: Build Docker images ──────────"
docker build -t cart-service:latest     "$ROOT/cart-service"
docker build -t purchase-service:latest "$ROOT/purchase-service"
docker build -t product-service:latest  "$ROOT/product-service"
docker build -t frontend:latest         "$ROOT/frontend"
echo "All images built."

echo ""
echo "── Step 3: Apply namespace ──────────────"
kubectl apply -f "$ROOT/k8s/cart-service/namespace.yaml"

echo ""
echo "── Step 4: Apply ConfigMaps ─────────────"
kubectl apply -f "$ROOT/k8s/cart-service/configmap.yaml"
kubectl apply -f "$ROOT/k8s/purchase-service/configmap.yaml"
kubectl apply -f "$ROOT/k8s/product-service/configmap.yaml"
kubectl apply -f "$ROOT/k8s/frontend/configmap.yaml"

echo ""
echo "── Step 5: Apply Secrets ────────────────"
kubectl apply -f "$ROOT/k8s/cart-service/secret.yaml"
kubectl apply -f "$ROOT/k8s/purchase-service/secret.yaml"
kubectl apply -f "$ROOT/k8s/product-service/secret.yaml"
# frontend has no secrets

echo ""
echo "── Step 6: Apply Deployments ────────────"
kubectl apply -f "$ROOT/k8s/cart-service/deployment.yaml"
kubectl apply -f "$ROOT/k8s/purchase-service/deployment.yaml"
kubectl apply -f "$ROOT/k8s/product-service/deployment.yaml"
kubectl apply -f "$ROOT/k8s/frontend/deployment.yaml"

echo ""
echo "── Step 7: Apply Services ───────────────"
kubectl apply -f "$ROOT/k8s/cart-service/service.yaml"
kubectl apply -f "$ROOT/k8s/purchase-service/service.yaml"
kubectl apply -f "$ROOT/k8s/product-service/service.yaml"
kubectl apply -f "$ROOT/k8s/frontend/service.yaml"

echo ""
echo "── Step 8: Apply HPAs ───────────────────"
kubectl apply -f "$ROOT/k8s/cart-service/hpa.yaml"
kubectl apply -f "$ROOT/k8s/purchase-service/hpa.yaml"
kubectl apply -f "$ROOT/k8s/product-service/hpa.yaml"
kubectl apply -f "$ROOT/k8s/frontend/hpa.yaml"

echo ""
echo "── Step 9: Wait for rollouts ────────────"
kubectl rollout status deployment/cart-service     -n message-queue --timeout=120s
kubectl rollout status deployment/purchase-service -n message-queue --timeout=120s
kubectl rollout status deployment/product-service  -n message-queue --timeout=120s
kubectl rollout status deployment/frontend         -n message-queue --timeout=120s

echo ""
echo "========================================"
echo " All pods:"
kubectl get pods -n message-queue -o wide
echo ""
echo " Services (NodePorts):"
kubectl get svc -n message-queue
echo ""
echo " HPAs:"
kubectl get hpa -n message-queue
echo "========================================"
echo ""
echo " Endpoints:"
echo "   Frontend         → http://localhost:30004"
echo "   Cart Service     → http://localhost:30001"
echo "   Purchase Service → http://localhost:30002"
echo "   Product Service  → http://localhost:30003"
echo ""
echo " Quick test:"
echo "   open http://localhost:30004"
echo "   curl http://localhost:30003/products"
echo "   curl http://localhost:30001/cart/user1"
echo "   curl http://localhost:30002/admin/queue"
