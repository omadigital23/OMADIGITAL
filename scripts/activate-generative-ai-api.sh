#!/bin/bash

# Script pour activer l'API Generative AI
# Usage: bash scripts/activate-generative-ai-api.sh

echo "🔧 Activation de l'API Generative AI..."
echo ""

# Activer l'API Generative Language
echo "📡 Activation de generativelanguage.googleapis.com..."
gcloud services enable generativelanguage.googleapis.com --project=omadigital23

# Activer aussi Vertex AI API (si pas déjà fait)
echo "📡 Activation de aiplatform.googleapis.com..."
gcloud services enable aiplatform.googleapis.com --project=omadigital23

echo ""
echo "✅ APIs activées!"
echo ""
echo "🔍 Vérification..."
gcloud services list --enabled --project=omadigital23 | grep -E "generativelanguage|aiplatform"

echo ""
echo "⏳ Attendre 30 secondes pour que les APIs soient complètement activées..."
sleep 30

echo ""
echo "🧪 Test des modèles disponibles..."
cd "$(dirname "$0")/.."
npm run list:models

echo ""
echo "✅ Activation terminée!"
echo ""
echo "🚀 Prochaines étapes:"
echo "   1. Vérifier les modèles disponibles ci-dessus"
echo "   2. Mettre à jour le code avec le bon modèle"
echo "   3. Redémarrer: npm run dev"
echo ""
