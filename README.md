# Inte et dep continu  
MAJ par Pierre TONDEUX le 27/02/2026

Ce projet est un exemple d’application React configurée avec Vite, intégrant :

- Tests unitaires et d’intégration avec Jest et React Testing Library
- Tests end-to-end (E2E) avec Cypress
- Suivi de couverture de code via Codecov
- Génération automatique de documentation technique avec JSDoc
- Workflow CI/CD GitHub Actions pour build, tests et déploiement sur GitHub Pages
- Gestion d’état global pour la liste des utilisateurs et persistance via localStorage
- Création d'un package npm inclu dans la CI/CD



## Liens rapides

- Dépôt GitHub : https://github.com/PierreTDX/InteDepContinu
- Application déployée : https://pierretdx.github.io/InteDepContinu/
- Documentation technique (JSDoc) : https://pierretdx.github.io/InteDepContinu/docs/
- Tableau de bord Codecov : https://app.codecov.io/gh/PierreTDX/InteDepContinu
- Package NPM : https://www.npmjs.com/package/ptdx-ci-cd-ynov
- DockerHub : https://hub.docker.com/r/pierretdx/python-api

## Prérequis

- Node.js ≥ 20.x recommandé
- pnpm
- Git

## Installation et exécution en local

Clonez le dépôt :
```
git clone https://github.com/PierreTDX/InteDepContinu.git
```

Accédez au dossier de l’application :
```
cd app
```

Installez les dépendances :
```
pnpm install
```

Lancez l’application en mode développement :
```
pnpm run dev
```

Ouvrez votre navigateur à l’adresse indiquée par Vite (par défaut : http://localhost:5173)

L’application utilise React Router pour gérer plusieurs pages:

- Page d’accueil (/) : affiche un message de bienvenue, le compteur d’utilisateurs inscrits, et la liste des utilisateurs avec leur prénom et nom.
- Page Formulaire (/register) : contient le formulaire d’inscription.

L’état global de la liste des utilisateurs (persons) est remonté vers App.jsx (lift state up) pour que toutes les pages puissent accéder à la liste mise à jour.

La liste des utilisateurs est récupérée et ajoutée via l’API JSONPlaceholder (Axios).

Note : JSONPlaceholder ne persiste pas réellement les POST, la liste est donc simulée.

## Fonctionnalités clés

- Validation complète côté client : champs requis, email valide, code postal, ville, âge ≥ 18 ans, date de naissance non future et pas trop ancienne (>1900)
- Gestion des emails en double : le formulaire affiche une erreur si un email existe déjà
- Notifications toast (react-toastify) pour confirmer l’inscription réussie
- Sélecteurs data-cy robustes pour les tests E2E (firstName, lastName, email, birthDate, zip, city, submit, toast, back-home, user-count, user-list)

## Tests unitaires et d’intégration

Lancer tous les tests unitaires et d’intégration avec rapport de couverture:
```
pnpm run test
```

Les tests couvrent : validation des champs, intégration du formulaire et affichage des erreurs.

Les rapports sont générés dans app/coverage et envoyés automatiquement sur Codecov via GitHub Actions.

- Axios est mocké avec `jest.mock('axios')` pour isoler le front-end
- Les tests couvrent :
    - Succès (200/201)
    - Erreur métier (400) : email déjà existant
    - Crash serveur (500) : application ne plante pas
- Cas particuliers testés : noms incomplets ou vides, `existingEmails` non fourni

## Tests End-to-End (Cypress)

Le projet contient des scénarios E2E vérifiant la navigation et la cohérence des données.

- Routes GET /users et POST /users bouchonnées avec `cy.intercept`
- Scénarios testés :
    - Ajout d’un nouvel utilisateur valide
    - Email déjà existant → message d’erreur
    - Erreur serveur → alert, application ne plante pas
    - Retour à l’accueil → compteur et liste cohérents

### Scénario Nominal

- Navigation vers l’Accueil (/) → Vérifier 0 utilisateur inscrit et liste vide
- Cliquer sur “Inscription” → Navigation vers /register
- Ajouter un nouvel utilisateur valide → Vérifier toast de succès
- Retour à l’Accueil → Vérifier 1 utilisateur inscrit et affichage correct dans la liste

### Scénario d’Erreur

- Partant de 1 utilisateur déjà inscrit
- Navigation vers le formulaire → Tenter un ajout invalide (champ vide, email déjà utilisé, date trop ancienne)
- Vérifier l’affichage des messages d’erreur correspondants (INVALID_DATE, EMAIL_ALREADY_EXISTS, etc.)
- Retour à l’Accueil → Vérifier que la liste et le compteur restent inchangés

### Lancer les tests E2E
```
pnpm run cypress
```

## Documentation technique

La documentation est générée automatiquement avec JSDoc à chaque build CI/CD.

Pour la générer manuellement :
```
cd app  
pnpm run doc
```

## Pipeline CI/CD

- Build de l’application via Vite
- Exécution des tests unitaires, d’intégration et E2E (Cypress headless)
- Aucun appel réseau réel : Axios mocké en tests unitaires et cy.intercept en E2E
- Upload des rapports de couverture vers Codecov
- Déploiement sur GitHub Pages si tous les tests passent.

## Backend (API Python & MySQL)

Ce projet inclut également une API Python (FastAPI) conteneurisée connectée à une base de données MySQL.

### Architecture
- **API** : FastAPI (Python 3.10-slim)
- **Base de données** : MySQL 8.0
- **Orchestration** : Docker Compose

### Pipeline CI/CD (GitHub Actions)
Un job spécifique `build-test-deploy-api` a été ajouté pour :
1. Builder les images Docker (API et MySQL).
2. Lancer la stack dans un réseau Docker isolé.
3. Attendre l'initialisation de la base de données.
4. Exécuter un test d'intégration (curl) pour valider l'endpoint `/users`.
5. Pousser l'image de l'API sur Docker Hub uniquement si le test réussit.

### Exécution locale

#### Option 1 : Docker Compose (Recommandé)

Pour lancer la stack complète (Base de données + API) :

```bash
docker compose up -d
```

Pour voir les logs :
```bash
docker compose logs -f
```

Pour arrêter la stack :
```bash
docker compose down
```

#### Option 2 : Commandes Docker manuelles

Si vous souhaitez lancer les conteneurs individuellement :

1. **Créer le réseau**
   ```bash
   docker network create stack-net
   ```

2. **Configuration**
   Créez un fichier `.env` à la racine (copiez `.env.example`) et ajustez les valeurs :
   ```bash
   cp .env.example .env
   ```

3. **Builder et lancer MySQL**
   ```bash
   docker build -t my-mysql .
   # Note : On utilise le .env mais on surcharge MYSQL_USER (à vide) pour éviter le conflit avec le compte root existant
   docker run -d --name mysql-container --network stack-net --env-file .env -e MYSQL_USER= my-mysql
   ```

4. **Builder et lancer l'API**
   ```bash
   docker build -t my-api ./server
   # Note : On charge les variables du .env
   docker run -d --name api-container --network stack-net --env-file .env -p 8000:8000 my-api
   ```

#### Nettoyage (Option 2)

Pour arrêter et supprimer les conteneurs ainsi que le réseau manuel :
```bash
docker stop api-container mysql-container
docker rm api-container mysql-container
docker network rm stack-net
```

### Vérification de la base de données

Pour accéder directement à la base de données dans le conteneur :

```bash
docker exec -it mysql-container bash
mysql -u root -p
# Entrez le mot de passe (ex: ynovpwd)
```

Commandes SQL utiles :
```sql
show databases;
use ynov_ci;
show tables;
select * from utilisateur;
select * from admin;
exit
```