/**
 * @file navigation.cy.js
 * 
 * Tests the application's End-to-End user flows including registration, 
 * error handling (e.g., existing email, server crash), and user deletion.
 */

describe("Navigation and User Registration E2E Tests", () => {

    const newUser = {
        firstName: "Théo",
        lastName: "Lafond",
        email: "theo@example.com",
        birthDate: "2001-09-02",
        zip: "03100",
        city: "Montluçon"
    };

    beforeEach(() => {
        cy.visit("/");
    });

    context("Nominal Scenario: Add a valid user", () => {
        it("should allow a user to register successfully", () => {
            cy.intercept('GET', '**/users').as('getUsers');

            cy.intercept('POST', '**/users').as('createUser');

            cy.wait('@getUsers');

            // En condition réelle, la BDD CI contient l'utilisateur du script SQL (Fenoll)
            cy.get('[data-cy=user-count]').should("not.contain", "0");

            // Navigate to register
            cy.get('[data-cy=nav-register]').click();
            cy.url().should("include", "/register");

            // Fill form
            cy.get('[data-cy=firstName]').type(newUser.firstName);
            cy.get('[data-cy=lastName]').type(newUser.lastName);
            cy.get('[data-cy=email]').type(newUser.email);
            cy.get('[data-cy=birthDate]').type(newUser.birthDate);
            cy.get('[data-cy=zip]').type(newUser.zip);
            cy.get('[data-cy=city]').type(newUser.city);

            cy.get('[data-cy=submit]').click();

            cy.wait('@createUser');

            cy.get('#success-toast').should('be.visible')
                .and('contain.text', "Enregistré avec succès");

            // Back home
            cy.get('[data-cy=back-home]').click();
            cy.url().should("eq", Cypress.config().baseUrl);

            cy.get('[data-cy=user-list]').should("contain", `${newUser.firstName} ${newUser.lastName}`);
        });
    });

    context("Error Scenario: Email already exists (400)", () => {
        it("should display EMAIL_ALREADY_EXISTS error", () => {
            cy.intercept('GET', '**/users').as('getUsers');

            cy.wait('@getUsers');

            cy.get('[data-cy=nav-register]').click();
            cy.url().should("include", "/register");

            // Fill form with the email created in the first test
            cy.get('[data-cy=firstName]').type("Jean");
            cy.get('[data-cy=lastName]').type("Dupont");
            cy.get('[data-cy=email]').type(newUser.email);
            cy.get('[data-cy=birthDate]').type("1995-05-10");
            cy.get('[data-cy=zip]').type("75000");
            cy.get('[data-cy=city]').type("Paris");

            cy.get('[data-cy=submit]').click();

            // Should display error
            cy.contains("Cet email est déjà utilisé").should("be.visible");

            // Back home
            cy.get('[data-cy=back-home]').click();
            cy.get('[data-cy=user-list]').should("not.contain", "Jean Dupont");
        });
    });

    context("Error Scenario: Server crash (500)", { tags: ['@api-down'] }, () => {
        it("should display alert and not crash app", () => {
            // GET /users → server error 500
            cy.intercept('GET', '**/users', { statusCode: 500 }).as('getUsers');

            // POST /users → server error 500
            cy.intercept('POST', '**/users', { statusCode: 500 }).as('createUserFail');

            cy.wait('@getUsers');

            cy.get('[data-cy=nav-register]').click();

            cy.get('[data-cy=firstName]').type("Alice");
            cy.get('[data-cy=lastName]').type("Durand");
            cy.get('[data-cy=email]').type("alice@example.com");
            cy.get('[data-cy=birthDate]').type("1998-01-01");
            cy.get('[data-cy=zip]').type("75001");
            cy.get('[data-cy=city]').type("Paris");

            cy.get('[data-cy=submit]').click();
            cy.wait('@createUserFail');

            cy.get('.toast-server-error')
                .should('be.visible')
                .and('contain.text', "Serveur indisponible, réessayez plus tard");

            // Back home works
            cy.get('[data-cy=back-home]').click();
            cy.get('[data-cy=user-count]').should("contain", "0");
        });
    });

    context("Scenario: Delete a user", () => {
        it("should delete a user, display success toast and update the list", () => {
            cy.intercept('GET', '**/users').as('getUsers');

            cy.intercept('DELETE', '**/users/*').as('deleteUser');

            cy.visit("/");
            cy.wait('@getUsers');

            // Target the specific user created in the first test
            cy.contains('li', `${newUser.firstName} ${newUser.lastName}`)
                .find('.delete-button')
                .click();

            // Modal should appear
            cy.get('.modal-content').should('be.visible')
                .and('contain.text', 'Confirmer la suppression');

            // Confirm deletion
            cy.get('.btn-confirm').click();
            cy.wait('@deleteUser');

            // Check toast
            cy.contains("Utilisateur supprimé avec succès").should("be.visible");

            // Wait for the app to reload (1.5s timeout in component)
            cy.wait('@getUsers', { timeout: 4000 });

            cy.get('[data-cy=user-list]').should("not.contain", newUser.email);
        });

        it("should display a server error toast if deletion fails (500)", { tags: ['@api-down'] }, () => {

            const mockUsers = [
                {
                    id: 1,
                    firstName: "Théo",
                    lastName: "Lafond",
                    email: "theo@example.com"
                }
            ];

            // Mock GET → because API down (simulate API up fisrt, and down after)
            cy.intercept('GET', '**/users', {
                statusCode: 200,
                body: mockUsers
            }).as('getUsers');

            // Mock DELETE → erreur 500
            cy.intercept('DELETE', '**/users/*', {
                statusCode: 500
            }).as('deleteUserFail');

            cy.visit("/");
            cy.wait('@getUsers');

            cy.contains('li', "Théo Lafond").find('.delete-button').click();
            cy.get('.btn-confirm').click();

            cy.wait('@deleteUserFail');

            cy.contains("Serveur indisponible, réessayez plus tard").should("be.visible");

            cy.get('[data-cy=user-list]').should("contain", "Théo Lafond");
        });

        it("should display a warning and remove user if not found on server (404)", () => {
            const staleUser = {
                firstName: "Théo",
                lastName: "Lafond",
                email: `theo.404@example.com`,
                birthDate: "2001-09-02",
                zip: "03100",
                city: "Montluçon"
            };

            cy.intercept('GET', '**/users').as('getUsers');
            cy.intercept('DELETE', '**/users/*').as('deleteUser');

            // create user directly via API to ensure it exists for the test, then delete it to simulate 404 on UI delete
            cy.request('POST', 'http://127.0.0.1:8000/users', staleUser).then((response) => {
                const createdUserId = response.body.id;

                cy.visit("/");
                cy.wait('@getUsers');

                cy.contains('li', "Théo Lafond").should('exist');

                // delete user directly to simulate 404 when UI tries to delete it
                cy.request('DELETE', `http://127.0.0.1:8000/users/${createdUserId}`);

                cy.contains('li', "Théo Lafond").find('.delete-button').click();
                cy.get('.btn-confirm').click();

                cy.wait('@deleteUser').its('response.statusCode').should('eq', 404);

                cy.contains("Utilisateur introuvable").should("be.visible");

            });
        });

    });

});