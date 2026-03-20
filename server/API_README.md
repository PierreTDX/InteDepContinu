# Backend API - InteDepContinu

Cette API RESTful a été développée avec **FastAPI** (Python) pour gérer le backend de l'application. Elle se connecte à une base de données **MySQL** pour assurer la persistance des utilisateurs.

## 🛠 Stack Technique

- **Langage** : Python 3.12
- **Framework** : FastAPI
- **Base de données** : MySQL 
- **Connecteur DB** : `mysql-connector-python`
- **Serveur ASGI** : Uvicorn
- **Validation des données** : Pydantic
- **Conteneurisation** : Docker & Docker Compose

## 🚀 Lancement Rapide (Recommandé avec Docker)

L'API est configurée pour fonctionner de pair avec le conteneur MySQL défini à la racine du projet. Depuis le **dossier racine** (pas dans ce dossier `server/`), exécutez :

```bash
docker compose up -d db api
```

L'API sera accessible sur : **http://localhost:8000**

La documentation interactive (Swagger UI) générée automatiquement par FastAPI est disponible sur :
👉 **http://localhost:8000/docs**

## ⚙️ Variables d'Environnement

L'API utilise les variables d'environnement suivantes (automatiquement injectées via le fichier `docker-compose.yml` ou un fichier `.env` local) :

- `MYSQL_HOST` : L'hôte de la base de données (ex: `db` dans Docker, ou `127.0.0.1` en local)
- `MYSQL_USER` : Utilisateur MySQL
- `MYSQL_ROOT_PASSWORD` : Mot de passe de la base de données
- `MYSQL_DATABASE` : Nom de la base (ex: `ynov_ci`)

## 📡 Routes de l'API

### 1. Récupérer tous les utilisateurs
**`GET /users`**

- **Réponse (200 OK)** : 
  ```json
  {
    "utilisateurs": [
      {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "birthDate": "1990-01-01",
        "zip": "75001",
        "city": "Paris"
      }
    ]
  }
  ```

### 2. Créer un utilisateur
**`POST /users`**

- **Body (JSON)** attendu :
  ```json
  {
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane@example.com",
    "birthDate": "1995-12-25T00:00:00.000Z",
    "zip": "69000",
    "city": "Lyon"
  }
  ```
- **Réponse (201 Created)** : Retourne l'utilisateur créé avec son `id` assigné.
- **Erreur (400 Bad Request)** : `{"message": "EMAIL_ALREADY_EXISTS"}` si l'email est déjà présent en base.
- **Erreur (500 Internal Error)** : `{"message": "SERVER_ERROR"}` en cas de problème côté serveur.

### 3. Supprimer un utilisateur
**`DELETE /users/{user_id}`**

- **Réponse (200 OK)** : `{"message": "USER_DELETED"}`
- **Erreur (404 Not Found)** : `{"message": "USER_NOT_FOUND"}` si l'utilisateur avec cet ID n'existe pas.
- **Erreur (500 Internal Error)** : `{"message": "SERVER_ERROR"}` en cas d'erreur de base de données.

## 💻 Lancement Local (Sans Docker)

Si vous souhaitez développer sur l'API sans passer par Docker, assurez-vous d'avoir une instance MySQL locale accessible, puis exécutez ces commandes depuis le dossier `server/` :

```bash
# Installation des dépendances
pip install -r requirements.txt

# Lancement avec Hot-Reload
uvicorn main:app --reload --port 8000
```