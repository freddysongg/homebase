describe('Expense Page - Create and Mark Expense as Settled', () => {
  beforeEach(() => {
    cy.visit('/login');

    cy.get('input[type="email"]').type('cypress@email.com');
    cy.get('input[type="password"]').type('cypress');
    cy.get('button').contains('Login').click();

    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard').should('be.visible');

    cy.visit('/expense');
    cy.url().should('include', '/expense');
    cy.contains('Expenses').should('be.visible');
  });

  it('should render the Expense form correctly', () => {
    // Check if the form fields are visible
    cy.get('input[name="title"]').should('be.visible');
    cy.get('input[name="amount"]').should('be.visible');
    cy.get('select[name="category"]').should('be.visible');
    cy.get('input[name="due_date"]').should('be.visible');
    cy.get('select[name="paid_by"]').should('be.visible');

    // Check if the split options buttons are visible
    cy.contains('button', 'Split Evenly').should('be.visible');
    cy.contains('button', 'Manual Split').should('be.visible');
  });

  it('should add a new expense', () => {
    // Fill out the form
    cy.get('input[name="title"]').type('Groceries');
    cy.get('input[name="amount"]').type('100');
    cy.get('select[name="category"]').select('groceries');
    cy.get('input[name="due_date"]').type('2023-12-31');
    cy.get('select[name="paid_by"]').select('Alice'); // Replace 'Alice' with a valid user name

    // Select users to split with
    cy.contains('button', 'Alice').click(); // Replace 'Alice' with a valid user name

    // Submit the form
    cy.contains('button', 'Add Expense').click();

    // Verify the new expense appears in the table
    cy.get('table').should('contain', 'Groceries');
    cy.get('table').should('contain', '$100.00');
    cy.get('table').should('contain', 'groceries');
    cy.get('table').should('contain', '12/31/2023'); // Adjust date format as needed
  });

  it('should mark an expense as paid', () => {
    // Find the first expense in the table and click the "Mark as Paid" button
    cy.get('table')
      .find('tr')
      .eq(1) // Skip the header row
      .within(() => {
        cy.contains('button', 'Mark as Paid').click();
      });

    // Verify the status changes to "Paid"
    cy.get('table')
      .find('tr')
      .eq(1)
      .within(() => {
        cy.get('span').contains('Paid').should('be.visible');
      });
  });

  it('should split expenses evenly', () => {
    // Fill out the form
    cy.get('input[name="title"]').type('Rent');
    cy.get('input[name="amount"]').type('1000');
    cy.get('select[name="category"]').select('rent');
    cy.get('input[name="due_date"]').type('2023-12-31');
    cy.get('select[name="paid_by"]').select('Cypress'); 

    // Select users to split with
    cy.contains('button', 'Cypress').click(); 
    cy.contains('button', 'Cypress 2').click(); 

    // Click "Split Evenly"
    cy.contains('button', 'Split Evenly').click();

    // Verify the split amounts
    cy.get('input[value="500.00"]').should('be.visible'); // 1000 / 2 = 500
  });

  it('should split expenses manually', () => {
    // Fill out the form
    cy.get('input[name="title"]').type('Utilities');
    cy.get('input[name="amount"]').type('200');
    cy.get('select[name="category"]').select('utilities');
    cy.get('input[name="due_date"]').type('2023-12-31');
    cy.get('select[name="paid_by"]').select('Alice'); // Replace 'Alice' with a valid user name

    // Select users to split with
    cy.contains('button', 'Alice').click(); // Replace 'Alice' with a valid user name
    cy.contains('button', 'Bob').click(); // Replace 'Bob' with a valid user name

    // Click "Manual Split"
    cy.contains('button', 'Manual Split').click();

    // Enter manual split amounts
    cy.get('input[placeholder="0.00"]').eq(0).type('150');
    cy.get('input[placeholder="0.00"]').eq(1).type('50');

    // Verify the split total
    cy.contains('span', 'Split Total: $200.00').should('be.visible');
  });

});
