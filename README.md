# CEC Check-in Matinal — Innsbruck 2026

Application web mobile-first pour le check-in matinal autoévalué des athlètes
juniors canadiens d'escalade (CEC – Climbing Escalade Canada) lors du camp de
préparation YWCH 2026 à **Innsbruck (4 → 13 juillet 2026)**.

Chaque matin, l'athlète remplit un formulaire en moins de 60 secondes,
l'application calcule un **Track du jour (A ou B)** à partir de seuils
physiologiques et psycho-comportementaux, et propose d'envoyer un bilan
formaté au coach via WhatsApp.

---

## Fonctionnalités

- **Mobile-first**, dark mode permanent, esthétique premium dashboard sportif
  (glassmorphism, gradients radiaux, particules d'ambiance).
- **4 sections de formulaire** : Sommeil, Bien-être, Douleur (NRS 0-10),
  Hydratation et nutrition.
- **Échelles Likert** colorées (rouge → vert) avec 5 niveaux, sliders 0-10,
  toggles, calcul automatique de la durée de sommeil.
- **Logique Track A/B** déterministe à partir de flags rouges et jaunes :
  - Override médical immédiat sur **PIP dorsale**.
  - Track B rouge dès qu'un seul flag rouge est présent ou ≥ 3 flags jaunes.
  - Track B jaune si ≥ 1 flag jaune.
  - Track A sinon.
- **Écran de résultat** : hero card colorée selon le Track, anneau SVG animé,
  grille 2×4 de stats clés, liste d'indicateurs colorés, animations de
  grimpeurs SVG (vert / jaune / rouge).
- **Bilingue FR / EN** avec drapeau canadien 🇨🇦 dans les deux langues
  (préférence sauvegardée dans `localStorage`).
- **Intégration WhatsApp** : message formaté → `wa.me/{phone}?text=...`,
  l'athlète choisit d'envoyer ou non.
- **Aucune dépendance externe**, vanilla JS en modules ES6, **prêt pour
  GitHub Pages, Netlify ou Cloudflare Pages**.

---

## Structure du projet

```
cec-checkin/
├── index.html              # Page principale
├── css/
│   ├── base.css            # Variables, reset, typographie, layout
│   ├── components.css      # Cartes, boutons, formulaires, modal
│   ├── animations.css      # @keyframes, particules, climbers
│   └── result-screen.css   # Hero, anneau, stats grid, indicateurs
├── js/
│   ├── translations.js     # FR / EN + helpers t() / applyTranslations()
│   ├── state.js            # État form + localStorage
│   ├── form-logic.js       # Likert, sliders, validation, progression
│   ├── evaluation.js       # Logique Track A/B + flags (pure)
│   ├── animations.js       # SVG des grimpeurs
│   ├── result-screen.js    # Rendu dashboard, ring SVG, stats
│   ├── whatsapp.js         # Construction message + deep-link wa.me
│   └── main.js             # Boot et événements globaux
├── assets/
│   └── icons/              # Réservé pour futures icônes / logos
├── netlify.toml            # Config Netlify (optionnel)
├── .gitignore
└── README.md
```

---

## Développement local

L'application utilise des **modules ES6 (`import` / `export`)**, donc elle
**doit être servie via HTTP** (l'ouvrir directement avec `file://` ne
fonctionnera pas à cause de la politique CORS pour les modules).

### Option 1 — Python (préinstallé sur macOS / Linux)

```bash
cd cec-checkin
python3 -m http.server 8080
# puis ouvre http://localhost:8080
```

### Option 2 — Node.js

```bash
npx serve .
# ou
npx http-server -p 8080
```

### Option 3 — VS Code

Installe l'extension **Live Server** et clique sur "Go Live" en bas à droite.

---

## Déploiement

### GitHub Pages

1. Pousse le projet sur GitHub.
2. **Settings → Pages → Source : `main` / root**.
3. L'app est servie sur `https://<user>.github.io/<repo>/`.

### Netlify

1. **New site from Git** → choisir le repo.
2. **Build command** : *(laisser vide)*.
3. **Publish directory** : `.` (la racine).
4. Le fichier `netlify.toml` à la racine est déjà configuré.

### Cloudflare Pages

1. **Pages → Create project → Connect to Git**.
2. **Framework preset** : *None*.
3. **Build command** : *(laisser vide)*.
4. **Build output directory** : `/`.

Aucun build : tous les fichiers sont servis tels quels.

---

## Configuration

Au premier lancement, ouvre l'icône **⚙ Paramètres** (en haut à droite) pour :

- Renseigner le **numéro WhatsApp du coach** (format international sans `+` ni
  espaces, ex. Canada : `14186095751`).
- Choisir la **langue par défaut** (FR / EN).

Ces préférences sont sauvegardées localement (`localStorage`) sur le téléphone
de l'athlète.

---

## Logique Track A/B (référence)

```
INPUTS  →  FLAGS  →  DECISION

medicalOverride = TRUE si pipDorsal === TRUE
   → Track B (rouge), message d'arrêt + évaluation médicale

flags.red.length   ≥ 1   → Track B (rouge), récupération
flags.yellow.length ≥ 3  → Track B (rouge), allègement
flags.yellow.length ≥ 1  → Track B (jaune), réévaluation terrain
sinon                    → Track A (vert), charge complète
```

Seuils des flags : voir `js/evaluation.js`.

---

## Évolutions futures (non implémentées)

L'architecture est prête pour ajouter, sans tout réécrire :

- **Backend léger** (Cloudflare Workers + KV ou Supabase) pour stocker les
  check-ins de chaque athlète sur les 10 jours du camp.
- **Dashboard coach** pour visualiser les tendances (charge cumulée,
  récupération PRS, douleurs récurrentes) et déclencher des alertes.
- **Export CSV** pour analyse post-camp et reporting fédération.
- **Authentification athlète** (PIN simple ou magic link) pour relier les
  check-ins à un identifiant.

---

## Crédits

Conçu et développé pour **Climbing Escalade Canada (CEC)** — préparation YWCH
Arco 2026, camp Innsbruck juillet 2026.

Code MIT — utilisable et modifiable librement par la fédération et les coachs.
