describe('Kanban drag and drop', () => {
  beforeEach(() => {
    cy.loginAsAdmin();

    cy.intercept('GET', '**/applications?page=1&pageSize=100', {
      statusCode: 200,
      body: {
        items: [
          {
            id: 'app-1',
            status: 'Pending',
            candidateFullName: 'Alice Tremblay',
            candidateEmail: 'alice@example.com',
            jobTitle: 'Développeur .NET',
            appliedAt: '2026-03-25T12:00:00Z'
          },
          {
            id: 'app-2',
            status: 'Interview',
            candidateFullName: 'Marc Gagnon',
            candidateEmail: 'marc@example.com',
            jobTitle: 'Développeur Angular',
            appliedAt: '2026-03-24T12:00:00Z'
          }
        ]
      }
    }).as('loadApplications');

    cy.intercept('PATCH', '**/applications/app-1/status', (req) => {
      expect(req.body).to.deep.equal({ status: 'Reviewing' });
      req.reply({
        statusCode: 200,
        body: { success: true }
      });
    }).as('updateApplicationStatus');

    cy.visit('/applications');
    cy.wait('@loadApplications');
  });

  it('should move an application from Pending to Reviewing', () => {
    cy.contains('.kb-card', 'Alice Tremblay').as('dragCard');

    cy.get('.kb-col')
      .contains('.kb-col-name', 'Screening')
      .parents('.kb-col')
      .as('targetColumn');

    cy.window().then((win) => {
      const dataTransfer = new win.DataTransfer();

      cy.get('@dragCard').trigger('dragstart', { dataTransfer });
      cy.get('@targetColumn').trigger('dragover', { dataTransfer });
      cy.get('@targetColumn').trigger('drop', { dataTransfer });
      cy.get('@dragCard').trigger('dragend', { dataTransfer });
    });

    cy.wait('@updateApplicationStatus');

    cy.get('@targetColumn').within(() => {
      cy.contains('.kb-card', 'Alice Tremblay').should('exist');
    });
  });
});
