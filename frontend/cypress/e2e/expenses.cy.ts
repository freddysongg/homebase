describe('Expense Page - Create and Mark Expense as Settled', () => {
  beforeEach(() => {
    cy.visit('/login');

    cy.get('input[type="email"]').type('cypress@email.com');
    cy.get('input[type="password"]').type('cypress');
    cy.get('button').contains('Login').click();

    cy.url().should('include', '/homes');
    cy.contains('User').should('be.visible');

    cy.visit('/expense');
    cy.url().should('include', '/expense');
    cy.contains('Expenses').should('be.visible');
  });

  it('should create an expense and mark it as settled', () => {
    cy.intercept('POST', 'http://localhost:5001/api/expenses').as('addExpense');
    cy.intercept('PUT', 'http://localhost:5001/api/expenses/*').as('markAsSettled');

    cy.get('input[placeholder="Title"]').type('Test Utility Bill');
    cy.get('input[placeholder="Description (optional)"]').type('March electricity bill');
    cy.get('input[placeholder="Total Amount"]').type('150');
    cy.get('input[type="date"]').type('2025-04-01');

    cy.get('select').eq(0).select('Cypress');

    cy.get('select').eq(1).select('utilities');

    cy.get('button').contains('+ Add User').click();
    cy.get('select').eq(2).select('Cypress'); 

    cy.get('button').contains('Submit Expense').click();

    cy.wait('@addExpense').its('response.statusCode').should('eq', 201);

    cy.contains('Test Utility Bill').should('be.visible');
    cy.contains('March electricity bill').should('be.visible');
    cy.contains('$150').should('be.visible');
    cy.contains('Status: pending').should('be.visible');

    cy.get('button').contains('Mark as Settled').click();

    cy.wait('@markAsSettled').its('response.statusCode').should('eq', 200);

    cy.contains('Status: paid').should('be.visible');
  });
});
