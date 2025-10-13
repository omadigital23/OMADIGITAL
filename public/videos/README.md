# 🎥 Vidéos Hero Section - OMA Digital

## ⚠️ Fichiers Manquants

Les vidéos suivantes doivent être ajoutées dans ce dossier pour que la section Hero fonctionne correctement:

### Vidéos Requises

1. **hero1.webm** - Automatisation IA & WhatsApp
   - Thème: Solutions d'automatisation IA pour PME
   - Durée recommandée: 6-10 secondes
   - Format: WebM (optimisé pour le web)
   - Résolution: 1920x1080 ou 1280x720
   - Taille max: 2-3 MB

2. **hero2.webm** - Chatbots Intelligents
   - Thème: Chatbots IA multilingues
   - Durée recommandée: 6-10 secondes
   - Format: WebM
   - Résolution: 1920x1080 ou 1280x720
   - Taille max: 2-3 MB

3. **hero3.webm** - Sites Web Ultra-Rapides
   - Thème: Développement web performant
   - Durée recommandée: 6-10 secondes
   - Format: WebM
   - Résolution: 1920x1080 ou 1280x720
   - Taille max: 2-3 MB

4. **hero4.webm** - Applications Mobiles
   - Thème: Apps mobiles et solutions digitales
   - Durée recommandée: 6-10 secondes
   - Format: WebM
   - Résolution: 1920x1080 ou 1280x720
   - Taille max: 2-3 MB

5. **hero5.webm** - Innovation & R&D
   - Thème: Technologies innovantes et brevets
   - Durée recommandée: 6-10 secondes
   - Format: WebM
   - Résolution: 1920x1080 ou 1280x720
   - Taille max: 2-3 MB

## 📝 Spécifications Techniques

### Format Vidéo
- **Codec**: VP9 (WebM) ou H.264 (MP4)
- **Résolution**: 1920x1080 (Full HD) ou 1280x720 (HD)
- **Frame Rate**: 30 fps
- **Bitrate**: 2-4 Mbps pour un bon équilibre qualité/taille
- **Audio**: Pas nécessaire (les vidéos sont en mute)

### Optimisation
- Compresser les vidéos avec HandBrake ou FFmpeg
- Utiliser le format WebM pour une meilleure compression
- Garder la durée courte (6-10 secondes max)
- Optimiser pour le mobile (taille de fichier réduite)

## 🔧 Commande FFmpeg pour Optimiser

```bash
# Convertir en WebM optimisé
ffmpeg -i input.mp4 -c:v libvpx-vp9 -b:v 2M -c:a libopus -b:a 128k -vf scale=1280:720 hero1.webm

# Ou pour MP4 optimisé
ffmpeg -i input.mp4 -c:v libx264 -preset slow -crf 23 -vf scale=1280:720 -an hero1.mp4
```

## 🎨 Recommandations de Contenu

### Vidéo 1 - Automatisation IA
- Montrer des dashboards, graphiques de croissance
- Animations de processus automatisés
- Interface WhatsApp Business

### Vidéo 2 - Chatbots
- Conversations chatbot en action
- Interface utilisateur moderne
- Réponses multilingues (FR/EN)

### Vidéo 3 - Sites Web
- Navigation fluide sur site web
- Scores de performance (Lighthouse)
- Design responsive mobile/desktop

### Vidéo 4 - Apps Mobiles
- Démonstration d'app mobile
- Features et fonctionnalités
- UX/UI moderne

### Vidéo 5 - Innovation
- Animations technologiques
- Logos de partenaires tech
- Visualisations de données

## 🚀 Alternative Temporaire

En attendant les vraies vidéos, vous pouvez:

1. **Utiliser des images statiques** en modifiant `HeroSection.tsx`:
   ```typescript
   // Remplacer video par image
   <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
   ```

2. **Utiliser des vidéos de stock gratuites**:
   - [Pexels Videos](https://www.pexels.com/videos/)
   - [Pixabay Videos](https://pixabay.com/videos/)
   - [Coverr](https://coverr.co/)

3. **Créer des animations avec Canva**:
   - [Canva Video Editor](https://www.canva.com/video-editor/)

## 📦 Structure Actuelle

```
public/
└── videos/
    ├── README.md (ce fichier)
    ├── hero1.webm (À AJOUTER)
    ├── hero2.webm (À AJOUTER)
    ├── hero3.webm (À AJOUTER)
    ├── hero4.webm (À AJOUTER)
    └── hero5.webm (À AJOUTER)
```

## ✅ Checklist

- [ ] Créer ou obtenir les 5 vidéos
- [ ] Optimiser les vidéos (format WebM, <3MB chacune)
- [ ] Renommer les fichiers selon la convention (hero1.webm, hero2.webm, etc.)
- [ ] Placer les fichiers dans `public/videos/`
- [ ] Tester sur le site local
- [ ] Vérifier les performances (Lighthouse)
- [ ] Déployer sur Vercel

---

**Dernière mise à jour**: 13 Octobre 2025  
**Contact**: OMA Digital Team
