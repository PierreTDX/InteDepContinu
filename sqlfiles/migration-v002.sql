USE ynov_ci;

CREATE TABLE IF NOT EXISTS utilisateur
(
    id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    birth_date DATE,
    zip_code VARCHAR(5),
    city VARCHAR(255)
);
DESCRIBE utilisateur;