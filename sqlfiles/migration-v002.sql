USE ynov_ci;

CREATE TABLE IF NOT EXISTS utilisateur
(
    id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    birthDate DATE,
    zip VARCHAR(5),
    city VARCHAR(255)
);
DESCRIBE utilisateur;