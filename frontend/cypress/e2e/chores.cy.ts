describe('Chores Page - Add and Complete Chore', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('cypress@email.com');
    cy.get('input[type="password"]').type('cypress');
    cy.get('button').contains('Login').click();
    cy.url().should('include', '/homes');
    cy.contains('User').should('be.visible');

    cy.visit('/chore');
    cy.url().should('include', '/chore');
    cy.contains('Chore Management').should('be.visible');
  });

  it('should create a new chore and mark it as completed', () => {
    cy.intercept('POST', 'http://localhost:5001/api/chores').as('addChore');
    cy.intercept('PUT', 'http://localhost:5001/api/chores/*').as('markChoreCompleted');

    cy.get('input[placeholder="Chore Title"]').type('Take Out Trash');
    cy.get('textarea[placeholder="Description (optional)"]').type('Take out the trash before 8 PM');
    cy.get('input[type="date"]').type('2025-04-01');
    cy.get('select').select('Cypress');

    cy.get('button').contains('Add Chore').click();
    cy.wait('@addChore').its('response.statusCode').should('eq', 201);

    cy.contains('Take Out Trash').should('be.visible');
    cy.contains('Take out the trash before 8 PM').should('be.visible');
    cy.contains('Status: Pending').should('be.visible');

    cy.get('button').contains('Mark as Completed').click();
    cy.wait('@markChoreCompleted').its('response.statusCode').should('eq', 200);
    cy.contains('Status: Completed').should('be.visible');
  });
});
