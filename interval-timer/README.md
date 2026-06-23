# Minuteur d'intervalles · Spotify

Application web **personnelle** de minuteur d'intervalles pour l'entraînement
(contexte escalade), avec **contrôle de la musique Spotify**. Conçue pour le
**téléphone en mode paysage**. 100 % personnalisable, fichiers statiques
(HTML/CSS/JS), **sans aucune installation ni build**.

> 🚀 **Première fois ?** Suis le guide pas-à-pas : **[INSTALL.md](INSTALL.md)**.

---

## Utilisation au quotidien

1. Ouvre l'app (ajoute-la à l'écran d'accueil du téléphone pour un accès rapide).
2. **Connecte Spotify** (une fois), choisis ton **appareil de lecture** et
   appuie sur **« Activer cet appareil »**.
   - Astuce : lance une chanson 2 s dans Spotify avant, pour le « réveiller ».
3. **Configure ta séance** (section *Phases*) :
   - Échauffement *(optionnel)* → [**Travail**, **Repos**] × *N séries* → Retour au calme *(optionnel)*.
   - Durée min/sec de chaque phase, nombre de séries.
   - Couleur de fond par phase (le texte passe en noir/blanc automatiquement ;
     **double-clic** sur la pastille pour forcer manuellement).
4. **Assigne une playlist** par type de phase (tes playlists ou un lien/URI).
   Choisis l'ordre **séquentiel** ou **aléatoire** : une chanson différente à
   chaque série.
5. Enregistre un **préréglage** nommé pour réutiliser ton protocole.
6. **Tourne le téléphone en paysage** → **▶ Démarrer**.

### Pendant la séance (plein écran)
- Le **chiffre du compte à rebours** occupe tout l'écran ; en haut, la **phase**
  et la **série** (ex. *Travail — Série 3 / 8*).
- Contrôles : **⟲ Réinitialiser**, **⏸ / ▶ Pause-Reprendre**, **⏭ Passer la
  phase**, **✕ Quitter**.
- Mettre en pause met **aussi** Spotify en pause ; reprendre reprend ; la fin de
  séance met la musique en pause.
- En bas : **chanson en cours** + flèches **◀ / ▶** pour changer de piste.
- **Bips** optionnels sur les 3 dernières secondes + bip de changement de phase
  (générés sans fichier audio, indépendants du volume Spotify).
- L'**écran reste allumé** pendant la séance (Wake Lock).

Le minuteur fonctionne **sans Spotify** (musique désactivée).

---

## Caractéristiques

- Authentification Spotify **PKCE** (le flux *implicit grant* supprimé le
  27/11/2025 n'est **pas** utilisé).
- Contrôle via l'API **Player / Spotify Connect** (pas de Web Playback SDK).
- Mobile d'abord, fort contraste, gros boutons, lisible à distance.
- Préréglages, couleurs, playlists, sons : tout est personnalisable.

Détails et dépannage : **[INSTALL.md](INSTALL.md)**.
