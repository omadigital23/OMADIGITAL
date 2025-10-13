#!/bin/bash

# Script de nettoyage des fichiers deprecated
# Usage: bash scripts/cleanup-deprecated.sh

echo "🧹 Nettoyage des fichiers deprecated..."
echo ""

# Créer un backup avant suppression
BACKUP_DIR="backup-deprecated-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 Création du backup dans: $BACKUP_DIR"
echo ""

# Liste des fichiers à déplacer (pas supprimer, juste backup)
FILES_TO_BACKUP=(
  "src/lib/vertex-ai-service.ts"
  "src/lib/apis/stt-service.ts"
)

# Backup des fichiers
for file in "${FILES_TO_BACKUP[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ Backup: $file"
    cp "$file" "$BACKUP_DIR/"
  else
    echo "  ⚠️  Fichier non trouvé: $file"
  fi
done

echo ""
echo "📝 Fichiers backupés dans: $BACKUP_DIR"
echo ""
echo "⚠️  IMPORTANT:"
echo "   Les anciens fichiers sont toujours présents."
echo "   Ils ont été backupés dans $BACKUP_DIR"
echo ""
echo "   Pour les supprimer définitivement (après vérification):"
echo "   rm src/lib/vertex-ai-service.ts"
echo "   rm src/lib/apis/stt-service.ts"
echo ""
echo "✅ Nettoyage terminé!"
