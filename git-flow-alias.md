# 🚀 Git Flow Alias Guide

Ce document décrit les alias Git que nous utilisons pour **simplifier Git Flow**. Ces alias permettent d'exécuter plus rapidement les commandes Git Flow standard.

---

## 📌 1️⃣ Configuration des alias

Ajoutez ces alias une seule fois en exécutant ces commandes dans votre terminal :

```sh
# 🔄 Initialiser Git Flow
git config --global alias.flow-init '!git flow init -d'

# 🌿 Création d’une nouvelle branche feature
git config --global alias.feature-start '!git flow feature start'

# 🔀 Fin d’une feature et merge dans develop
git config --global alias.feature-finish '!git flow feature finish'

# 🛠 Création d’une nouvelle branche hotfix
git config --global alias.hotfix-start '!git flow hotfix start'

# 🛠 Fin d’un hotfix et merge dans develop & main
git config --global alias.hotfix-finish '!git flow hotfix finish'

# 🎉 Lancer une release
git config --global alias.release-start '!git flow release start'

# 🎉 Finir une release (merge + tag)
git config --global alias.release-finish '!git flow release finish'

# 📂 Vérifier les branches en cours dans Git Flow
git config --global alias.flow-status '!git branch --list'

# 🚀 Push d'une feature en cours sur le dépôt distant
git config --global alias.feature-push '!git push origin feature/'

# 🔄 Récupérer toutes les branches distant et locales de Git Flow
git config --global alias.flow-fetch '!git fetch --all --prune'

# 🚀 Pousser la branche develop après avoir fini une feature
git config --global alias.dev-push '!git push origin develop'

# 🚀 Pousser la branche main après avoir terminé une release
git config --global alias.main-push '!git push origin main'

# 📦 Récupérer et fusionner les modifications de develop
git config --global alias.dev-pull '!git pull origin develop'

# 🔥 Supprimer une branche feature terminée
git config --global alias.feature-delete '!git branch -d feature/'
```

---

## 📌 2️⃣ Utilisation des alias

Une fois enregistrés, ces alias permettent d'exécuter Git Flow **plus rapidement** :

| Commande avec Git Flow standard | Alias rapide |
|------------------------------|-------------|
| `git flow init` | `git flow-init` |
| `git flow feature start ma-feature` | `git feature-start ma-feature` |
| `git flow feature finish ma-feature` | `git feature-finish ma-feature` |
| `git flow hotfix start fix-urgent` | `git hotfix-start fix-urgent` |
| `git flow hotfix finish fix-urgent` | `git hotfix-finish fix-urgent` |
| `git flow release start v1.0` | `git release-start v1.0` |
| `git flow release finish v1.0` | `git release-finish v1.0` |
| `git branch --list` | `git flow-status` |
| `git push origin feature/ma-feature` | `git feature-push ma-feature` |
| `git fetch --all --prune` | `git flow-fetch` |
| `git push origin develop` | `git dev-push` |
| `git push origin main` | `git main-push` |
| `git pull origin develop` | `git dev-pull` |
| `git branch -d feature/ma-feature` | `git feature-delete ma-feature` |

---

## 📌 3️⃣ Vérifier les alias enregistrés

Pour voir tous vos alias définis, tapez :

```sh
git config --global --list | grep alias
```

Cela affichera la liste complète de vos alias Git.

---

## 📌 4️⃣ Besoin d'autres alias ?

Si tu veux **ajouter d'autres alias personnalisés**, modifie simplement la configuration en exécutant :

```sh
git config --global alias.nom-alias "commande-git"
```

Tu peux aussi **supprimer un alias** avec :

```sh
git config --global --unset alias.nom-alias
```

---

## 🚀 **Profitez d’un Git Flow plus rapide et efficace !** 😃

