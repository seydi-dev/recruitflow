describe('Create job', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it('should create a new job and redirect to jobs list', () => {
    cy.intercept('POST', '**/jobs', (req) => {
      expect(req.body.title).to.eq('Développeur Full-Stack .NET / Angular');
      expect(req.body.department).to.eq('Technologies de l’information');
      expect(req.body.location).to.eq('Montréal, QC');
      expect(req.body.status).to.eq('Published');
      expect(req.body.salaryMin).to.eq(85000);
      expect(req.body.salaryMax).to.eq(110000);

      req.reply({
        statusCode: 200,
        body: {
          id: 'job-new',
          ...req.body,
          postedAt: new Date().toISOString(),
          createdByFullName: 'Admin User',
          applicationCount: 0
        }
      });
    }).as('createJob');

    cy.visit('/jobs/new');

    cy.contains(/nouvelle offre/i).should('exist');

    cy.get('input[formcontrolname="title"]').type('Développeur Full-Stack .NET / Angular');
    cy.get('input[formcontrolname="department"]').type('Technologies de l’information');
    cy.get('input[formcontrolname="location"]').type('Montréal, QC');
    cy.get('textarea[formcontrolname="description"]').type(
      'Nous recherchons un développeur full-stack capable de travailler sur Angular 19, ASP.NET Core 8 et PostgreSQL.'
    );

    cy.get('select[formcontrolname="status"]').select('Published');
    cy.get('input[formcontrolname="salaryMin"]').type('85000');
    cy.get('input[formcontrolname="salaryMax"]').type('110000');

    cy.contains('button', /publier l'offre|mettre à jour/i).click();

    cy.wait('@createJob');
    cy.url().should('include', '/jobs');
  });
});
