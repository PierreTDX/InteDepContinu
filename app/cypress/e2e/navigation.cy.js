describe("Navigation and User Registration E2E Tests", () => {

    const newUser = {
        firstName: "Théo",
        lastName: "Lafond",
        email: "theo@example.com",
        birthDate: "2001-09-02",
        zip: "03100",
        city: "Montluçon"
    };

    // const apiUser = {
    //     id: 11,
    //     name: "Théo Lafond",
    //     username: "TheoL",
    //     email: "theo@example.com",
    //     birthDate: "2001-09-02",
    //     address: {
    //         street: "1 Rue de Test",
    //         suite: "Apt 101",
    //         city: "Montluçon",
    //         zipcode: "03100"
    //     }
    // };

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
    });

});