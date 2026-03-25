Cypress.Commands.add('loginAsAdmin', () => {
  cy.request('POST', 'http://localhost:5072/api/auth/login', {
    email: 'admin@recruitflow.dev',
    password: 'Admin123!'
  }).then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body.accessToken).to.exist;
    expect(response.body.user).to.exist;

    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('access_token', response.body.accessToken);
        win.localStorage.setItem('user_info', JSON.stringify(response.body.user));
      }
    });
  });
});

Cypress.Commands.add('loginAsAdminUi', () => {
  cy.visit('/auth/login');

  cy.get('input[type="email"]').type('admin@recruitflow.dev');
  cy.get('input[type="password"]').type('Admin123!');
  cy.contains('button', /connexion|login/i).click();

  cy.url().should('include', '/dashboard');
});

declare global {
  namespace Cypress {
    interface Chainable {
      loginAsAdmin(): Chainable<void>;
      loginAsAdminUi(): Chainable<void>;
    }
  }
}

export {};
