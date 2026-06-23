# Guide d'installation — Minuteur d'intervalles avec Spotify

Ce guide est pensé **pour débutant total**, sans connaissance technique.
Suis les étapes **dans l'ordre**. Compte le temps : environ **20 minutes** la
première fois.

Il te faut :
- un compte **Spotify Premium** (obligatoire pour contrôler la lecture) ;
- un compte **GitHub** (gratuit) pour mettre l'app en ligne ;
- ton téléphone et un ordinateur (plus simple pour la configuration).

> 💡 L'application est composée de **fichiers statiques** (HTML/CSS/JS). Il n'y
> a **rien à installer**, aucun « build », aucun serveur. On dépose les fichiers
> sur GitHub, on active GitHub Pages, et c'est en ligne en HTTPS.

---

## Vue d'ensemble (ce qu'on va faire)

1. Mettre les fichiers en ligne avec **GitHub Pages** → on obtient une **adresse web** (URL).
2. Créer une **application Spotify** (gratuit) dans le tableau de bord développeur.
3. Coller cette URL comme **Redirect URI** dans Spotify, **exactement**.
4. Copier le **Client ID** de Spotify et le coller dans le fichier `js/config.js`.
5. S'ajouter soi-même comme **utilisateur autorisé** dans Spotify.
6. Ouvrir l'app sur le téléphone, se connecter, assigner les playlists, démarrer.

L'ordre est important : il faut **l'URL GitHub Pages d'abord**, car Spotify a
besoin de cette adresse exacte.

---

## Étape 1 — Mettre les fichiers en ligne (GitHub Pages)

### 1.1 Créer un dépôt (repo)
1. Va sur https://github.com et connecte-toi (ou crée un compte gratuit).
2. En haut à droite, clique **+** → **New repository**.
3. **Repository name** : choisis un nom simple, par exemple `minuteur`.
4. Laisse-le en **Public**.
5. Clique **Create repository**.

### 1.2 Téléverser les fichiers
Tu dois mettre **le dossier `interval-timer/`** (avec `index.html`, le dossier
`css/` et le dossier `js/`) dans ton dépôt.

> Si tu as récupéré ce projet complet, le plus simple est de **garder la même
> structure** : le dossier `interval-timer` à la racine du dépôt.

1. Dans ton dépôt GitHub, clique **Add file** → **Upload files**.
2. Glisse-dépose le **dossier `interval-timer`** entier (ou ses fichiers en
   conservant les sous-dossiers `css` et `js`).
3. En bas, clique **Commit changes**.

### 1.3 Activer GitHub Pages
1. Dans le dépôt, va dans **Settings** (l'onglet ⚙️ en haut).
2. Menu de gauche → **Pages**.
3. Section **Build and deployment** → **Source** : choisis **Deploy from a branch**.
4. **Branch** : choisis `main` (ou `master`), dossier `/ (root)`, puis **Save**.
5. Attends 1 à 2 minutes, recharge la page. GitHub affiche :
   **« Your site is live at … »** avec une adresse.

### 1.4 Noter l'URL EXACTE de l'app
Ton adresse aura cette forme :

```
https://TON-PSEUDO.github.io/minuteur/interval-timer/
```

- Remplace `TON-PSEUDO` par ton nom d'utilisateur GitHub.
- Remplace `minuteur` par le nom de ton dépôt.
- **Le `/interval-timer/` à la fin** correspond au dossier où sont les fichiers.
- ⚠️ **Garde le slash `/` final.** Note cette URL quelque part, on en a besoin
  **à l'identique** à l'étape suivante.

> Ouvre cette URL dans ton navigateur : tu dois voir l'écran de configuration
> du minuteur. (La musique ne marchera pas encore : c'est normal.)

---

## Étape 2 — Créer l'application Spotify

1. Va sur https://developer.spotify.com/dashboard et connecte-toi avec ton
   compte Spotify.
2. Clique **Create app**.
3. Remplis :
   - **App name** : `Minuteur` (ce que tu veux).
   - **App description** : `Minuteur d'intervalles personnel`.
   - **Redirect URI** : colle ici **l'URL EXACTE de l'étape 1.4**, par exemple :
     ```
     https://TON-PSEUDO.github.io/minuteur/interval-timer/
     ```
     ⚠️ **POINTS CRITIQUES** :
     - L'URL doit être en **HTTPS** (GitHub Pages le fournit automatiquement ✅).
     - Elle doit correspondre **caractère pour caractère**, **slash final compris**.
       La moindre différence (majuscule, slash manquant) fait échouer la connexion.
     - Clique **Add** après l'avoir collée.
   - **Which API/SDKs** : coche **Web API**.
4. Accepte les conditions, puis **Save**.

### 2.1 Copier le Client ID
- Sur la page de ton app Spotify, clique **Settings**.
- Tu vois **Client ID** : une longue suite de lettres/chiffres. **Copie-la.**
- ⚠️ N'utilise **PAS** le « Client secret ». Cette app n'en a **pas besoin**
  (sécurité PKCE). Le Client ID, lui, est **public** : c'est normal qu'il soit
  visible dans le code.

### 2.2 S'ajouter comme utilisateur autorisé
En mode développement, Spotify n'autorise que les utilisateurs **ajoutés à la
main** (sinon la connexion échoue avec une erreur).
1. Toujours dans ton app Spotify → onglet **User Management**.
2. Ajoute **ton nom** et **l'adresse e-mail de ton compte Spotify**.
3. **Save**.

> Tu peux ajouter jusqu'à 25 utilisateurs en mode développement. Pour un usage
> personnel, t'ajouter toi-même suffit.

---

## Étape 3 — Coller le Client ID dans le code

1. Dans ton dépôt GitHub, ouvre le fichier **`interval-timer/js/config.js`**.
2. Clique sur l'icône **crayon ✏️** (Edit) en haut à droite du fichier.
3. Tout en haut, trouve cette ligne :
   ```js
   const SPOTIFY_CLIENT_ID = "COLLE_TON_CLIENT_ID_ICI";
   ```
4. Remplace `COLLE_TON_CLIENT_ID_ICI` par ton Client ID (garde les guillemets) :
   ```js
   const SPOTIFY_CLIENT_ID = "a1b2c3d4e5f6...."; // ← ton vrai Client ID
   ```
5. En bas, clique **Commit changes**.
6. Attends ~1 minute que GitHub Pages se mette à jour.

> 🔁 Le **Redirect URI** se calcule **tout seul** depuis l'adresse de la page.
> Tu n'as donc rien à modifier d'autre — il suffit que l'URL de l'app et celle
> mise dans le dashboard Spotify soient identiques (étape 2).

---

## Étape 4 — Premier lancement (sur le téléphone)

1. Sur ton téléphone, ouvre **l'app Spotify** et lance n'importe quelle chanson
   **2 secondes** (ça « réveille » l'appareil pour Spotify Connect).
2. Ouvre l'URL de ton minuteur dans le navigateur du téléphone (étape 1.4).
   Ajoute-la à l'écran d'accueil pour un accès rapide (menu du navigateur →
   « Ajouter à l'écran d'accueil »).
3. Section **1 · Spotify** → **Connecter Spotify** → accepte les autorisations.
   Tu reviens sur l'app, connecté.
4. **Appareil de lecture** : choisis ton téléphone (ou une enceinte Bluetooth
   Connect) dans la liste, puis **Activer cet appareil (réveiller Spotify)**.
   - Liste vide ? Relance une chanson dans Spotify, puis appuie sur **↻**.
5. Section **3 · Musique** : assigne une playlist à **Travail** et **Repos**
   (l'échauffement et le retour au calme reprennent ces playlists par défaut).
   Tu peux choisir une de tes playlists **ou coller un lien/URI** de playlist.
6. Règle tes durées et le nombre de séries dans **2 · Phases**.
7. **Tourne le téléphone en paysage** et appuie sur **▶ Démarrer la séance**.

> Le minuteur fonctionne **même sans Spotify**. Si tu ne connectes pas Spotify,
> la musique est simplement désactivée.

---

## Section dépannage

### « NO_ACTIVE_DEVICE » / « Aucun appareil actif »
Spotify ne contrôle un appareil que s'il est **actif**.
- Ouvre Spotify, **lance une chanson 2 secondes**.
- Reviens dans le minuteur, appuie sur **↻**, choisis l'appareil, puis
  **Activer cet appareil**.
- Si c'est instable sur le **même téléphone** (le navigateur et Spotify se
  partagent l'audio), utilise plutôt une **enceinte Bluetooth Connect** ou un
  **deuxième appareil** comme cible de lecture. C'est le montage le plus fiable.

### La connexion tourne en boucle / revient à la page de connexion
- Le **Redirect URI** dans Spotify ne correspond **pas exactement** à l'URL de
  la page (slash final, majuscule, `interval-timer/` manquant…). Recopie
  l'adresse **exacte** affichée par GitHub Pages dans **Settings → Pages**.
- Vérifie que tu t'es **ajouté comme utilisateur** (étape 2.2).
- Vérifie que le **Client ID** est bien collé dans `js/config.js`.

### Pas de son
- Le compte doit être **Premium**.
- Une chanson doit avoir été **lancée au moins une fois** sur l'appareil cible.
- Vérifie le **volume** de l'appareil (et le curseur de volume dans l'app).
- Vérifie qu'une **playlist** est bien assignée aux phases.

### « Session expirée » / token expiré
- L'app rafraîchit le token automatiquement. Si le message persiste,
  **déconnecte-toi puis reconnecte-toi** (section Spotify).

### Les bips ne sonnent pas
- Ils sont activés par le **premier appui sur Démarrer** (exigence des
  navigateurs mobiles). Vérifie que l'option **Bips** est cochée et que le
  téléphone n'est pas en silencieux.

### `localhost` ne marche pas en test local
- Spotify **n'accepte plus `localhost`** depuis le 27 novembre 2025. Pour
  tester en local, sers les fichiers sur **`http://127.0.0.1:PORT`** (par
  exemple avec l'extension « Live Server », ou `python3 -m http.server`) et
  ajoute cette adresse comme Redirect URI dans le dashboard. En production sur
  GitHub Pages, tout est déjà en **HTTPS**, c'est l'usage recommandé.

---

## Notes techniques (pour les curieux)

- **Authentification** : *Authorization Code with PKCE* (recommandé par Spotify
  pour les apps web sans secret). Le flux *implicit grant* est **supprimé**
  depuis le 27 novembre 2025 — ne suis aucun tutoriel qui l'utilise encore.
- **Lecture** : l'app **ne joue pas** la musique. Elle envoie des commandes à
  l'app Spotify officielle / une enceinte via l'API **Player (Spotify Connect)**.
  Le Web Playback SDK n'est **pas** utilisé (peu fiable sur mobile).
- **Stockage** : tokens et préréglages sont gardés dans le `localStorage` de
  ton navigateur (rien n'est envoyé ailleurs).
