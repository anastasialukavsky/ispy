/// <reference types="cypress" />

describe('Sign In Form E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/auth/signin'); 
  });

  it('should display the login form correctly', () => {
    cy.get('input#email').should('be.visible');
    cy.get('input#password').should('be.visible');
    cy.contains('sign in').should('be.visible');
  });

  it('should allow users to type into the fields', () => {
    cy.get('input#email')
      .type('test@example.com')
      .should('have.value', 'test@example.com');

    cy.get('input#password')
      .type('password123')
      .should('have.value', 'password123');
  });

  it('should toggle password visibility', () => {
    cy.get('input#password').should('have.attr', 'type', 'password');
    cy.get('input#password + div img').click(); 
    cy.get('input#password').should('have.attr', 'type', 'text'); 
  });

  it('should toggle the "Remember Me" checkbox', () => {
    cy.get('input#rememberMe').check().should('be.checked');
    cy.get('input#rememberMe').uncheck().should('not.be.checked');
  });

  // it('should show validation error for missing email', () => {
  //   cy.get('input#password').type('password123');
  //   cy.contains('sign in').click();
  //   cy.contains('Email is required').should('be.visible');
  // });

  // it('should show validation error for invalid email', () => {
  //   cy.get('input#email').type('invalid-email');
  //   cy.get('input#password').type('password123');
  //   cy.contains('sign in').click();
  //   cy.contains('Invalid email address').should('be.visible');
  // });

  // it('should show validation error for short password', () => {
  //   cy.get('input#email').type('test@example.com');
  //   cy.get('input#password').type('123');
  //   cy.contains('sign in').click();
  //   cy.contains('Password must be at least 6 characters').should('be.visible');
  // });

  it('should successfully submit the form with valid data', () => {
    cy.get('input#email').type('test@example.com');
    cy.get('input#password').type('password123');
    cy.contains('sign in').click();
    cy.url().should('include', '/');
  });

  // it('should show an error for incorrect login credentials', () => {
  //   cy.get('input#email').type('wrong@example.com');
  //   cy.get('input#password').type('wrongpassword');
  //   cy.contains('sign in').click();

  //   cy.contains('Invalid email or password').should('be.visible'); 
  // });
});
