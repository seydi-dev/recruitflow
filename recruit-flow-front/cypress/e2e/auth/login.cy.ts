describe('Login flow', () => {
  beforeEach(() => {
    cy.visit('/auth/login');
  });

  it('should login successfully as admin', () => {
    cy.intercept('POST', '**/auth/login').as('loginRequest');

    cy.get('input[type="email"]').type('admin@recruitflow.dev');
    cy.get('input[type="password"]').type('Admin123!');

    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest')
      .its('response.statusCode')
      .should('eq', 200);

    cy.url().should('include', '/dashboard');

    cy.window().then((win) => {
      expect(win.localStorage.getItem('access_token')).to.not.be.null;
      expect(win.localStorage.getItem('user_info')).to.not.be.null;
    });
  });
});
