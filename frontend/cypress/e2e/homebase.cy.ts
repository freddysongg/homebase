describe('HomeBase App Navigation and Backend Check', () => {
  it('should confirm the backend is running on localhost:5001', () => {
    cy.request('http://localhost:5001').its('status').should('eq', 200);
  });

  it('should load the homepage', () => {
    cy.visit('/');
    cy.contains('HomeBase').should('be.visible');
  });

    beforeEach(() => {
    cy.visit('/login');

    cy.get('input[type="email"]').type('cypress@email.com');
    cy.get('input[type="password"]').type('cypress');
    cy.get('button').contains('Login').click();

    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard').should('be.visible');
    });

  it('should navigate to the Homes page', () => {
    cy.visit('/homes');
    cy.url().should('include', '/homes');
    cy.contains('Homes').should('be.visible');
  });

  it('should navigate to the Expense page', () => {
    cy.visit('/expense');
    cy.url().should('include', '/expense');
    cy.contains('Expenses').should('be.visible');
  });

  it('should navigate to the Chores page', () => {
    cy.visit('/chore');
    cy.url().should('include', '/chore');
    cy.contains('Chores').should('be.visible');
  });
});
