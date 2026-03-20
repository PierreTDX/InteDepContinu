describe("Navigation and User Registration E2E Tests", () => {

    const newUser = {
        firstName: "Théo",
        lastName: "Lafond",
        email: "theo@example.com",
        birthDate: "2001-09-02",
        zip: "03100",
        city: "Montluçon"
    };

    const apiUser = {
        id: 11,
        name: "Théo Lafond",
        username: "TheoL",
        email: "theo@example.com",
        birthDate: "2001-09-02",
        address: {
            street: "1 Rue de Test",
            suite: "Apt 101",
            city: "Montluçon",
            zipcode: "03100"
        }
    };

    beforeEach(() => {
        cy.visit("/");
    });

    context("Nominal Scenario: Add a valid user", () => {
        it("should allow a user to register successfully", () => {
            // GET /users → empty list (supports both API and mock mode with wildcards)
            cy.intercept('GET', '**/users', {
                statusCode: 200,
                body: []
            }).as('getUsers');

            // POST /users → success (supports both API and mock mode)
            cy.intercept('POST', '**/users', {
                statusCode: 201,
                body: newUser
            }).as('createUser');

            cy.wait('@getUsers');

            cy.get('[data-cy=user-count]').should("contain", "0");
            cy.get('[data-cy=user-list]').should("not.exist");

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

            cy.get('[data-cy=user-count]').should("contain", "1");
            cy.get('[data-cy=user-list]').should("contain", `${newUser.firstName} ${newUser.lastName}`);
        });
    });

    context("Error Scenario: Email already exists (400)", () => {
        it("should display EMAIL_ALREADY_EXISTS error", () => {
            // Existing user
            cy.intercept('GET', '**/users', {
                statusCode: 200,
                body: [apiUser]
            }).as('getUsers');

            // POST /users → 400 error
            cy.intercept('POST', '**/users', {
                statusCode: 400,
                body: { message: "EMAIL_ALREADY_EXISTS" }
            }).as('createUserFail');

            cy.wait('@getUsers');

            cy.get('[data-cy=user-count]').should("contain", "1");

            cy.get('[data-cy=nav-register]').click();
            cy.url().should("include", "/register");

            // Fill form with existing email
            cy.get('[data-cy=firstName]').type("Jean");
            cy.get('[data-cy=lastName]').type("Dupont");
            cy.get('[data-cy=email]').type("fake@gmail.com");
            cy.get('[data-cy=birthDate]').type("1995-05-10");
            cy.get('[data-cy=zip]').type("75000");
            cy.get('[data-cy=city]').type("Paris");

            cy.get('[data-cy=submit]').click();

            cy.wait('@createUserFail');

            // Should display error
            cy.contains("Cet email est déjà utilisé").should("be.visible");

            // Back home
            cy.get('[data-cy=back-home]').click();
            cy.get('[data-cy=user-count]').should("contain", "1");
        });
    });

    context("Error Scenario: Server crash (500)", () => {
        it("should display alert and not crash app", () => {
            // GET /users → empty list
            cy.intercept('GET', '**/users', {
                statusCode: 200,
                body: []
            }).as('getUsers');

            // POST /users → server error 500
            cy.intercept('POST', '**/users', {
                statusCode: 500
            }).as('createUserFail');

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
            let currentUsers = [apiUser];

            // Intercept GET to return dynamic user list
            cy.intercept('GET', '**/users', (req) => {
                req.reply({ statusCode: 200, body: currentUsers });
            }).as('getUsers');

            // Intercept DELETE
            cy.intercept('DELETE', '**/users/*', (req) => {
                currentUsers = []; // Clear the mock DB so the reload fetches an empty list
                req.reply({ statusCode: 200, body: { message: "USER_DELETED" } });
            }).as('deleteUser');

            // Force visit to trigger the new intercepts reliably
            cy.visit("/");
            cy.wait('@getUsers');

            cy.get('[data-cy=user-count]').should("contain", "1");

            // Click delete button
            cy.get('.delete-button').click();

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

            // Verify user count is updated
            cy.get('[data-cy=user-count]').should("contain", "0");
            cy.get('[data-cy=user-list]').should("not.exist");
        });
    });

});