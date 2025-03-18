# 📖 Guide d'Utilisation de Git avec GitFlow

## 🚀 Introduction
Ce guide explique comment utiliser **Git avec GitFlow**, respecter les conventions de commits et assurer une gestion propre des branches.

---

## 📌 1. Initialisation du projet avec GitFlow
### 🔹 Initialiser Git
```sh
git init
```
### 🔹 Configurer GitFlow
```sh
git flow init
```
📌 **Réponses recommandées :**
- Branche principale : `main`
- Branche de développement : `develop`
- Préfixes par défaut pour les branches : `feature/*`, `release/*`, `hotfix/*`

---

## 📌 2. Gestion des Branches avec GitFlow

### 🔹 Branches principales :
| Branche   | Rôle |
|-----------|-----------------------------------------------------|
| `main`    | Version stable en production (aucun commit direct) |
| `develop` | Version en cours de développement |

### 🔹 Branches secondaires :
| Branche       | Usage |
|--------------|---------------------------------------------------------|
| `feature/*`  | Développement d'une nouvelle fonctionnalité |
| `bugfix/*`   | Correction de bugs en cours de développement |
| `release/*`  | Préparation d’une version stable avant son passage en `main` |
| `hotfix/*`   | Corrections critiques en production |

### 🔹 Création d'une branche de fonctionnalité
```sh
git flow feature start nom-de-la-feature
```

### 🔹 Finalisation d'une branche de fonctionnalité (Merge dans `develop`)
```sh
git flow feature finish nom-de-la-feature
```

---

## 📌 3. Convention de Commit (Conventional Commits)
Tous les commits doivent suivre cette structure :
```txt
<type>(<scope>): <message>
```
| Type       | Utilisation |
|------------|-----------------------------------------|
| `feat`     | Ajout d'une nouvelle fonctionnalité |
| `fix`      | Correction d'un bug |
| `docs`     | Mise à jour de la documentation |
| `style`    | Changement sans impact sur le code |
| `refactor` | Réorganisation du code |
| `perf`     | Amélioration des performances |
| `test`     | Ajout ou modification de tests |
| `chore`    | Mise à jour des dépendances |
| `ci`       | Modification du pipeline de déploiement |

### 🔹 Exemples de commits valides
```sh
git commit -m "feat(auth): ajout du système d'authentification"
git commit -m "fix(api): correction du bug de connexion"
git commit -m "docs(readme): amélioration des instructions d’installation"
```
🚨 **Interdits** :
- `git commit -m "fix bug"` ❌
- `git commit -m "update"` ❌
- `git commit -m "test"` ❌

---

## 📌 4. Règles Git Strictes
✅ **Aucun commit direct sur `main` et `develop`**
✅ **Suppression des branches `feature/*` après merge dans `develop`**
✅ **Merge dans `main` uniquement via `release/*` ou `hotfix/*`**
✅ **Tag obligatoire sur chaque version stable**
```sh
git tag -a v1.0.0 -m "Version 1.0.0"
git push origin --tags
```
✅ **Pull Request obligatoire pour tout merge**
✅ **Relecture de code et validation obligatoire avant merge**

---

## 📌 5. Déploiement & Protection des Branches
### 🔹 Protection des branches sur GitHub
1. Aller dans **Settings** → **Branches** → **Add branch protection rule**
2. Appliquer les règles suivantes sur `main` et `develop` :
   - ✅ **Require pull request before merging**
   - ✅ **Require status checks to pass before merging**
   - ✅ **Include administrators**

### 🔹 Déploiement automatique (Vercel)
```sh
vercel --prod
```
📌 **Règle** : Seul `main` doit déclencher un déploiement.

---

## 📌 6. Automatisation des Vérifications
### 🔹 Vérification des commits (Hook `commit-msg`)
Empêche les commits non conformes avec Husky :
```sh
npx husky add .husky/commit-msg "sh .git/hooks/commit-msg"
```

### 🔹 Vérification des branches (Hook `pre-commit`)
Empêche les commits sur `main` et `develop` :
```sh
npx husky add .husky/pre-commit "sh .git/hooks/pre-commit"
```

---

## 🎯 Conclusion
Avec ce guide, tu as toutes les règles et commandes essentielles pour utiliser **Git avec GitFlow** efficacement. 🚀

**Respecter ces règles assure un code propre, bien structuré et facile à maintenir !** 💪

